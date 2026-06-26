import pandas as pd
from typing import Dict, Any

def validate_submission_csv(file_path: str) -> Dict[str, Any]:
    """
    Perform validation checks on the submission CSV file.
    Checks:
    - File exists
    - Required columns are present (candidate_id, rank, score, reasoning)
    - No duplicate candidate IDs
    - No missing values in columns
    - Ranks are sequential and start at 1 up to N
    - Length is exactly 100
    
    Args:
        file_path (str): Path to the submission CSV file.
        
    Returns:
        Dict[str, Any]: A dictionary containing validation 'status' (bool) and a list of 'warnings' or 'errors'.
    """
    results = {
        "valid": True,
        "errors": [],
        "warnings": []
    }
    
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        results["valid"] = False
        results["errors"].append(f"Failed to read file: {str(e)}")
        return results
        
    # 1. Check columns
    required_cols = {"candidate_id", "rank", "score", "reasoning"}
    missing_cols = required_cols - set(df.columns)
    if missing_cols:
        results["valid"] = False
        results["errors"].append(f"Missing required columns: {missing_cols}")
        
    # 2. Check length
    if len(df) != 100:
        results["warnings"].append(f"Expected exactly 100 rows, found {len(df)}")
        
    # 3. Check duplicate candidate_ids
    if "candidate_id" in df.columns:
        duplicates = df["candidate_id"].duplicated().sum()
        if duplicates > 0:
            results["valid"] = False
            results["errors"].append(f"Found {duplicates} duplicate candidate_id(s)")
            
    # 4. Check missing values
    for col in df.columns:
        missing_count = df[col].isnull().sum()
        if missing_count > 0:
            results["valid"] = False
            results["errors"].append(f"Column '{col}' has {missing_count} missing values")
            
    # 5. Check rank ordering and values
    if "rank" in df.columns:
        sorted_ranks = df["rank"].tolist()
        expected_ranks = list(range(1, len(df) + 1))
        if sorted_ranks != expected_ranks:
            results["valid"] = False
            results["errors"].append("Ranks are not sequential or do not start from 1.")
            
    # 6. Check score ordering
    if "score" in df.columns:
        is_sorted_descending = df["score"].is_monotonic_decreasing
        if not is_sorted_descending:
            results["warnings"].append("Scores are not strictly sorted in descending order.")
            
    return results
