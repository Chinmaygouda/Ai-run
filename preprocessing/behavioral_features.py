from typing import Any, Dict

def get_behavior_score(candidate: Dict[str, Any]) -> float:
    """
    Calculate a numerical score based on the candidate's behavioral signals.
    
    Args:
        candidate (Dict[str, Any]): The candidate dictionary.
        
    Returns:
        float: A normalized score between 0.0 and 1.0.
    """
    if not candidate or "redrob_signals" not in candidate:
        return 0.0
        
    signals = candidate.get("redrob_signals")
    if not isinstance(signals, dict):
        return 0.0
        
    # Extract values safely
    def safe_float(val: Any, default: float = 0.0) -> float:
        try:
            return float(val) if val is not None else default
        except (ValueError, TypeError):
            return default
            
    response_rate = safe_float(signals.get("recruiter_response_rate", 0.0))
    github_score = safe_float(signals.get("github_activity_score", 0.0))
    interview_completion = safe_float(signals.get("interview_completion_rate", 0.0))
    offer_acceptance = safe_float(signals.get("offer_acceptance_rate", 0.0))
    
    open_to_work = signals.get("open_to_work_flag", False)
    open_to_work_score = 1.0 if isinstance(open_to_work, bool) and open_to_work else 0.0
    
    # Normalize inputs if they aren't already 0-1
    # Assuming github_activity_score is 0-100, others are 0-1. 
    # Let's handle github_score just in case it's 0-100.
    if github_score > 1.0:
        github_score = min(1.0, github_score / 100.0)
    else:
        github_score = min(1.0, max(0.0, github_score))
        
    response_rate = min(1.0, max(0.0, response_rate))
    interview_completion = min(1.0, max(0.0, interview_completion))
    offer_acceptance = min(1.0, max(0.0, offer_acceptance))
    
    # Weighted average of the signals
    # Weights sum to 1.0
    weights = {
        "response_rate": 0.20,
        "github_score": 0.25,
        "interview_completion": 0.25,
        "offer_acceptance": 0.15,
        "open_to_work": 0.15
    }
    
    score = (
        response_rate * weights["response_rate"] +
        github_score * weights["github_score"] +
        interview_completion * weights["interview_completion"] +
        offer_acceptance * weights["offer_acceptance"] +
        open_to_work_score * weights["open_to_work"]
    )
    
    return min(1.0, max(0.0, score))

if __name__ == "__main__":
    example_candidate = {
        "candidate_id": "1",
        "redrob_signals": {
            "recruiter_response_rate": 0.8,
            "github_activity_score": 85.0,
            "interview_completion_rate": 0.9,
            "offer_acceptance_rate": 0.6,
            "open_to_work_flag": True
        }
    }
    print(f"Behavior Score: {get_behavior_score(example_candidate)}")
