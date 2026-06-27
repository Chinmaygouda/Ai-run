import string
import re
from typing import Any, Dict

def detect_honeypot(candidate: Dict[str, Any]) -> Dict[str, Any]:
    """
    Detect unrealistic expertise, skill inflation, senior titles with low experience, 
    and suspicious skill durations.
    
    Args:
        candidate (Dict[str, Any]): The candidate dictionary.
        
    Returns:
        Dict[str, Any]: A dictionary containing 'flag' (bool) and 'penalty' (float).
    """
    result = {
        "flag": False,
        "penalty": 0.0,
        "confidence": 0.0
    }
    
    if not candidate:
        return result
        
    profile = candidate.get("profile", {})
    skills = candidate.get("skills", [])
    
    if not isinstance(profile, dict) or not isinstance(skills, list):
        return result
        
    # Get Years of Experience
    try:
        yoe = float(profile.get("years_of_experience", 0.0))
    except (ValueError, TypeError):
        yoe = 0.0
        
    penalties = []
    confidences = []
        
    # 1. Senior Titles with Low Experience
    current_title = str(profile.get("current_title", "")).lower()
    translator = str.maketrans(string.punctuation, ' ' * len(string.punctuation))
    clean_title_words = current_title.translate(translator).split()
    
    if "senior" in clean_title_words or "sr" in clean_title_words:
        if yoe < 3.0:
            penalties.append(0.5)
            confidences.append(0.8 if yoe < 1.0 else 0.6)
            
    if any(kw in clean_title_words for kw in ["lead", "principal", "staff"]):
        if yoe < 5.0:
            penalties.append(0.6)
            confidences.append(0.9 if yoe < 2.0 else 0.7)
            
    if any(kw in clean_title_words for kw in ["director", "head", "vp", "chief"]):
        if yoe < 8.0:
            penalties.append(0.7)
            confidences.append(0.95 if yoe < 3.0 else 0.75)
            
    # 2. Unrealistic Expertise & Skill Inflation
    expert_skill_count = 0
    total_months_experience = yoe * 12
    impossible_duration_count = 0
    unrealistic_expert_count = 0
    
    for skill in skills:
        if not isinstance(skill, dict):
            continue
            
        proficiency = skill.get("proficiency", "").lower()
        
        # 3. Suspicious Skill Durations
        duration = skill.get("duration_months")
        try:
            duration = int(duration) if duration is not None else 0
        except (ValueError, TypeError):
            duration = 0
            
        if proficiency == "expert":
            expert_skill_count += 1
            if duration < 12: # Expert with < 1 year duration
                unrealistic_expert_count += 1
            
        # Allow 24 months buffer for side projects/education before formal employment
        if duration > total_months_experience + 24: 
            impossible_duration_count += 1
            
    # Evaluate Unrealistic Expertise (low duration for expert)
    if unrealistic_expert_count >= 3:
        penalties.append(0.6)
        confidences.append(0.85)
    elif unrealistic_expert_count >= 1:
        penalties.append(0.3)
        confidences.append(0.6)

    # Evaluate Skill Inflation
    if expert_skill_count >= 10:
        penalties.append(0.5)
        confidences.append(0.8)
    elif expert_skill_count >= 5 and yoe < 3.0:
        penalties.append(0.6)
        confidences.append(0.85)
        
    # Evaluate Suspicious Durations
    if impossible_duration_count >= 2:
        penalties.append(0.8)
        confidences.append(0.9)
    elif impossible_duration_count == 1:
        penalties.append(0.4)
        confidences.append(0.6)
        
    # 4. Foundation Year Contradictions (Startup Honeypot Trap)
    career_history = candidate.get("career_history", [])
    if isinstance(career_history, list):
        for job in career_history:
            if not isinstance(job, dict):
                continue
            desc = job.get("description", "")
            if not isinstance(desc, str) or not desc.strip():
                continue
            
            # Find year mentions associated with foundation
            match = re.search(r'\b(?:founded|established|started|incorporated)\s+in\s+(\d{4})\b', desc, re.IGNORECASE)
            if match:
                founded_year = int(match.group(1))
                
                # Check if start_date predates foundation
                start_date = job.get("start_date")
                if isinstance(start_date, str) and len(start_date) >= 4:
                    try:
                        start_year = int(start_date.split("-")[0])
                        if start_year < founded_year:
                            penalties.append(1.0)
                            confidences.append(1.0)
                    except (ValueError, TypeError):
                        pass
                
                # Check if duration implies starting before foundation (current year is 2026)
                duration_months = job.get("duration_months")
                if duration_months is not None:
                    try:
                        dur_months = int(duration_months)
                        end_year = 2026
                        if not job.get("is_current", True):
                            end_date = job.get("end_date")
                            if isinstance(end_date, str) and len(end_date) >= 4:
                                end_year = int(end_date.split("-")[0])
                        
                        approx_start_year = end_year - (dur_months / 12)
                        if approx_start_year < founded_year - 1:
                            penalties.append(1.0)
                            confidences.append(1.0)
                    except (ValueError, TypeError):
                        pass

    if penalties:
        result["flag"] = True
        # Use the maximum penalty/confidence found for the final result
        result["penalty"] = max(penalties)
        result["confidence"] = max(confidences)
        
    return result

if __name__ == "__main__":
    example_candidate = {
        "candidate_id": "1",
        "profile": {
            "years_of_experience": 1.0,
            "current_title": "Senior Machine Learning Engineer"
        },
        "skills": [
            {"name": "Python", "proficiency": "expert", "duration_months": 36},
            {"name": "Machine Learning", "proficiency": "expert", "duration_months": 12},
            {"name": "Deep Learning", "proficiency": "expert", "duration_months": 12}
        ]
    }
    print(f"Honeypot Result: {detect_honeypot(example_candidate)}")
