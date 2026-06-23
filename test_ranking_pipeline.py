import os
import sys
import json
import shutil
import subprocess
import pandas as pd

# Define Mock Candidates representing all the scenarios we want to test
MOCK_CANDIDATES = [
    # 1. High Quality Match (Perfect Fit)
    {
        "candidate_id": "c_perfect_fit",
        "profile": {
            "current_title": "Senior Recommendation Systems Engineer",
            "years_of_experience": 7.2,
            "current_company": "Razorpay",
            "location": "Bengaluru, Karnataka",
            "country": "India",
            "summary": "Building scalable semantic search and ranking systems."
        },
        "career_history": [
            {
                "company": "Razorpay",
                "title": "Senior Recommendation Systems Engineer",
                "duration_months": 36,
                "description": "Designed and deployed vector database retrieval systems and deep learning-to-rank search indices."
            },
            {
                "company": "Swiggy",
                "title": "Machine Learning Engineer",
                "duration_months": 50,
                "description": "Implemented collaborative filtering recommendation engines and dense retrieval search using FAISS."
            }
        ],
        "skills": [
            {"name": "Python", "proficiency": "expert", "endorsements": 85, "duration_months": 86},
            {"name": "FAISS", "proficiency": "expert", "endorsements": 60, "duration_months": 60},
            {"name": "Pinecone", "proficiency": "advanced", "endorsements": 40, "duration_months": 36}
        ],
        "redrob_signals": {
            "recruiter_response_rate": 0.95,
            "github_activity_score": 92.0,
            "interview_completion_rate": 0.90,
            "offer_acceptance_rate": 0.85,
            "open_to_work_flag": True,
            "last_active_date": "2023-10-01",
            "notice_period_days": 30
        }
    },
    
    # 2. Keyword Stuffer Trap
    {
        "candidate_id": "c_keyword_stuffer",
        "profile": {
            "current_title": "Marketing Coordinator",
            "years_of_experience": 4.0,
            "current_company": "Retail Corp",
            "location": "Mumbai",
            "country": "India",
            "summary": "Marketing professional interested in tech."
        },
        "career_history": [
            {
                "company": "Retail Corp",
                "title": "Marketing Coordinator",
                "duration_months": 48,
                "description": "Managed social media campaigns and sent email newsletters to subscribers."
            }
        ],
        "skills": [
            {"name": "Machine Learning", "proficiency": "expert", "endorsements": 5, "duration_months": 12},
            {"name": "Deep Learning", "proficiency": "expert", "endorsements": 5, "duration_months": 12},
            {"name": "LLM", "proficiency": "expert", "endorsements": 5, "duration_months": 12},
            {"name": "RAG", "proficiency": "expert", "endorsements": 5, "duration_months": 12},
            {"name": "Generative AI", "proficiency": "expert", "endorsements": 5, "duration_months": 12},
            {"name": "NLP", "proficiency": "expert", "endorsements": 5, "duration_months": 12}
        ],
        "redrob_signals": {
            "recruiter_response_rate": 0.40,
            "github_activity_score": 10.0,
            "interview_completion_rate": 0.20,
            "offer_acceptance_rate": 0.50,
            "open_to_work_flag": False
        }
    },
    
    # 3. Honeypot Trap (Impossible skill duration)
    {
        "candidate_id": "c_honeypot_fake",
        "profile": {
            "current_title": "Senior AI Researcher",
            "years_of_experience": 1.5,  # Senior with 1.5 years experience!
            "current_company": "Startup X",
            "location": "Delhi",
            "country": "India",
            "summary": "Junior builder looking for roles."
        },
        "career_history": [
            {
                "company": "Startup X",
                "title": "Junior Engineer",
                "duration_months": 18,
                "description": "Maintained simple internal dashboard pages."
            }
        ],
        "skills": [
            {"name": "Python", "proficiency": "expert", "duration_months": 120}  # 10 years duration for 1.5 years experience!
        ],
        "redrob_signals": {
            "recruiter_response_rate": 0.80,
            "github_activity_score": 50.0,
            "interview_completion_rate": 0.50,
            "offer_acceptance_rate": 0.50,
            "open_to_work_flag": True
        }
    },
    
    # 4. Behavioral Twin A (Duplicate)
    {
        "candidate_id": "c_twin_a",
        "profile": {
            "current_title": "ML Engineer",
            "years_of_experience": 5.0,
            "current_company": "Tech Corp",
            "location": "Bengaluru",
            "country": "India",
            "summary": "Building features."
        },
        "career_history": [
            {
                "company": "Tech Corp",
                "title": "Developer",
                "duration_months": 60,
                # Identical career description as twin_b!
                "description": "Standard software engineer. Handled coding tasks and resolved basic system bugs weekly."
            }
        ],
        "skills": [
            {"name": "Python", "proficiency": "intermediate", "duration_months": 36}
        ],
        "redrob_signals": {
            "recruiter_response_rate": 0.80,
            "github_activity_score": 60.0,
            "interview_completion_rate": 0.70,
            "offer_acceptance_rate": 0.70,
            "open_to_work_flag": True
        }
    },
    
    # 5. Behavioral Twin B (Duplicate)
    {
        "candidate_id": "c_twin_b",
        "profile": {
            "current_title": "Software Engineer",
            "years_of_experience": 5.0,
            "current_company": "Solutions Ltd",
            "location": "Bengaluru",
            "country": "India",
            "summary": "Developer profile."
        },
        "career_history": [
            {
                "company": "Solutions Ltd",
                "title": "Engineer",
                "duration_months": 60,
                # Identical career description as twin_a!
                "description": "Standard software engineer. Handled coding tasks and resolved basic system bugs weekly."
            }
        ],
        "skills": [
            {"name": "Python", "proficiency": "intermediate", "duration_months": 36}
        ],
        "redrob_signals": {
            "recruiter_response_rate": 0.80,
            "github_activity_score": 60.0,
            "interview_completion_rate": 0.70,
            "offer_acceptance_rate": 0.70,
            "open_to_work_flag": True
        }
    }
]

def setup_test_environment():
    """Sets up data directories and mocks files."""
    print("Setting up test directory and dataset files...")
    os.makedirs("data", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)
    
    # Write mock candidates
    with open("data/candidates.jsonl", "w", encoding="utf-8") as f:
        for cand in MOCK_CANDIDATES:
            f.write(json.dumps(cand) + "\n")
            
    # Remove old pre-computed features to force recalculation
    if os.path.exists("outputs/candidate_features.csv"):
        os.remove("outputs/candidate_features.csv")
        
    print("Test environment set up successfully!")

def run_ranking():
    """Runs the rank_candidates.py script."""
    print("\nExecuting candidate ranking pipeline...\n" + "=" * 50)
    
    # Execute the ranking pipeline script
    result = subprocess.run(
        [sys.executable, "ranking/rank_candidates.py"],
        capture_output=True,
        text=True
    )
    
    print(result.stdout)
    if result.stderr:
        print("ERRORS/WARNINGS:")
        print(result.stderr)

def print_results():
    """Inspects and prints the generated submission file."""
    print("=" * 50 + "\nVerifying outputs/submission.csv:\n")
    sub_path = "outputs/submission.csv"
    
    if os.path.exists(sub_path):
        df = pd.read_csv(sub_path)
        pd.set_option('display.max_columns', None)
        pd.set_option('display.max_colwidth', None)
        print(df)
        
        # Verify that perfect match is #1 and keyword/honeypot are penalized or dropped
        top_id = df.iloc[0]["candidate_id"]
        print("\nPipeline check:")
        if top_id == "c_perfect_fit":
            print(" [PASS] Candidate 'c_perfect_fit' ranked #1.")
        else:
            print(f" [FAIL] Expected 'c_perfect_fit' at rank #1, found: '{top_id}'")
            
        trap_ids = {"c_keyword_stuffer", "c_honeypot_fake"}
        contained_traps = set(df["candidate_id"]).intersection(trap_ids)
        if not contained_traps:
            print(" [PASS] All keyword stuffers and honeypots successfully filtered out.")
        else:
            print(f" [FAIL] Traps found in top ranking list: {contained_traps}")
    else:
        print(f" [FAIL] {sub_path} was not generated.")

if __name__ == "__main__":
    setup_test_environment()
    run_ranking()
    print_results()
