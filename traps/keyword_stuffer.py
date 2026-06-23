import os
import sys
from typing import Any, Dict

# Ensure we can import preprocessing modules when running standalone
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from preprocessing.career_features import get_career_score

def detect_keyword_stuffer(candidate: Dict[str, Any]) -> Dict[str, Any]:
    """
    Flag candidates who list many AI skills but have little supporting career evidence.
    
    Args:
        candidate (Dict[str, Any]): The candidate dictionary.
        
    Returns:
        Dict[str, Any]: A dictionary containing 'flag' (bool) and 'penalty' (float).
    """
    result = {
        "flag": False,
        "penalty": 0.0
    }
    
    if not candidate:
        return result
        
    skills = candidate.get("skills", [])
    profile = candidate.get("profile", {})
    
    # 1. Get career_score
    career_score = get_career_score(candidate)
    
    # 2. Get years of experience
    try:
        yoe = float(profile.get("years_of_experience", 0.0))
    except (ValueError, TypeError):
        yoe = 0.0
        
    # 3. Get number of AI skills
    ai_keywords = {"ai", "ml", "machine learning", "deep learning", "nlp", "llm", "data science", "rag", "generative ai", "computer vision"}
    number_of_ai_skills = 0
    if isinstance(skills, list):
        for skill in skills:
            if not isinstance(skill, dict):
                continue
            skill_name = skill.get("name", "")
            if isinstance(skill_name, str) and any(kw in skill_name.lower() for kw in ai_keywords):
                number_of_ai_skills += 1
                
    # Logic:
    # High AI skills + Low career score = Suspicious
    if number_of_ai_skills >= 5 and career_score < 0.2:
        result["flag"] = True
        if yoe < 3.0:
            result["penalty"] = 0.6  # Very suspicious: many skills, low experience, no evidence
        else:
            result["penalty"] = 0.4  # Suspicious: many skills, some experience, no evidence
    elif number_of_ai_skills >= 8 and career_score < 0.4:
        result["flag"] = True
        if yoe < 5.0:
            result["penalty"] = 0.5
        else:
            result["penalty"] = 0.3
            
    return result

if __name__ == "__main__":
    example_candidate = {
        "candidate_id": "1",
        "profile": {
            "years_of_experience": 2
        },
        "skills": [
            {"name": "Machine Learning"},
            {"name": "Deep Learning"},
            {"name": "NLP"},
            {"name": "LLM"},
            {"name": "AI"},
            {"name": "RAG"}
        ],
        "career_history": [
            {"description": "Developed standard web applications using React."}
        ]
    }
    print(f"Keyword Stuffer Result: {detect_keyword_stuffer(example_candidate)}")
