import hashlib
from typing import List, Dict, Any

def get_description_hashes(candidate: Dict[str, Any]) -> List[str]:
    """
    Extract hashes of career history descriptions for duplicate checking.
    """
    hashes = []
    career_history = candidate.get("career_history", [])
    if isinstance(career_history, list):
        for job in career_history:
            if not isinstance(job, dict):
                continue
            desc = job.get("description", "").strip().lower()
            if len(desc) > 20: # Only check significant descriptions
                # Create a simple hash to minimize memory usage
                desc_hash = hashlib.md5(desc.encode('utf-8')).hexdigest()
                hashes.append(desc_hash)
    return hashes

def calculate_duplicate_penalty(hashes: List[str], global_hash_counts: Dict[str, int]) -> Dict[str, Any]:
    """
    Detect if any of the candidate's career descriptions are shared with other candidates.
    Applies a small penalty if duplicates are found.
    
    Args:
        hashes (List[str]): Description hashes for the candidate.
        global_hash_counts (Dict[str, int]): Global frequencies of hashes across the dataset.
        
    Returns:
        Dict[str, Any]: Dictionary with 'flag' (bool) and 'penalty' (float).
    """
    is_duplicate = False
    max_count = 1
    
    for h in hashes:
        count = global_hash_counts.get(h, 1)
        if count > 1:
            is_duplicate = True
            max_count = max(max_count, count)
            
    # Apply a small penalty for duplicates (behavioral twins)
    # Scale penalty slightly based on duplicate frequency (max 0.2 penalty)
    penalty = 0.0
    if is_duplicate:
        penalty = 0.1 if max_count <= 3 else 0.2
        
    return {
        "flag": is_duplicate,
        "penalty": penalty,
        "max_occurrences": max_count
    }
