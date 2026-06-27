from typing import Any, Dict, List

def generate_reasoning(candidate: Dict[str, Any], features: Dict[str, Any], rank: int) -> str:
    """
    Generate a natural-language, 1-2 sentence justification explaining why 
    this candidate is at this rank.
    
    Args:
        candidate (Dict[str, Any]): The raw candidate dictionary.
        features (Dict[str, Any]): The computed features for the candidate.
        rank (int): The candidate's final rank.
        
    Returns:
        str: A clean, single-line reasoning text without newlines.
    """
    profile = candidate.get("profile", {})
    title = profile.get("current_title", "Software Engineer").strip()
    yoe = float(profile.get("years_of_experience", 0.0))
    location = profile.get("location", "").strip()
    
    # 1. Opening templates (varying by rank category to ensure variation and tone consistency)
    if rank <= 10:
        openings = [
            f"Exceptional candidate currently working as a {title} with {yoe:.1f} years of experience.",
            f"Stellar fit for the founding Senior AI Engineer role, offering {yoe:.1f} years of experience as a {title}.",
            f"Top-tier candidate currently serving as a {title} with a strong {yoe:.1f}-year track record."
        ]
    elif rank <= 50:
        openings = [
            f"Strong matching candidate currently working as a {title} with {yoe:.1f} years of experience.",
            f"Well-suited candidate offering {yoe:.1f} years of experience as a {title}.",
            f"Highly competent {title} with {yoe:.1f} years of experience."
        ]
    else:
        openings = [
            f"Experienced {title} with {yoe:.1f} years of experience, showing solid matching skills.",
            f"Decent match currently working as a {title} with {yoe:.1f} years of experience.",
            f"Offers {yoe:.1f} years of experience as a {title} with adjacent technical skills."
        ]
    
    # Deterministically select opening style based on candidate_id hash to avoid random fluctuation in tests
    cand_id = str(candidate.get("candidate_id", ""))
    hash_val = sum(ord(c) for c in cand_id)
    opening = openings[hash_val % len(openings)]
    
    # 2. Extract technical highlights from candidate descriptions
    combined_text = []
    if isinstance(profile, dict):
        combined_text.append(profile.get("summary", "").lower())
    for job in candidate.get("career_history", []):
        if isinstance(job, dict):
            combined_text.append(job.get("description", "").lower())
    full_text = " ".join(combined_text)
    
    highlights = []
    if any(kw in full_text for kw in ["retrieval", "bm25", "dense retrieval"]):
        highlights.append("information retrieval")
    if any(kw in full_text for kw in ["ranking", "learning to rank", "rerank"]):
        highlights.append("ranking systems")
    if any(kw in full_text for kw in ["recommendation", "recommender"]):
        highlights.append("recommendations")
    if any(kw in full_text for kw in ["embedding", "sentence transformer"]):
        highlights.append("sentence embeddings")
    if any(kw in full_text for kw in ["vector", "faiss", "pinecone", "qdrant"]):
        highlights.append("vector databases")
    if any(kw in full_text for kw in ["rag", "retrieval augmented generation"]):
        highlights.append("RAG pipelines")
    if any(kw in full_text for kw in ["production ml", "mlops", "model serving", "deployment"]):
        highlights.append("production MLOps")
        
    # 3. Build technical highlight clause
    tech_clause = ""
    if highlights:
        if len(highlights) > 2:
            tech_clause = f"Demonstrates strong experience in {', '.join(highlights[:2])}, and {highlights[-1]}."
        elif len(highlights) == 2:
            tech_clause = f"Brings hands-on expertise in {highlights[0]} and {highlights[1]}."
        else:
            tech_clause = f"Brings solid experience in {highlights[0]}."
    else:
        tech_clause = "Brings a good machine learning foundation."
        
    # 4. Check for product company experience
    product_score = features.get("product_company_score", 0.0)
    product_clause = ""
    if product_score >= 1.0:
        product_clause = "proven track record in product-company environments"
    elif product_score >= 0.5:
        product_clause = "prior experience in tech-product environments"
        
    # 5. Extract behavioral signals and notice period
    signals = candidate.get("redrob_signals", {})
    open_to_work = signals.get("open_to_work_flag", False)
    recruiter_resp = float(signals.get("recruiter_response_rate", 0.0) or 0.0)
    notice_period = int(signals.get("notice_period_days", 30) or 30)
    
    # 6. Build behavioral and honest concern clauses
    concerns = []
    
    # Notice period concern
    if notice_period > 60:
        concerns.append(f"a longer notice period ({notice_period} days)")
    elif notice_period > 30:
        concerns.append(f"a {notice_period}-day notice period")
        
    # Location context (Pune/Noida check)
    loc_lower = location.lower()
    in_target_city = any(city in loc_lower for city in ["pune", "noida", "delhi", "ncr", "gurgaon"])
    if not in_target_city and location:
        concerns.append(f"being located in {location}")
        
    # Recruiter response rate concern
    if recruiter_resp < 0.4:
        concerns.append("lower recent platform engagement")
        
    # Combine everything into 1-2 fluent sentences
    # Sentence 1: Opening + Tech Clause + Product Environment (if applicable)
    if product_clause:
        s1 = f"{opening[:-1]} with a {product_clause}, specializing in {highlights[0]} and related AI tech." if highlights else f"{opening[:-1]} with a {product_clause}."
    else:
        s1 = f"{opening} {tech_clause}"
        
    # Sentence 2: Behavioral / Engagement + Concerns (Honest Concerns requirement)
    s2_parts = []
    if open_to_work:
        s2_parts.append("They are actively looking for new opportunities")
    else:
        s2_parts.append("They are open to contact")
        
    if recruiter_resp > 0.7:
        s2_parts.append("exhibit a high recruiter response rate")
        
    s2 = " and ".join(s2_parts) + "."
    
    if concerns:
        # Acknowledge gaps as requested in Stage 4 review
        if len(concerns) > 1:
            concern_str = f" {', '.join(concerns[:-1])}, and {concerns[-1]}"
        else:
            concern_str = f" {concerns[0]}"
        s2 += f" Note concerns regarding{concern_str}."
        
    # Combine and clean up spacing / newlines
    full_reasoning = f"{s1} {s2}".replace("\n", " ").strip()
    full_reasoning = " ".join(full_reasoning.split())
    
    return full_reasoning

