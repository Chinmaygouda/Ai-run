from typing import Any, Dict

def get_experience_score(candidate: Dict[str, Any]) -> float:
    """
    Calculate a numerical score based on the candidate's years of experience.
    Rewards 5-10 years of experience, and penalizes extremely low or high experience.
    
    Args:
        candidate (Dict[str, Any]): The candidate dictionary.
        
    Returns:
        float: A normalized score between 0.0 and 1.0.
    """
    if not candidate or "profile" not in candidate:
        return 0.0
        
    profile = candidate.get("profile")
    if not isinstance(profile, dict):
        return 0.0
        
    yoe = profile.get("years_of_experience")
    
    try:
        yoe = float(yoe) if yoe is not None else 0.0
    except (ValueError, TypeError):
        return 0.0
        
    if yoe < 0:
        return 0.0
        
    # Scoring logic:
    # 5-10 years: Optimal (score 1.0)
    # 3-5 years: Good (score 0.8 to 1.0)
    # 0-3 years: Low (score 0.4 to 0.8)
    # 10-15 years: Slightly penalized (score 1.0 to 0.7)
    # 15-20 years: More penalized (score 0.7 to 0.4)
    # 20+ years: Heavily penalized (score 0.4 to 0.1)
    
    if 5.0 <= yoe <= 10.0:
        return 1.0
    elif 3.0 <= yoe < 5.0:
        return 0.8 + (yoe - 3.0) * 0.1  # linearly from 0.8 to 1.0
    elif 0.0 <= yoe < 3.0:
        return 0.4 + (yoe / 3.0) * 0.4  # linearly from 0.4 to 0.8
    elif 10.0 < yoe <= 15.0:
        return 1.0 - ((yoe - 10.0) / 5.0) * 0.3  # linearly from 1.0 to 0.7
    elif 15.0 < yoe <= 20.0:
        return 0.7 - ((yoe - 15.0) / 5.0) * 0.3  # linearly from 0.7 to 0.4
    else:  # > 20 years
        score = 0.4 - ((yoe - 20.0) / 10.0) * 0.3 # decreases down to ~0.1
        return min(1.0, max(0.1, score))

if __name__ == "__main__":
    example_candidate = {
        "candidate_id": "1",
        "profile": {
            "years_of_experience": 7.5
        }
    }
    print(f"Experience Score: {get_experience_score(example_candidate)}")
