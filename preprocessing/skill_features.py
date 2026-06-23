from typing import Any, Dict

PROFICIENCY_MAP = {
    "beginner": 0.25,
    "intermediate": 0.5,
    "advanced": 0.75,
    "expert": 1.0
}

def get_skill_score(candidate: Dict[str, Any]) -> float:
    """
    Calculate a numerical score based on the candidate's skills.
    Considers proficiency level, endorsements, and duration.
    
    Args:
        candidate (Dict[str, Any]): The candidate dictionary.
        
    Returns:
        float: A normalized score between 0.0 and 1.0.
    """
    if not candidate or "skills" not in candidate:
        return 0.0
        
    skills = candidate.get("skills")
    if not isinstance(skills, list) or not skills:
        return 0.0
        
    total_score = 0.0
    valid_skills_count = 0
    
    for skill in skills:
        if not isinstance(skill, dict):
            continue
            
        proficiency = skill.get("proficiency", "").lower()
        if not isinstance(proficiency, str) or proficiency not in PROFICIENCY_MAP:
            continue
            
        prof_score = PROFICIENCY_MAP[proficiency]
        
        endorsements = skill.get("endorsements", 0)
        endorsements = int(endorsements) if str(endorsements).isdigit() else 0
        # Normalize endorsements (assume 50+ is excellent)
        endorsement_score = min(1.0, endorsements / 50.0)
        
        duration = skill.get("duration_months", 0)
        duration = int(duration) if str(duration).isdigit() else 0
        # Normalize duration (assume 60+ months is excellent)
        duration_score = min(1.0, duration / 60.0)
        
        # Weighted combination for a single skill
        # 50% proficiency, 20% endorsements, 30% duration
        skill_score = (prof_score * 0.5) + (endorsement_score * 0.2) + (duration_score * 0.3)
        
        total_score += skill_score
        valid_skills_count += 1
        
    if valid_skills_count == 0:
        return 0.0
        
    # Calculate average skill score
    avg_score = total_score / valid_skills_count
    
    # Boost score slightly if they have many valid skills (up to 1.0)
    # Assume 10+ skills is a full boost of 1.2x
    volume_boost = min(1.2, 1.0 + (valid_skills_count * 0.02))
    
    final_score = min(1.0, max(0.0, avg_score * volume_boost))
    return final_score

if __name__ == "__main__":
    example_candidate = {
        "candidate_id": "1",
        "skills": [
            {
                "name": "Python",
                "proficiency": "expert",
                "endorsements": 120,
                "duration_months": 72
            },
            {
                "name": "Machine Learning",
                "proficiency": "advanced",
                "endorsements": 40,
                "duration_months": 36
            }
        ]
    }
    print(f"Skill Score: {get_skill_score(example_candidate)}")
