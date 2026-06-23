import string
from typing import Any, Dict

EVIDENCE_CATEGORIES = {
    "retrieval_systems": {
        "keywords": {"retrieval", "information retrieval", "bm25", "dense retrieval", "sparse retrieval"},
        "weight": 5.0
    },
    "ranking_systems": {
        "keywords": {"ranking", "learning to rank", "ltr", "re ranking", "reranking", "cross encoder"},
        "weight": 5.0
    },
    "recommendation_systems": {
        "keywords": {"recommendation system", "recommendation systems", "recommender", "collaborative filtering", "content based filtering"},
        "weight": 4.0
    },
    "embeddings": {
        "keywords": {"embeddings", "embedding", "word2vec", "sentence transformers", "representation learning"},
        "weight": 4.0
    },
    "vector_databases": {
        "keywords": {"vector database", "vector databases", "vector db", "vector search", "faiss", "pinecone", "milvus", "qdrant", "weaviate", "chroma"},
        "weight": 4.0
    },
    "semantic_search": {
        "keywords": {"semantic search", "neural search", "dense search"},
        "weight": 4.0
    },
    "rag": {
        "keywords": {"rag", "retrieval augmented generation"},
        "weight": 3.0
    },
    "production_ml": {
        "keywords": {"production ml", "ml system", "ml systems", "mlops", "model deployment", "model serving", "scalable ml"},
        "weight": 3.0
    },
    "llms": {
        "keywords": {"llm", "large language model", "llms", "gpt", "bert", "llama", "transformers"},
        "weight": 2.0
    }
}

def get_career_score(candidate: Dict[str, Any]) -> float:
    """
    Analyze profile summary and career descriptions to detect evidence of specific AI/ML categories.
    Uses a weighted category system to calculate the final score.
    
    Args:
        candidate (Dict[str, Any]): The candidate dictionary.
        
    Returns:
        float: A normalized score between 0.0 and 1.0.
    """
    if not candidate:
        return 0.0
        
    combined_text = []
    
    # 1. Add profile summary
    profile = candidate.get("profile")
    if isinstance(profile, dict):
        summary = profile.get("summary", "")
        if isinstance(summary, str) and summary.strip():
            combined_text.append(summary.lower())
            
    # 2. Add career history descriptions
    career_history = candidate.get("career_history")
    if isinstance(career_history, list):
        for job in career_history:
            if not isinstance(job, dict):
                continue
            description = job.get("description", "")
            if isinstance(description, str) and description.strip():
                combined_text.append(description.lower())
                
    if not combined_text:
        return 0.0
        
    full_text = " ".join(combined_text)
    
    # Remove punctuation to ensure clean word boundaries and avoid substring matches
    translator = str.maketrans(string.punctuation, ' ' * len(string.punctuation))
    clean_text = full_text.translate(translator)
    
    # Collapse multiple spaces and pad with single spaces
    search_text = f" {' '.join(clean_text.split())} "
    
    score = 0.0
    
    # Calculate score based on category weights
    for category, data in EVIDENCE_CATEGORIES.items():
        if any(f" {keyword} " in search_text for keyword in data["keywords"]):
            score += data["weight"]
            
    return min(1.0, max(0.0, score / 15.0))

if __name__ == "__main__":
    example_candidate = {
        "candidate_id": "1",
        "profile": {
            "summary": "Experienced ML Engineer focusing on production ML and MLOps."
        },
        "career_history": [
            {
                "description": "Built RAG systems using LLMs and vector search with Pinecone."
            }
        ]
    }
    print(f"Career Score: {get_career_score(example_candidate)}")