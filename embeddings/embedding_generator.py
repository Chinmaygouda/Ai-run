import numpy as np
from typing import List, Dict, Any

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    # Fallback to avoid import error if sentence-transformers is missing
    SentenceTransformer = None

class SemanticReranker:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        if SentenceTransformer is not None:
            self.model = SentenceTransformer(model_name)
        else:
            self.model = None
            
    def _extract_text(self, candidate: Dict[str, Any]) -> str:
        """
        Extract summary, career history descriptions, and projects 
        from the candidate profile to create a single context string.
        """
        text_parts = []
        profile = candidate.get("profile", {})
        if isinstance(profile, dict):
            text_parts.append(profile.get("current_title", ""))
            text_parts.append(profile.get("summary", ""))
            
        career_history = candidate.get("career_history", [])
        if isinstance(career_history, list):
            for job in career_history:
                if isinstance(job, dict):
                    text_parts.append(job.get("title", ""))
                    text_parts.append(job.get("description", ""))
                    
        projects = candidate.get("projects", [])
        if isinstance(projects, list):
            for proj in projects:
                if isinstance(proj, dict):
                    text_parts.append(proj.get("title", ""))
                    text_parts.append(proj.get("description", ""))
                    
        # Filter empty strings and join with spacing
        clean_parts = [t.strip() for t in text_parts if isinstance(t, str) and t.strip()]
        return " ".join(clean_parts)
        
    def score_candidates(self, jd_text: str, candidates: List[Dict[str, Any]]) -> List[float]:
        """
        Encode the JD and candidates, and return cosine similarity scores.
        """
        if self.model is None:
            print("Warning: SentenceTransformer is not installed. Returning dummy semantic scores (0.5).")
            return [0.5] * len(candidates)
            
        if not candidates:
            return []
            
        # 1. Encode Job Description
        jd_embedding = self.model.encode(jd_text, convert_to_numpy=True)
        
        # 2. Extract and encode candidate descriptions
        candidate_texts = [self._extract_text(c) for c in candidates]
        candidate_embeddings = self.model.encode(candidate_texts, convert_to_numpy=True)
        
        # 3. Compute Cosine Similarity
        # Normalize embeddings
        jd_norm = jd_embedding / np.linalg.norm(jd_embedding)
        cand_norms = candidate_embeddings / np.linalg.norm(candidate_embeddings, axis=1, keepdims=True)
        
        # Dot product gives Cosine Similarity
        scores = np.dot(cand_norms, jd_norm)
        
        # Convert to standard python float list
        return [float(s) for s in scores]
