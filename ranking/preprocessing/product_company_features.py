from typing import Any, Dict

# Consulting / services firms (to penalize and check for exclusive service backgrounds)
CONSULTING_FIRMS = {
    "tcs", "tata consultancy", "infosys", "wipro", "accenture", "cognizant", "capgemini",
    "tech mahindra", "hcl", "mindtree", "mphasis", "l&t", "lnt infotech", "l&t infotech",
    "hexaware", "persistent", "cognizant technology solutions", "hcltech", "hcl technologies"
}

PRODUCT_INDICATORS = {
    "product", "startup", "series", "founding", "platform",
    "consumer", "saas", "b2b", "b2c", "marketplace",
    "own product", "in-house", "core product", "platform team",
}

def get_product_company_score(candidate: Dict[str, Any]) -> float:
    """
    Score based on whether career history indicates product-company experience
    vs. pure services/consulting background.
    
    The JD explicitly prefers product-company experience and disfavors
    candidates who have only worked at consulting firms (TCS, Infosys, etc.).
    
    Args:
        candidate: The candidate dictionary.
        
    Returns:
        float: Score between 0.0 and 1.0.
    """
    if not candidate:
        return 0.0
        
    career_history = candidate.get("career_history", [])
    if not isinstance(career_history, list) or not career_history:
        return 0.0
    
    product_count = 0
    consulting_count = 0
    total_count = 0
    
    for job in career_history:
        if not isinstance(job, dict):
            continue
        total_count += 1
        
        company = str(job.get("company", "")).lower()
        description = str(job.get("description", "")).lower()
        title = str(job.get("title", "")).lower()
        
        # Check for consulting firm
        is_consulting = any(firm in company for firm in CONSULTING_FIRMS)
        
        # Check for product company indicators
        is_product = any(indicator in description or indicator in title 
                         for indicator in PRODUCT_INDICATORS)
        
        # Also check explicit flag if present (from synthetic/test data)
        has_product_flag = job.get("is_product_company", False)
        
        if is_consulting and not is_product and not has_product_flag:
            consulting_count += 1
        elif is_product or has_product_flag:
            product_count += 1
    
    if total_count == 0:
        return 0.0
    
    # Score: +1 for product, -0.5 for consulting, normalize to [0, 1]
    raw_score = (product_count - 0.5 * consulting_count) / total_count
    return min(1.0, max(0.0, raw_score + 0.3))  # Small baseline for mixed backgrounds

def check_is_services_only(candidate: Dict[str, Any]) -> bool:
    """
    Check if the candidate has worked ONLY at consulting/services firms
    throughout their entire career history.
    """
    if not candidate:
        return False
    career_history = candidate.get("career_history", [])
    if not isinstance(career_history, list) or not career_history:
        return False
    
    total_jobs = 0
    consulting_jobs = 0
    for job in career_history:
        if not isinstance(job, dict):
            continue
        total_jobs += 1
        company = str(job.get("company", "")).lower()
        
        is_consulting = any(firm in company for firm in CONSULTING_FIRMS)
        if is_consulting:
            consulting_jobs += 1
            
    return total_jobs > 0 and consulting_jobs == total_jobs

