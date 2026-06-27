import os
import sys
import json
import uuid
import asyncio
import logging
from pathlib import Path
from typing import Dict, Optional
from concurrent.futures import ThreadPoolExecutor
from fastapi.responses import FileResponse

# ---------------------------------------------------------------------------
# Load .env file from project root (one level above backend/)
# ---------------------------------------------------------------------------
try:
    from dotenv import load_dotenv
    _env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=_env_path)
except ImportError:
    pass  # python-dotenv not installed — fall back to system env vars

import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from ranking.rank_candidates import run_ranking_pipeline, clean_id, find_dataset_file
except ModuleNotFoundError:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ranking')))
    from rank_candidates import run_ranking_pipeline, clean_id, find_dataset_file

from backend.resume_parser import parse_resume, append_candidate_to_jsonl

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("ai-run")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
BASE_DIR      = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_DIR      = os.path.join(BASE_DIR, "data")
OUTPUTS_DIR   = os.path.join(BASE_DIR, "outputs")
JD_PATH       = os.path.join(DATA_DIR, "jd.txt")
JSONL_PATH    = os.path.join(DATA_DIR, "candidates.jsonl")
TOP100_PATH   = os.path.join(OUTPUTS_DIR, "top100.csv")

ALLOWED_RESUME_TYPES = {
    "application/pdf":  ".pdf",
    "image/jpeg":       ".jpg",
    "image/jpg":        ".jpg",
    "image/png":        ".png",
    "image/webp":       ".webp",
}
MAX_RESUME_SIZE_MB = 10

# ---------------------------------------------------------------------------
# Persistent Job Store (Redis/SQLite Fallback)
# ---------------------------------------------------------------------------
from backend.job_store import JobStore
_job_store = JobStore()
_executor = ThreadPoolExecutor(max_workers=2)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI-Run Candidate Screening API",
    description="FastAPI backend for AI-powered candidate ranking + resume ingestion",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request/Response schemas
# ---------------------------------------------------------------------------
class JobDescriptionUpdate(BaseModel):
    jd_text: str


# ---------------------------------------------------------------------------
# Helper: change CWD-safe path resolution
# ---------------------------------------------------------------------------
def _abs(relative_path: str) -> str:
    """Resolve a path relative to the project root, not the CWD."""
    return os.path.join(BASE_DIR, relative_path)


# ===========================================================================
# 1. Health Check
# ===========================================================================
@app.get("/api/health", tags=["System"])
def health_check():
    """
    Returns API health, dataset size, and model availability status.
    Use this to verify the API is alive before triggering expensive operations.
    """
    candidate_count = 0
    if os.path.exists(JSONL_PATH):
        with open(JSONL_PATH, "r", encoding="utf-8") as f:
            candidate_count = sum(1 for line in f if line.strip())

    groq_key_set = bool(os.getenv("GROQ_API_KEY"))

    try:
        from sentence_transformers import SentenceTransformer  # noqa: F401
        semantic_model_available = True
    except ImportError:
        semantic_model_available = False

    return {
        "status": "ok",
        "version": "2.0.0",
        "dataset": {
            "candidates_count": candidate_count,
            "jsonl_path": JSONL_PATH,
        },
        "models": {
            "groq_api_key_configured": groq_key_set,
            "semantic_reranker_available": semantic_model_available,
        },
    }


# ===========================================================================
# 2. Job Description CRUD
# ===========================================================================
@app.get("/api/job-description", tags=["Job Description"])
def get_job_description():
    """Retrieve the current job description from data/jd.txt."""
    if os.path.exists(JD_PATH):
        try:
            with open(JD_PATH, "r", encoding="utf-8") as f:
                return {"jd_text": f.read()}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read JD: {e}")
    return {"jd_text": ""}


@app.post("/api/job-description", tags=["Job Description"])
def update_job_description(payload: JobDescriptionUpdate):
    """Update the job description file (data/jd.txt)."""
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        with open(JD_PATH, "w", encoding="utf-8") as f:
            f.write(payload.jd_text)
        return {"status": "success", "message": "Job description updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write JD: {e}")


# ===========================================================================
# 3. Resume Upload → JSONL Conversion  (NEW FEATURE)
# ===========================================================================
@app.post("/api/resume/upload", tags=["Resume Ingestion"])
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a resume (PDF or image) and convert it to a structured JSONL candidate record.

    **Flow:**
    1. Validate file type & size.
    2. Extract text (PDF) or encode as base64 (image).
    3. Send to Groq LLM for structured extraction.
    4. Validate against candidate schema.
    5. Append to data/candidates.jsonl.

    **Supported formats:** PDF, JPG, JPEG, PNG, WEBP

    **Returns:** The parsed candidate profile + insertion status.
    """
    # --- Validate content type ---
    content_type = file.content_type or ""
    if content_type not in ALLOWED_RESUME_TYPES and not file.filename.lower().endswith(
        tuple(ALLOWED_RESUME_TYPES.values())
    ):
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported file type '{content_type}'. "
                f"Allowed types: PDF, JPG, JPEG, PNG, WEBP"
            ),
        )

    # --- Read & size-check file ---
    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_RESUME_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed: {MAX_RESUME_SIZE_MB} MB."
        )

    logger.info(f"Processing resume upload: {file.filename} ({size_mb:.2f} MB, {content_type})")

    # --- Parse resume using Groq ---
    try:
        candidate, raw_dict = parse_resume(
            file_bytes=file_bytes,
            filename=file.filename or "resume",
            groq_api_key=os.getenv("GROQ_API_KEY"),
        )
    except ImportError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error during resume parsing")
        raise HTTPException(status_code=500, detail=f"Resume parsing failed: {str(e)}")

    # --- Append to JSONL ---
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        inserted = append_candidate_to_jsonl(candidate, JSONL_PATH)
    except Exception as e:
        logger.exception("Failed to write candidate to JSONL")
        raise HTTPException(status_code=500, detail=f"Failed to save candidate: {str(e)}")

    return {
        "status": "success" if inserted else "duplicate_skipped",
        "message": (
            f"Candidate '{candidate.candidate_id}' added to dataset."
            if inserted
            else f"Candidate '{candidate.candidate_id}' already exists — skipped."
        ),
        "candidate_id": candidate.candidate_id,
        "preview": {
            "name": candidate.profile.current_title,
            "company": candidate.profile.current_company,
            "years_of_experience": candidate.profile.years_of_experience,
            "skills_count": len(candidate.skills),
            "jobs_count": len(candidate.career_history),
        },
        "full_profile": candidate.to_jsonl_dict(),
    }


# ===========================================================================
# 4. Async Ranking Pipeline  (IMPROVED)
# ===========================================================================
def _run_pipeline_job(job_id: str):
    """Run the pipeline in a thread and update the job store."""
    _job_store.set(job_id, "running")
    try:
        run_ranking_pipeline(base_dir=BASE_DIR)
        _job_store.set(job_id, "completed", "Ranking pipeline completed successfully.")
    except Exception as e:
        _job_store.set(job_id, "failed", str(e))
        logger.exception(f"Pipeline job {job_id} failed")


@app.post("/api/rank", tags=["Ranking"])
def trigger_ranking(background_tasks: BackgroundTasks):
    """
    Trigger the ranking pipeline asynchronously.
    Returns a job_id immediately — poll GET /api/rank/status/{job_id} for progress.
    """
    job_id = uuid.uuid4().hex[:10]
    _job_store.set(job_id, "queued", "")
    background_tasks.add_task(_run_pipeline_job, job_id)
    logger.info(f"Ranking pipeline queued. Job ID: {job_id}")
    return {
        "status": "queued",
        "job_id": job_id,
        "message": "Pipeline queued. Poll /api/rank/status/{job_id} for progress.",
    }


@app.get("/api/rank/status/{job_id}", tags=["Ranking"])
def get_rank_status(job_id: str):
    """Poll the status of a ranking pipeline job."""
    job = _job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return {"job_id": job_id, **job}


# ===========================================================================
# 5. Candidates (with pagination)
# ===========================================================================
@app.get("/api/candidates", tags=["Candidates"])
def get_candidates(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Results per page"),
    search: Optional[str] = Query(default=None, description="Search by candidate ID"),
):
    """
    Retrieve ranked candidates from outputs/top100.csv with pagination.
    Supports optional search query matching candidate_id.
    """
    if not os.path.exists(TOP100_PATH):
        raise HTTPException(
            status_code=404,
            detail="No ranking results found. POST /api/rank to trigger the pipeline first."
        )

    if os.path.exists(TOP100_PATH):
        try:
            df = pd.read_csv(TOP100_PATH)
            df["candidate_id"] = df["candidate_id"].apply(clean_id)
            
            # Apply search filter — 3-tier fallback: Top 100 → feature CSV → raw JSONL
            if search:
                search_clean = str(search).strip().lower()
                df = df[df["candidate_id"].str.lower().str.contains(search_clean, regex=False)]
                
                # Tier 2: search the entire candidate_features.csv (100k rows)
                if df.empty:
                    feature_csv = os.path.join(OUTPUTS_DIR, "candidate_features.csv")
                    if os.path.exists(feature_csv):
                        df_all = pd.read_csv(feature_csv)
                        df_all["candidate_id"] = df_all["candidate_id"].apply(clean_id)
                        matches = df_all[df_all["candidate_id"].str.lower().str.contains(search_clean, regex=False)]
                        
                        if not matches.empty:
                            try:
                                from ranking.scoring_engine import calculate_rule_score
                            except ImportError:
                                from scoring_engine import calculate_rule_score
                                
                            new_rows = []
                            for _, row in matches.iterrows():
                                rule_score = calculate_rule_score(row)
                                stuffer_mult = 0.25 if row.get("keyword_stuffer_flag", False) else 1.0
                                hp = float(row.get("honeypot_penalty", 0.0) or 0.0)
                                dp = float(row.get("duplicate_penalty", 0.0) or 0.0)
                                final_score = rule_score * stuffer_mult * (1.0 - hp) * (1.0 - dp)
                                new_rows.append({
                                    "candidate_id": row["candidate_id"],
                                    "rank": "N/A",
                                    "final_score": round(final_score, 6),
                                    "final_rule_score": round(final_score, 6),
                                    "semantic_score": 0.0,
                                    "title_score": float(row.get("title_score", 0.0) or 0.0),
                                    "career_score": float(row.get("career_score", 0.0) or 0.0),
                                    "skill_score": float(row.get("skill_score", 0.0) or 0.0),
                                    "experience_score": float(row.get("experience_score", 0.0) or 0.0),
                                    "product_company_score": float(row.get("product_company_score", 0.0) or 0.0),
                                    "behavior_score": float(row.get("behavior_score", 0.0) or 0.0),
                                    "location_score": float(row.get("location_score", 0.0) or 0.0),
                                    "keyword_stuffer_flag": bool(row.get("keyword_stuffer_flag", False)),
                                    "honeypot_flag": bool(row.get("honeypot_flag", False)),
                                    "duplicate_flag": bool(row.get("duplicate_flag", False)),
                                    "reasoning": "Candidate is in the database but did not place in the Top 100.",
                                })
                            df = pd.DataFrame(new_rows)
                
                # Tier 3: scan raw JSONL for candidates ingested after last pipeline run
                if df.empty and os.path.exists(JSONL_PATH):
                    try:
                        from preprocessing.feature_extractor import extract_features
                        from traps.keyword_stuffer import extract_jd_keywords
                        from traps.honeypot_detector import detect_honeypot
                        from traps.keyword_stuffer import detect_keyword_stuffer
                        try:
                            from ranking.scoring_engine import calculate_rule_score
                        except ImportError:
                            from scoring_engine import calculate_rule_score
                        
                        # Load feature CSV IDs so we know what's "new"
                        known_ids: set = set()
                        feature_csv = os.path.join(OUTPUTS_DIR, "candidate_features.csv")
                        if os.path.exists(feature_csv):
                            df_known = pd.read_csv(feature_csv, usecols=["candidate_id"])
                            known_ids = set(df_known["candidate_id"].apply(clean_id).tolist())
                        
                        jd_text = ""
                        if os.path.exists(JD_PATH):
                            with open(JD_PATH, "r", encoding="utf-8") as jf:
                                jd_text = jf.read()
                        jd_keywords = extract_jd_keywords(jd_text) if jd_text else set()
                        
                        new_rows = []
                        with open(JSONL_PATH, "r", encoding="utf-8") as jl:
                            for line in jl:
                                if not line.strip():
                                    continue
                                try:
                                    cand = json.loads(line)
                                    cid = clean_id(cand.get("candidate_id", ""))
                                    if cid in known_ids:
                                        continue  # already in features CSV
                                    if search_clean not in cid.lower():
                                        continue
                                    # Extract features on-the-fly
                                    features = extract_features(cand, jd_keywords)
                                    features["candidate_id"] = cid
                                    rule_score = calculate_rule_score(features)
                                    hp_result = detect_honeypot(cand)
                                    stuffer_result = detect_keyword_stuffer(cand, jd_keywords)
                                    stuffer_mult = 0.25 if stuffer_result.get("flag") else 1.0
                                    hp = float(hp_result.get("penalty", 0.0))
                                    final_score = rule_score * stuffer_mult * (1.0 - hp)
                                    new_rows.append({
                                        "candidate_id": cid,
                                        "rank": "NEW",
                                        "final_score": round(final_score, 6),
                                        "final_rule_score": round(rule_score, 6),
                                        "semantic_score": 0.0,
                                        "title_score": round(float(features.get("title_score", 0.0)), 4),
                                        "career_score": round(float(features.get("career_score", 0.0)), 4),
                                        "skill_score": round(float(features.get("skill_score", 0.0)), 4),
                                        "experience_score": round(float(features.get("experience_score", 0.0)), 4),
                                        "product_company_score": round(float(features.get("product_company_score", 0.0)), 4),
                                        "behavior_score": round(float(features.get("behavior_score", 0.0)), 4),
                                        "location_score": round(float(features.get("location_score", 0.0)), 4),
                                        "keyword_stuffer_flag": bool(stuffer_result.get("flag", False)),
                                        "honeypot_flag": bool(hp_result.get("flag", False)),
                                        "duplicate_flag": False,
                                        "reasoning": "Newly ingested candidate — run the pipeline to include in ranked results.",
                                    })
                                except Exception:
                                    pass
                        if new_rows:
                            df = pd.DataFrame(new_rows)
                    except Exception as e:
                        logger.warning(f"Tier-3 JSONL search failed: {e}")
            
            data = df.where(pd.notnull(df), None).to_dict(orient="records")

            # Apply pagination
            total = len(data)
            start = (page - 1) * limit
            end = start + limit
            paginated = data[start:end]

            return {
                "candidates": paginated,
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "pages": max(1, (total + limit - 1) // limit),
                },
            }
        except Exception as e:
            logger.exception("Failed to fetch candidates list")
            raise HTTPException(status_code=500, detail=f"Failed to parse CSV: {e}")

    return {"candidates": [], "pagination": {"page": 1, "limit": limit, "total": 0, "pages": 0}}


@app.get("/api/candidates/{candidate_id}", tags=["Candidates"])
def get_candidate_detail(candidate_id: str):
    """Retrieve the full raw candidate profile from candidates.jsonl."""
    dataset_path = JSONL_PATH if os.path.exists(JSONL_PATH) else find_dataset_file()
    if not dataset_path:
        raise HTTPException(status_code=404, detail="Dataset candidates.jsonl not found.")

    cleaned_target_id = clean_id(candidate_id)
    try:
        with open(dataset_path, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                candidate = json.loads(line)
                cid = clean_id(candidate.get("candidate_id", ""))
                if cid == cleaned_target_id:
                    return {"candidate": candidate}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading dataset: {e}")

    raise HTTPException(status_code=404, detail=f"Candidate '{candidate_id}' not found.")


# ===========================================================================
# 6. Export CSV Files
# ===========================================================================
EXPORT_FILES = {
    "top100": os.path.join(OUTPUTS_DIR, "top100.csv"),
    "submission": os.path.join(OUTPUTS_DIR, "submission.csv"),
}

@app.get("/api/export/{file_type}", tags=["Export"])
def export_csv(file_type: str):
    """
    Download ranking output CSV files.
    - file_type: 'top100' → outputs/top100.csv
    - file_type: 'submission' → outputs/submission.csv
    """
    if file_type not in EXPORT_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown export type '{file_type}'. Use 'top100' or 'submission'."
        )
    file_path = EXPORT_FILES[file_type]
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail=f"File '{file_type}.csv' not found. POST /api/rank to trigger the pipeline first."
        )
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File '{file_type}.csv' not found.")

    return FileResponse(
        path=file_path,
        media_type="text/csv",
        filename=f"{file_type}.csv",
        headers={"Content-Disposition": f"attachment; filename={file_type}.csv"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
