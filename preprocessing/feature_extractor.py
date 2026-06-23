import sys
import os
from typing import Any, Dict

# Add parent directory to path so we can import traps module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from preprocessing.title_features import get_title_score
from preprocessing.career_features import get_career_score
from preprocessing.skill_features import get_skill_score
from preprocessing.behavioral_features import get_behavior_score
from preprocessing.experience_features import get_experience_score

from traps.keyword_stuffer import detect_keyword_stuffer
from traps.honeypot_detector import detect_honeypot

def extract_features(candidate: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract all features and trap signals for a given candidate.
    
    Args:
        candidate (Dict[str, Any]): The candidate dictionary.
        
    Returns:
        Dict[str, Any]: A dictionary containing candidate ID, all feature scores, and trap flags.
    """
    candidate_id = str(candidate.get("candidate_id", ""))
    
    # Calculate feature scores
    title_score = get_title_score(candidate)
    career_score = get_career_score(candidate)
    skill_score = get_skill_score(candidate)
    behavior_score = get_behavior_score(candidate)
    experience_score = get_experience_score(candidate)
    
    # Detect traps
    keyword_stuffer_result = detect_keyword_stuffer(candidate)
    honeypot_result = detect_honeypot(candidate)
    
    return {
        "candidate_id": candidate_id,
        "title_score": title_score,
        "career_score": career_score,
        "skill_score": skill_score,
        "behavior_score": behavior_score,
        "experience_score": experience_score,
        "keyword_stuffer_flag": keyword_stuffer_result.get("flag", False),
        "keyword_stuffer_penalty": keyword_stuffer_result.get("penalty", 0.0),
        "honeypot_flag": honeypot_result.get("flag", False),
        "honeypot_penalty": honeypot_result.get("penalty", 0.0)
    }

if __name__ == "__main__":
    example_candidate = {
        "candidate_id": "c_123",
        "profile": {
            "headline": "AI Engineer",
            "summary": "Passionate about ML.",
            "location": "San Francisco",
            "country": "USA",
            "years_of_experience": 6.0,
            "current_title": "Machine Learning Engineer",
            "current_company": "Tech Corp",
            "current_industry": "Technology"
        },
        "career_history": [
            {
                "company": "Tech Corp",
                "title": "Machine Learning Engineer",
                "duration_months": 24,
                "industry": "Technology",
                "description": "Built scalable RAG pipelines using LLMs and vector search."
            }
        ],
        "skills": [
            {
                "name": "Python",
                "proficiency": "expert",
                "endorsements": 100,
                "duration_months": 72
            }
        ],
        "redrob_signals": {
            "recruiter_response_rate": 0.9,
            "github_activity_score": 90.0,
            "interview_completion_rate": 0.8,
            "offer_acceptance_rate": 0.7,
            "open_to_work_flag": True,
            "last_active_date": "2023-10-01",
            "notice_period_days": 30
        }
    }
    
    features = extract_features(example_candidate)
    import json
    print(json.dumps(features, indent=2))
