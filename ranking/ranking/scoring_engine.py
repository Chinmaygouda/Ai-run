import pandas as pd
from typing import Dict, List, Any

try:
    from ranking.weight_config import RULE_WEIGHTS
except ModuleNotFoundError:
    from weight_config import RULE_WEIGHTS

def calculate_rule_score(row: Any) -> float:
    """
    Compute the base weighted score for a candidate based on extracted features.
    
    Args:
        row: A pandas Series or dictionary containing the feature scores.
        
    Returns:
        float: The raw weighted rule score.
    """
    # If it is a dictionary, use dict.get, else use standard subscript/attribute access
    get_val = lambda key: row.get(key, 0.0) if isinstance(row, dict) else getattr(row, key, 0.0)
    
    score = (
        RULE_WEIGHTS["title_score"] * float(get_val("title_score") or 0.0) +
        RULE_WEIGHTS["skill_score"] * float(get_val("skill_score") or 0.0) +
        RULE_WEIGHTS["career_score"] * float(get_val("career_score") or 0.0) +
        RULE_WEIGHTS["experience_score"] * float(get_val("experience_score") or 0.0) +
        RULE_WEIGHTS["product_company_score"] * float(get_val("product_company_score") or 0.0) +
        RULE_WEIGHTS["behavior_score"] * float(get_val("behavior_score") or 0.0) +
        RULE_WEIGHTS["location_score"] * float(get_val("location_score") or 0.0)
    )
    return score

def score_and_filter_candidates(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply the rule-based scoring formula, apply severity-based trap penalties,
    and filter out invalid candidates.
    
    Trap Rules:
    - Honeypots: Rejected outright.
    - Keyword Stuffers: Multiplied by 0.25. If title_score < 0.3, rejected outright.
    - Behavioral Twins: Multiplied by (1 - duplicate_penalty) [small penalty].
    
    Args:
        df (pd.DataFrame): DataFrame containing candidate features.
        
    Returns:
        pd.DataFrame: DataFrame with scoring and flags computed.
    """
    # 1. Base rule score
    df["rule_score"] = df.apply(calculate_rule_score, axis=1).fillna(0.0)
    
    # 2. Extract flags and penalties
    keyword_stuffer_flag = df["keyword_stuffer_flag"].astype(bool) if "keyword_stuffer_flag" in df.columns else pd.Series(False, index=df.index)
    honeypot_flag = df["honeypot_flag"].astype(bool) if "honeypot_flag" in df.columns else pd.Series(False, index=df.index)
    
    honeypot_penalty = df["honeypot_penalty"].fillna(0.0) if "honeypot_penalty" in df.columns else 0.0
    duplicate_penalty = df["duplicate_penalty"].fillna(0.0) if "duplicate_penalty" in df.columns else 0.0
    
    # 3. Apply stuffer penalty (multiplier = 0.25 if stuffer, else 1.0)
    df["stuffer_multiplier"] = 1.0
    if "keyword_stuffer_flag" in df.columns:
        df.loc[keyword_stuffer_flag, "stuffer_multiplier"] = 0.25
        
    # 4. Calculate final rule score
    df["final_rule_score"] = (
        df["rule_score"] * 
        df["stuffer_multiplier"] * 
        (1.0 - honeypot_penalty) * 
        (1.0 - duplicate_penalty)
    ).fillna(0.0)
    
    # 5. Determine if rejected completely (is_trap = True)
    # - All Honeypots are filtered out
    # - Keyword stuffers with low title scores (< 0.3) are filtered out
    title_score = df["title_score"] if "title_score" in df.columns else pd.Series(1.0, index=df.index)
    
    reject_honeypot = honeypot_flag
    reject_stuffer = keyword_stuffer_flag & (title_score < 0.3)
    
    df["is_trap"] = reject_honeypot | reject_stuffer
    
    return df

def get_top_500_candidates(df: pd.DataFrame) -> pd.DataFrame:
    """
    Filter out traps and select the top 500 candidates based on final rule score.
    
    Args:
        df (pd.DataFrame): Scored candidate features DataFrame.
        
    Returns:
        pd.DataFrame: Top 500 candidates.
    """
    # Filter out traps
    valid_candidates = df[~df["is_trap"]].copy()
    
    # Take top 500 based on final rule score
    top_500 = valid_candidates.sort_values(by="final_rule_score", ascending=False).head(500)
    return top_500
