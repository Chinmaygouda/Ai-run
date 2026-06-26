import os
import sys
import re
from typing import Any, Dict, Set

# Ensure we can import preprocessing modules when running standalone
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from preprocessing.career_features import get_career_score

def extract_jd_keywords(jd_text: str) -> Set[str]:
    """
    Extract key terms from Job Description text, excluding common English stopwords.
    """
    if not jd_text:
        return set()
        
    stopwords = {
        "and", "the", "for", "with", "from", "that", "this", "these", "those", "have", "has", "had", 
        "are", "was", "were", "been", "will", "would", "should", "could", "about", "their", "them", 
        "there", "then", "than", "but", "not", "out", "our", "you", "your", "its", "into", "onto", 
        "upon", "after", "before", "over", "under", "above", "below", "such", "some", "any", "each", 
        "few", "more", "most", "other", "own", "same", "very", "who", "whom", "what", "which", "why",
        "how", "can", "may", "must", "recommend", "experience", "required", "desired", "highly",
        "build", "scale", "optimize", "system", "systems", "large", "role", "team", "work", "build"
    }
    
    # Lowercase and extract alphanumeric words of length >= 3
    words = re.findall(r'\b[a-z0-9]{3,}\b', jd_text.lower())
    
    # Filter stopwords and keep unique terms
    extracted = {w for w in words if w not in stopwords}
    
    # Explicitly check for common tech multi-word phrases and add individual keywords
    phrases = [
        "machine learning", "deep learning", "generative ai", "computer vision", 
        "vector database", "semantic search", "recommendation system", "learning to rank",
        "sentence embeddings", "information retrieval", "natural language processing"
    ]
    jd_lower = jd_text.lower()
    for phrase in phrases:
        if phrase in jd_lower:
            extracted.update(phrase.split())
            
    # Include default core technical shorthand abbreviations
    extracted.update({"ai", "ml", "nlp", "llm", "rag", "ltr", "knn", "ann"})
    
    return extracted

def detect_keyword_stuffer(candidate: Dict[str, Any], jd_keywords: Set[str] = None) -> Dict[str, Any]:
    """
    Flag candidates who list many skills relevant to the Job Description 
    but have little supporting career evidence.
    
    Args:
        candidate (Dict[str, Any]): The candidate dictionary.
        jd_keywords (Set[str]): Custom keywords extracted from the JD.
        
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
        
    # 3. Use default keywords if not provided
    if not jd_keywords:
        jd_keywords = {"ai", "ml", "machine learning", "deep learning", "nlp", "llm", "data science", "rag", "generative ai", "computer vision"}
        
    # 4. Get number of matching skills
    number_of_matching_skills = 0
    if isinstance(skills, list):
        for skill in skills:
            if not isinstance(skill, dict):
                continue
            skill_name = skill.get("name", "")
            if isinstance(skill_name, str):
                name_lower = skill_name.lower()
                if any(kw in name_lower for kw in jd_keywords):
                    number_of_matching_skills += 1
                
    # Logic: High matching skills + Low career score = Suspicious
    confidence = 0.0
    if number_of_matching_skills >= 5:
        if career_score <= 0.1:
            confidence = 0.9 if number_of_matching_skills >= 8 else 0.7
        elif career_score <= 0.3:
            confidence = 0.7 if number_of_matching_skills >= 8 else 0.5
        elif career_score <= 0.5:
            confidence = 0.4 if number_of_matching_skills >= 10 else 0.0
            
        if confidence > 0:
            if yoe > 5.0 and career_score < 0.2:
                confidence = min(1.0, confidence + 0.2)
            elif yoe < 2.0:
                # Junior candidates might list skills from coursework with no career evidence
                confidence = max(0.1, confidence - 0.3)
                
        if confidence >= 0.4:
            result["flag"] = True
            result["penalty"] = round(confidence * 0.8, 2)  # Max penalty 0.8
            
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
