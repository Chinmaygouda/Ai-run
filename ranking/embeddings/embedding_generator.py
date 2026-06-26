import numpy as np
import math
import re
from collections import Counter
from typing import List, Dict, Any

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    # Fallback to avoid import error if sentence-transformers is missing
    SentenceTransformer = None

class SimpleTFIDF:
    def __init__(self, stopwords=None):
        self.stopwords = stopwords or {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
            "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could",
            "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
            "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's",
            "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm",
            "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't",
            "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
            "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't",
            "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
            "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
            "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't",
            "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's",
            "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
            "yourselves"
        }
        self.idf = {}
        self.vocabulary = set()

    def tokenize(self, text: str) -> List[str]:
        # Lowercase, find alphanumeric words of length >= 2
        words = re.findall(r'\b[a-z0-9]{2,}\b', text.lower())
        return [w for w in words if w not in self.stopwords]

    def fit_transform(self, documents: List[str]) -> List[Dict[str, float]]:
        tokenized_docs = [self.tokenize(doc) for doc in documents]
        doc_count = len(documents)
        df = Counter()
        for doc in tokenized_docs:
            for word in set(doc):
                df[word] += 1
        
        self.vocabulary = set(df.keys())
        self.idf = {word: math.log((1 + doc_count) / (1 + count)) + 1 for word, count in df.items()}
        return [self._to_tfidf_vector(doc) for doc in tokenized_docs]

    def _to_tfidf_vector(self, tokenized_doc: List[str]) -> Dict[str, float]:
        tf = Counter(tokenized_doc)
        doc_len = len(tokenized_doc)
        if doc_len == 0:
            return {}
        
        vector = {}
        for word, count in tf.items():
            if word in self.idf:
                vector[word] = (count / doc_len) * self.idf[word]
        return vector

    def transform_single(self, doc: str) -> Dict[str, float]:
        tokenized = self.tokenize(doc)
        return self._to_tfidf_vector(tokenized)

    def cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        intersection = set(vec1.keys()) & set(vec2.keys())
        numerator = sum(vec1[w] * vec2[w] for w in intersection)
        
        sum1 = sum(val ** 2 for val in vec1.values())
        sum2 = sum(val ** 2 for val in vec2.values())
        
        if not sum1 or not sum2:
            return 0.0
            
        return numerator / (math.sqrt(sum1) * math.sqrt(sum2))

class SemanticReranker:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        try:
            if SentenceTransformer is not None:
                self.model = SentenceTransformer(model_name)
            else:
                self.model = None
        except Exception as e:
            print(f"Warning: Failed to load SentenceTransformer model due to: {e}. Falling back to TF-IDF.")
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
        Falls back to TF-IDF cosine similarity if SentenceTransformer is unavailable.
        """
        if self.model is None:
            print("SentenceTransformer unavailable — using TF-IDF cosine similarity fallback.")
            if not candidates:
                return []
            candidate_texts = [self._extract_text(c) for c in candidates]
            tfidf = SimpleTFIDF()
            all_docs = [jd_text] + candidate_texts
            tfidf.fit_transform(all_docs)  # Build IDF over entire corpus
            jd_vec = tfidf.transform_single(jd_text)
            scores = []
            for ctext in candidate_texts:
                cand_vec = tfidf.transform_single(ctext)
                scores.append(tfidf.cosine_similarity(jd_vec, cand_vec))
            return scores
            
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
