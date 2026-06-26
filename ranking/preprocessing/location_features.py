from typing import Any, Dict

# JD target locations extracted from the job description
TARGET_LOCATIONS = {
    "pune", "noida", "delhi", "ncr", "mumbai", "hyderabad", "bangalore", "chennai",
    "india", "bengaluru",
}

REMOTE_INDICATORS = {"remote", "work from home", "wfh", "distributed", "anywhere"}

def get_location_score(candidate: Dict[str, Any]) -> float:
    """
    Score based on candidate location match with JD target locations.
    
    The JD states: "Pune/Noida-preferred but flexible" and welcomes
    "Hyderabad, Pune, Mumbai, Delhi NCR" candidates. Open to relocation.
    
    Args:
        candidate: The candidate dictionary.
        
    Returns:
        float: Score between 0.0 and 1.0.
    """
    if not candidate:
        return 0.0
        
    profile = candidate.get("profile", {})
    if not isinstance(profile, dict):
        return 0.0
    
    location = str(profile.get("location", "")).lower().strip()
    country = str(profile.get("country", "")).lower().strip()
    
    if not location and not country:
        return 0.0
    
    full_location = f"{location} {country}".strip()
    
    # Check if candidate is in a target city
    in_target_city = any(city in full_location for city in TARGET_LOCATIONS)
    
    # Check if remote / flexible
    is_remote = any(indicator in full_location for indicator in REMOTE_INDICATORS)
    
    # India-based (JD explicitly says "Outside India: case-by-case")
    is_india = "india" in country or any(city in full_location for city in {"pune", "noida", "delhi", "mumbai", "hyderabad", "bangalore", "chennai", "bengaluru"})
    
    if in_target_city:
        return 1.0  # Ideal match
    elif is_remote and is_india:
        return 0.85  # Remote within India — still very good
    elif is_remote:
        return 0.6  # Remote but outside India
    elif is_india:
        return 0.7  # In India but not in target cities
    else:
        return 0.3  # Outside India, not remote
