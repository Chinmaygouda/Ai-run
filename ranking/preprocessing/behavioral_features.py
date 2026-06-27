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
    
    # 1. Notice Period Score (decaying from 1.0 down to 0.3 for 30-90+ days)
    notice_period = safe_float(signals.get("notice_period_days", 30.0))
    if notice_period <= 30:
        notice_score = 1.0
    elif notice_period <= 60:
        notice_score = 1.0 - (notice_period - 30) * (0.15 / 30.0)  # linear from 1.0 to 0.85
    elif notice_period <= 90:
        notice_score = 0.85 - (notice_period - 60) * (0.25 / 30.0)  # linear from 0.85 to 0.60
    else:
        notice_score = max(0.3, 0.60 - (notice_period - 90) * (0.30 / 90.0))  # linear from 0.60 to 0.30
    
    # Normalize inputs if they aren't already 0-1
    if github_score > 1.0:
        github_score = min(1.0, github_score / 100.0)
    else:
        github_score = min(1.0, max(0.0, github_score))
        
    response_rate = min(1.0, max(0.0, response_rate))
    interview_completion = min(1.0, max(0.0, interview_completion))
    offer_acceptance = min(1.0, max(0.0, offer_acceptance))
    
    # Weighted average of the signals (weights sum to 1.0)
    weights = {
        "response_rate": 0.20,
        "github_score": 0.20,
        "interview_completion": 0.20,
        "offer_acceptance": 0.10,
        "open_to_work": 0.15,
        "notice_score": 0.15
    }
    
    score = (
        response_rate * weights["response_rate"] +
        github_score * weights["github_score"] +
        interview_completion * weights["interview_completion"] +
        offer_acceptance * weights["offer_acceptance"] +
        open_to_work_score * weights["open_to_work"] +
        notice_score * weights["notice_score"]
    )
    
    # 2. Inactivity Down-weighting (current reference year is 2026)
    inactivity_multiplier = 1.0
    last_active_str = signals.get("last_active_date", "")
    if isinstance(last_active_str, str) and last_active_str:
        try:
            parts = [int(p) for p in last_active_str.split("-")]
            if len(parts) == 3:
                y, m, d = parts
                # Days since last active relative to June 27, 2026
                days_active = (2026 - y) * 365 + (6 - m) * 30 + (27 - d)
                if days_active > 180:
                    inactivity_multiplier = 0.5  # 50% penalty if inactive for >6 months
                elif days_active > 90:
                    inactivity_multiplier = 0.8  # 20% penalty if inactive for >3 months
        except Exception:
            pass
            
    final_score = min(1.0, max(0.0, score * inactivity_multiplier))
    return final_score


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
