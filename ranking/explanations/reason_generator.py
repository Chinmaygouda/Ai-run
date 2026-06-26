from typing import Any, Dict, List

def generate_reasoning(candidate: Dict[str, Any], features: Dict[str, Any], rank: int) -> str:
    """
    Generate a deterministic, bulleted explanation of why a candidate was ranked.
    
    Format:
    Ranked #X because:
    • Current Title
    • X.Y years experience
    • Domain-specific expertise indicators
    • Company type background
    • Active status / responsiveness
    
    Args:
        candidate (Dict[str, Any]): The raw candidate dictionary.
        features (Dict[str, Any]): The computed features for the candidate.
        rank (int): The candidate's final rank.
        
    Returns:
        str: A clean, bulleted reasoning text.
    """
    profile = candidate.get("profile", {})
    title = profile.get("current_title", "Software Engineer").strip()
    yoe = float(profile.get("years_of_experience", 0.0))
    
    # 1. Title bullet
    bullets = [f"• {title}"]
    
    # 2. Experience bullet
    bullets.append(f"• {yoe:.1f} years experience")
    
    # 3. Domain-specific highlights bullet
    combined_text = []
    if isinstance(profile, dict):
        combined_text.append(profile.get("summary", "").lower())
    for job in candidate.get("career_history", []):
        if isinstance(job, dict):
            combined_text.append(job.get("description", "").lower())
            
    full_text = " ".join(combined_text)
    
    highlights = []
    if any(kw in full_text for kw in ["retrieval", "bm25", "dense retrieval"]):
        highlights.append("retrieval")
    if any(kw in full_text for kw in ["ranking", "learning to rank", "rerank"]):
        highlights.append("ranking")
    if any(kw in full_text for kw in ["recommendation", "recommender"]):
        highlights.append("recommendations")
    if any(kw in full_text for kw in ["embedding", "sentence transformer"]):
        highlights.append("embeddings")
    if any(kw in full_text for kw in ["vector", "faiss", "pinecone", "qdrant"]):
        highlights.append("vector databases")
    if any(kw in full_text for kw in ["rag", "retrieval augmented generation"]):
        highlights.append("RAG systems")
    if any(kw in full_text for kw in ["production ml", "mlops", "model serving", "deployment"]):
        highlights.append("production ML")
        
    if highlights:
        # e.g., "Strong retrieval, ranking, and embeddings background"
        if len(highlights) > 2:
            items_str = f"{', '.join(highlights[:-1])}, and {highlights[-1]}"
        elif len(highlights) == 2:
            items_str = f"{highlights[0]} and {highlights[1]}"
        else:
            items_str = highlights[0]
        bullets.append(f"• Strong {items_str} background")
    else:
        bullets.append("• Machine Learning background")
        
    # 4. Product company bullet
    product_score = features.get("product_company_score", 0.0)
    if product_score >= 1.0:
        bullets.append("• Product company experience")
    elif product_score >= 0.5:
        bullets.append("• Tech-product environment background")
        
    # 5. Availability/Activity bullet
    signals = candidate.get("redrob_signals", {})
    if isinstance(signals, dict):
        open_to_work = signals.get("open_to_work_flag", False)
        recruiter_resp = signals.get("recruiter_response_rate", 0.0)
        
        active_parts = []
        if open_to_work:
            active_parts.append("active recently")
        try:
            if float(recruiter_resp) > 0.7:
                active_parts.append("high response rate")
        except (ValueError, TypeError):
            pass
            
        if active_parts:
            bullets.append(f"• {' and '.join(active_parts)}")
        else:
            bullets.append("• Available for contact")
            
    # Compile the final multi-line text
    reasoning_text = f"Ranked #{rank} because:\n" + "\n".join(bullets)
    return reasoning_text
