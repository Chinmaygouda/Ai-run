from typing import Any, Dict

AI_TITLES = {
    "ai engineer",
    "ml engineer",
    "machine learning engineer",
    "data scientist",
    "nlp engineer",
    "computer vision engineer",
    "deep learning engineer",
    "ai researcher",
    "ml researcher"
}

def get_title_score(candidate: Dict[str, Any]) -> float:
    """
    Score the candidate's current title based on relevance to AI/ML roles.
    
    Args:
        candidate (Dict[str, Any]): The candidate dictionary.
        
    Returns:
        float: A normalized score between 0.0 and 1.0.
    """
    if not candidate or "profile" not in candidate:
        return 0.0
        
    profile = candidate.get("profile", {})
    if not profile:
        return 0.0
        
    title = profile.get("current_title", "")
    if not isinstance(title, str) or not title.strip():
        return 0.0
        
    title_lower = title.lower()
    
    # Check for direct AI/ML title matches
    for ai_role in AI_TITLES:
        if ai_role in title_lower:
            return 1.0
            
    # Check for related technical roles
    if "data" in title_lower or "engineer" in title_lower or "developer" in title_lower or "scientist" in title_lower:
        return 0.6
        
    # Default score for other titles
    return 0.2

if __name__ == "__main__":
    example_candidate = {
        "candidate_id": "1",
        "profile": {
            "current_title": "Senior Machine Learning Engineer"
        }
    }
    print(f"Title Score: {get_title_score(example_candidate)}")