import os
import sys
import json
import uuid
import asyncio
import logging
from pathlib import Path
from typing import Dict, Optional
from concurrent.futures import ThreadPoolExecutor

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
# In-memory job store (replace with Redis/DB in production)
# ---------------------------------------------------------------------------
_job_store: Dict[str, Dict] = {}
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
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
    _job_store[job_id]["status"] = "running"
    try:
        # Change CWD to project root so relative paths inside pipeline work
        original_cwd = os.getcwd()
        os.chdir(BASE_DIR)
        run_ranking_pipeline()
        os.chdir(original_cwd)
        _job_store[job_id]["status"] = "completed"
        _job_store[job_id]["message"] = "Ranking pipeline completed successfully."
    except Exception as e:
        _job_store[job_id]["status"] = "failed"
        _job_store[job_id]["message"] = str(e)
        logger.exception(f"Pipeline job {job_id} failed")


@app.post("/api/rank", tags=["Ranking"])
def trigger_ranking(background_tasks: BackgroundTasks):
    """
    Trigger the ranking pipeline asynchronously.
    Returns a job_id immediately — poll GET /api/rank/status/{job_id} for progress.
    """
    job_id = uuid.uuid4().hex[:10]
    _job_store[job_id] = {"status": "queued", "message": ""}
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
):
    """
    Retrieve ranked candidates from outputs/top100.csv with pagination.
    Triggers the ranking pipeline automatically if the output file doesn't exist.
    """
    if not os.path.exists(TOP100_PATH):
        try:
            original_cwd = os.getcwd()
            os.chdir(BASE_DIR)
            run_ranking_pipeline()
            os.chdir(original_cwd)
        except Exception:
            raise HTTPException(
                status_code=404,
                detail="outputs/top100.csv not found and pipeline run failed."
            )

    if os.path.exists(TOP100_PATH):
        try:
            df = pd.read_csv(TOP100_PATH)
            df["candidate_id"] = df["candidate_id"].apply(clean_id)
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
                    "pages": (total + limit - 1) // limit,
                },
            }
        except Exception as e:
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
