import os
import sys
import json
import pandas as pd
from typing import List, Dict, Any

# Add parent directory to path to handle imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import multiprocessing
from preprocessing.feature_extractor import extract_features
from traps.duplicate_detector import get_description_hashes, calculate_duplicate_penalty
from traps.keyword_stuffer import extract_jd_keywords
from embeddings.embedding_generator import SemanticReranker
from explanations.reason_generator import generate_reasoning

# Fallback imports for ranking module to prevent path shadowing issues
try:
    from ranking.scoring_engine import score_and_filter_candidates, get_top_500_candidates
    from ranking.weight_config import FUSION_WEIGHTS
    from ranking.evaluation import validate_submission_csv
except ModuleNotFoundError:
    from scoring_engine import score_and_filter_candidates, get_top_500_candidates
    from weight_config import FUSION_WEIGHTS
    from evaluation import validate_submission_csv

def ensure_directories(base_dir: str = None):
    """Create outputs/ and data/ directories if they don't exist."""
    if base_dir is None:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    os.makedirs(os.path.join(base_dir, "outputs"), exist_ok=True)
    os.makedirs(os.path.join(base_dir, "data"), exist_ok=True)

def find_dataset_file(base_dir: str = None) -> str:
    """Find the candidates.jsonl file path in either root or data/."""
    if base_dir is None:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    paths = [
        os.path.join(base_dir, "data", "candidates.jsonl"),
        os.path.join(base_dir, "candidates.jsonl")
    ]
    for path in paths:
        if os.path.exists(path):
            return path
    return ""

def clean_id(raw_id: Any) -> str:
    """
    Safely normalizes IDs to string type, stripping float suffixes (e.g. '.0') 
    which pandas commonly introduces during CSV reading.
    """
    if pd.isna(raw_id):
        return ""
    try:
        # If the input is float or looks like a float with no actual fractional part
        val = float(raw_id)
        if val.is_integer():
            return str(int(val))
    except (ValueError, TypeError):
        pass
    return str(raw_id).strip()

def load_job_description(base_dir: str = None) -> str:
    """Load the job description text."""
    if base_dir is None:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    path = os.path.join(base_dir, "data", "jd.txt")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return (
        "Recommendation Systems Engineer. Build, scale, and optimize large-scale information "
        "retrieval, semantic search, ranking, and recommendation systems. Experience with sentence "
        "embeddings (sentence-transformers), vector databases (FAISS, Pinecone, Qdrant), learning to "
        "rank (LTR) systems, cross-encoders, and production MLOps deployment of LLMs is highly desired."
    )

def build_global_description_counts(dataset_path: str) -> Dict[str, int]:
    """
    Perform a fast global scan of career descriptions to count templates and detect duplicates.
    """
    print("Scanning career descriptions to build global frequency index (Behavioral Twins detection)...")
    global_counts = {}
    
    with open(dataset_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                candidate = json.loads(line)
                hashes = get_description_hashes(candidate)
                for h in hashes:
                    global_counts[h] = global_counts.get(h, 0) + 1
            except Exception:
                pass
    
    # Filter to only keep duplicates to save memory and serialization overhead in multiprocessing
    global_counts = {k: v for k, v in global_counts.items() if v > 1}
    return global_counts

def _extract_candidate_features_worker(args):
    """
    Worker function for parallel feature extraction.
    Takes a tuple: (line_str, global_counts, jd_keywords)
    Returns the feature dictionary or None on error.
    """
    line_str, global_counts, jd_keywords = args
    if not line_str.strip():
        return None
    try:
        candidate = json.loads(line_str)
        
        # 1. Base feature extraction with dynamic keywords
        features = extract_features(candidate, jd_keywords)
        
        # Normalize candidate ID
        features["candidate_id"] = clean_id(features.get("candidate_id", ""))
        
        # 2. Duplicate detection (Behavioral Twins)
        desc_hashes = get_description_hashes(candidate)
        dup_result = calculate_duplicate_penalty(desc_hashes, global_counts)
        
        features["duplicate_flag"] = dup_result["flag"]
        features["duplicate_penalty"] = dup_result["penalty"]
        
        return features
    except Exception:
        return None

def run_feature_extraction_pipeline(dataset_path: str, global_counts: Dict[str, int], base_dir: str = None) -> pd.DataFrame:
    """
    Run feature extraction and trap detection on the raw dataset.
    """
    if base_dir is None:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    print(f"Reading candidates from {dataset_path} and running extraction pipeline (multiprocessing)...")
    
    # 1. Load JD and extract keywords once
    jd_text = load_job_description(base_dir)
    jd_keywords = extract_jd_keywords(jd_text)
    print(f"Extracted {len(jd_keywords)} dynamic keywords from Job Description.")
    
    # 2. Read all lines
    print("Loading candidate records into memory...")
    with open(dataset_path, "r", encoding="utf-8") as f:
        lines = [line for line in f if line.strip()]
        
    num_candidates = len(lines)
    print(f"Loaded {num_candidates} records. Spawning worker pool...")
    
    # 3. Use multiprocessing pool to parallelize
    num_workers = max(1, multiprocessing.cpu_count() - 1)
    print(f"Using {num_workers} processes for parallel feature extraction.")
    
    # Prepare arguments
    tasks = [(line, global_counts, jd_keywords) for line in lines]
    
    rows = []
    chunksize = max(1, num_candidates // (num_workers * 10))
    
    with multiprocessing.Pool(processes=num_workers) as pool:
        for result in pool.imap(_extract_candidate_features_worker, tasks, chunksize=chunksize):
            if result is not None:
                rows.append(result)
                
    df = pd.DataFrame(rows)
    df.to_csv(os.path.join(base_dir, "outputs", "candidate_features.csv"), index=False)
    print(f"Feature extraction complete. Extracted features for {len(df)} candidates.")
    return df

def load_top_candidates_raw(dataset_path: str, target_ids: set) -> Dict[str, Dict[str, Any]]:
    """
    Memory-efficient loader: reads the JSONL file but only parses and loads 
    the raw candidate profiles for IDs in the target set.
    """
    print(f"Selectively loading raw profiles for {len(target_ids)} target candidates...")
    raw_candidates = {}
    
    with open(dataset_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                candidate = json.loads(line)
                cid = clean_id(candidate.get("candidate_id", ""))
                if cid in target_ids:
                    raw_candidates[cid] = candidate
            except Exception:
                pass
                        
    return raw_candidates

def run_ranking_pipeline(base_dir: str = None):
    """
    Orchestrate the entire pipeline:
    1. Load JD and candidate features (or generate features if missing).
    2. Run rule-based scoring and filter traps.
    3. Select Top 500 candidates.
    4. Selectively load raw candidate text for the Top 500.
    5. Run semantic reranking on the Top 500.
    6. Fuse scores and select the Top 100.
    7. Generate explanations for the Top 100.
    8. Write output files (top100.csv and submission.csv) and run validation.
    """
    if base_dir is None:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        
    ensure_directories(base_dir)
    
    # 1. Load Job Description
    jd_text = load_job_description(base_dir)
    print(f"Loaded Job Description: {jd_text[:120]}...")
    
    # 2. Check dataset file
    dataset_path = find_dataset_file(base_dir)
    feature_csv = os.path.join(base_dir, "outputs", "candidate_features.csv")
    
    df_features = None
    
    if os.path.exists(feature_csv):
        print(f"Loading pre-computed features from {feature_csv}...")
        df_features = pd.read_csv(feature_csv)
        # Ensure candidate_ids are normalized strings
        df_features["candidate_id"] = df_features["candidate_id"].apply(clean_id)
        # If we loaded from CSV, check if duplicate_penalty column is present, otherwise recalculate
        if "duplicate_penalty" not in df_features.columns and dataset_path:
            print("Pre-computed features are missing duplicate description check. Re-running extraction...")
            df_features = None
            
        # Incremental update check for newly ingested candidates
        if df_features is not None and dataset_path:
            try:
                # Read all candidate IDs in dataset_path
                all_dataset_ids = set()
                with open(dataset_path, "r", encoding="utf-8") as f:
                    for line in f:
                        if not line.strip():
                            continue
                        try:
                            obj = json.loads(line)
                            cid = clean_id(obj.get("candidate_id", ""))
                            if cid:
                                all_dataset_ids.add(cid)
                        except Exception:
                            pass
                
                existing_ids = set(df_features["candidate_id"].tolist())
                missing_ids = all_dataset_ids - existing_ids
                
                if missing_ids:
                    print(f"Detected {len(missing_ids)} new candidates in dataset. Extracting features incrementally...")
                    missing_candidates = []
                    with open(dataset_path, "r", encoding="utf-8") as f:
                        for line in f:
                            if not line.strip():
                                continue
                            try:
                                obj = json.loads(line)
                                cid = clean_id(obj.get("candidate_id", ""))
                                if cid in missing_ids:
                                    missing_candidates.append(obj)
                            except Exception:
                                pass
                    
                    if missing_candidates:
                        # Extract JD keywords and global counts
                        from traps.keyword_stuffer import extract_jd_keywords
                        from traps.duplicate_detector import get_description_hashes, calculate_duplicate_penalty
                        
                        jd_keywords = extract_jd_keywords(jd_text)
                        global_counts = build_global_description_counts(dataset_path)
                        
                        new_rows = []
                        for cand in missing_candidates:
                            features = extract_features(cand, jd_keywords)
                            features["candidate_id"] = clean_id(features.get("candidate_id", ""))
                            
                            # Duplicate check (Behavioral Twins)
                            desc_hashes = get_description_hashes(cand)
                            dup_result = calculate_duplicate_penalty(desc_hashes, global_counts)
                            features["duplicate_flag"] = dup_result["flag"]
                            features["duplicate_penalty"] = dup_result["penalty"]
                            
                            new_rows.append(features)
                            
                        df_new = pd.DataFrame(new_rows)
                        df_features = pd.concat([df_features, df_new], ignore_index=True)
                        df_features.to_csv(feature_csv, index=False)
                        print(f"Appended {len(df_new)} new candidate features to cache.")
            except Exception as e:
                print(f"Warning: Failed to check/perform incremental feature extraction: {e}")
            
    if df_features is None:
        if not dataset_path:
            print("Error: candidates.jsonl not found in root or data/ directory. Cannot extract features.")
            raise FileNotFoundError("candidates.jsonl not found in root or data/ directory. Cannot extract features.")
        global_counts = build_global_description_counts(dataset_path)
        df_features = run_feature_extraction_pipeline(dataset_path, global_counts, base_dir)
        
    print(f"Loaded features for {len(df_features)} candidates.")
    
    # 3. Rule-Based Ranking & Filtering
    print("Running rule-based ranking and filtering traps...")
    df_scored = score_and_filter_candidates(df_features)
    
    # Print statistics on traps caught
    keyword_stuffers = df_scored["keyword_stuffer_flag"].sum() if "keyword_stuffer_flag" in df_scored.columns else 0
    honeypots = df_scored["honeypot_flag"].sum() if "honeypot_flag" in df_scored.columns else 0
    behavioral_twins = df_scored["duplicate_flag"].sum() if "duplicate_flag" in df_scored.columns else 0
    print(f"Trap Detection: Flagged {keyword_stuffers} keyword stuffers, {honeypots} honeypots, and {behavioral_twins} behavioral twins.")
    
    # Select Top 500
    top_500 = get_top_500_candidates(df_scored).copy()
    print(f"Selected Top {len(top_500)} candidates for semantic reranking.")
    
    if len(top_500) == 0:
        print("Error: No valid candidates remaining after trap filtering.")
        raise ValueError("No valid candidates remaining after trap filtering.")
        
    # 4. Selective raw data loading
    if not dataset_path:
        # If we loaded from CSV but don't have JSONL, we can't do semantic search
        print("Warning: candidates.jsonl not found. Cannot perform semantic reranking.")
        print("Using rule-based score as final score.")
        top_500["semantic_score"] = top_500["final_rule_score"]
        top_500["final_score"] = top_500["final_rule_score"]
        top_100 = top_500.head(100).copy()
        
        # Populate dummy reasoning
        top_100["rank"] = range(1, len(top_100) + 1)
        top_100["reasoning"] = [
            f"Ranked #{r} because:\n• Base features rule fit\n• Profile text unavailable" 
            for r in top_100["rank"]
        ]
    else:
        top_500_ids = set(top_500["candidate_id"].apply(clean_id))
        raw_candidates = load_top_candidates_raw(dataset_path, top_500_ids)
        
        # 5. Semantic Reranking on Top 500
        print("Initializing Sentence Transformer (all-MiniLM-L6-v2) for semantic reranking...")
        reranker = SemanticReranker()
        
        # Build raw candidate list aligned with top_500 order
        ordered_raw_candidates = []
        valid_top_500_rows = []
        
        for idx, row in top_500.iterrows():
            cid = clean_id(row["candidate_id"])
            if cid in raw_candidates:
                ordered_raw_candidates.append(raw_candidates[cid])
                valid_top_500_rows.append(row)
                
        df_top_500_valid = pd.DataFrame(valid_top_500_rows).copy()
        
        if len(df_top_500_valid) == 0:
            print("Error: None of the Top 500 candidate IDs matched raw profiles from candidates.jsonl.")
            raise ValueError("None of the Top 500 candidate IDs matched raw profiles from candidates.jsonl.")
            
        print("Computing similarity scores...")
        semantic_scores = reranker.score_candidates(jd_text, ordered_raw_candidates)
        df_top_500_valid["semantic_score"] = semantic_scores
        
        # 6. Final Fusion
        # final_score = 0.7 * rule_score + 0.3 * semantic_score
        w_rule = FUSION_WEIGHTS["rule_score_weight"]
        w_sem = FUSION_WEIGHTS["semantic_score_weight"]
        
        df_top_500_valid["final_score"] = (
            w_rule * df_top_500_valid["final_rule_score"].fillna(0.0) +
            w_sem * df_top_500_valid["semantic_score"].fillna(0.0)
        ).fillna(0.0)
        
        # Sort and select Top 100 with candidate_id tie-breaker
        top_100 = df_top_500_valid.sort_values(by=["final_score", "candidate_id"], ascending=[False, True]).head(100).copy()
        
        # Assign ranks
        top_100["rank"] = range(1, len(top_100) + 1)
        
        # 7. Generate Explanations for Top 100
        print("Generating natural language explanations for the Top 100 candidates...")
        explanations = []
        for idx, row in top_100.iterrows():
            cid = clean_id(row["candidate_id"])
            raw_cand = raw_candidates[cid]
            features_dict = row.to_dict()
            explanations.append(generate_reasoning(raw_cand, features_dict, row["rank"]))
            
        top_100["reasoning"] = explanations
        
    # 8. Write Outputs
    print("Writing output files...")
    
    # Output 1: Detailed top 100 CSV for analysis/dashboard
    top_100_cols = [
        "candidate_id", "rank", "final_score", "final_rule_score", "semantic_score",
        "title_score", "career_score", "skill_score", "experience_score",
        "product_company_score", "behavior_score", "location_score",
        "keyword_stuffer_flag", "honeypot_flag", "duplicate_flag", "reasoning"
    ]
    # Filter columns that actually exist
    top_100_cols = [c for c in top_100_cols if c in top_100.columns]
    
    top100_csv_path = os.path.join(base_dir, "outputs", "top100.csv")
    with open(top100_csv_path, "w", encoding="utf-8", newline="") as f:
        top_100[top_100_cols].to_csv(f, index=False)
        f.flush()
        os.fsync(f.fileno())
    print(f"Saved detailed top 100 report to {top100_csv_path}")
    
    # Output 2: Official Submission format
    submission_cols = ["candidate_id", "rank", "score", "reasoning"]
    submission_df = top_100.rename(columns={"final_score": "score"})[submission_cols]
    
    submission_csv_path = os.path.join(base_dir, "outputs", "submission.csv")
    with open(submission_csv_path, "w", encoding="utf-8", newline="") as f:
        submission_df.to_csv(f, index=False)
        f.flush()
        os.fsync(f.fileno())
    print(f"Saved submission format to {submission_csv_path}")
    
    # 9. Perform Validation Checks
    print("Running submission validation checks...")
    val_results = validate_submission_csv(submission_csv_path)
    if val_results["valid"]:
        print("Success: Submission CSV is valid and ready!")
    else:
        print("Warning: Submission CSV validation failed:")
        for err in val_results["errors"]:
            print(f"  - ERROR: {err}")
            
    for warn in val_results["warnings"]:
        print(f"  - WARNING: {warn}")
        
    print("Pipeline execution finished successfully!")

if __name__ == "__main__":
    run_ranking_pipeline()
