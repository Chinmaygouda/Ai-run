import os
import sys
import json
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add parent directory to path to handle imports from ranking and other packages
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Fallback imports to prevent path shadowing issues
try:
    from ranking.rank_candidates import run_ranking_pipeline, clean_id, find_dataset_file
except ModuleNotFoundError:
    # If executed directly inside backend/ folder
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ranking')))
    from rank_candidates import run_ranking_pipeline, clean_id, find_dataset_file

app = FastAPI(title="India Runs API", description="FastAPI Backend for AI Candidate Ranking Pipeline")

# Enable CORS for frontend connection (React usually runs on localhost:3000 or localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all origins for developer flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobDescriptionUpdate(BaseModel):
    jd_text: str

@app.get("/api/job-description")
def get_job_description():
    """Retrieve the current job description from data/jd.txt."""
    path = "data/jd.txt"
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return {"jd_text": f.read()}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to read Job Description: {str(e)}")
    return {"jd_text": ""}

@app.post("/api/job-description")
def update_job_description(payload: JobDescriptionUpdate):
    """Update the job description file (data/jd.txt)."""
    os.makedirs("data", exist_ok=True)
    try:
        with open("data/jd.txt", "w", encoding="utf-8") as f:
            f.write(payload.jd_text)
        return {"status": "success", "message": "Job description updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write Job Description: {str(e)}")

@app.post("/api/rank")
def trigger_ranking():
    """Trigger the ranking pipeline calculation."""
    try:
        run_ranking_pipeline()
        return {"status": "success", "message": "Ranking pipeline completed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

@app.get("/api/candidates")
def get_candidates():
    """Retrieve the Top 100 ranked candidates from outputs/top100.csv."""
    path = "outputs/top100.csv"
    if not os.path.exists(path):
        # Fallback: trigger ranking if it doesn't exist
        try:
            run_ranking_pipeline()
        except Exception:
            raise HTTPException(status_code=404, detail="outputs/top100.csv not found and pipeline run failed.")
            
    if os.path.exists(path):
        try:
            df = pd.read_csv(path)
            # Ensure candidate_id is loaded cleanly as string
            df["candidate_id"] = df["candidate_id"].apply(clean_id)
            # Convert NaN to None for clean JSON response
            data = df.where(pd.notnull(df), None).to_dict(orient="records")
            return {"candidates": data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse CSV: {str(e)}")
            
    return {"candidates": []}

@app.get("/api/candidates/{candidate_id}")
def get_candidate_detail(candidate_id: str):
    """Retrieve the full raw candidate profile details from candidates.jsonl."""
    dataset_path = find_dataset_file()
    if not dataset_path:
        raise HTTPException(status_code=404, detail="Dataset candidates.jsonl not found.")
        
    cleaned_target_id = clean_id(candidate_id)
    
    # Scan raw dataset sequentially to locate candidate
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
        raise HTTPException(status_code=500, detail=f"Error reading dataset: {str(e)}")
        
    raise HTTPException(status_code=404, detail=f"Candidate {candidate_id} not found in the raw dataset.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
