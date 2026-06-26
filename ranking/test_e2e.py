"""
Mini end-to-end pipeline test using a small synthetic dataset.
Tests: feature extraction, multiprocessing worker, scoring, and reranking.
IMPORTANT: Must use if __name__ == '__main__' for multiprocessing on Windows.
"""
import sys
import os
import json
import multiprocessing

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ranking.rank_candidates import (
    _extract_candidate_features_worker,
    build_global_description_counts,
    clean_id
)

# --- Create a tiny synthetic dataset (module-level so workers can import safely) ---
CANDIDATES = []
for i in range(1, 31):
    CANDIDATES.append({
        "candidate_id": str(i),
        "profile": {
            "current_title": (
                "Machine Learning Engineer" if i % 3 == 0
                else ("Data Scientist" if i % 3 == 1 else "Software Engineer")
            ),
            "summary": (
                f"Expert in NLP, recommendation systems, semantic search, "
                f"LLM, RAG, FAISS, Pinecone. Candidate #{i}"
            ),
            "years_of_experience": (i % 15) + 1,
            "location": "San Francisco, CA" if i % 2 == 0 else "Remote"
        },
        "skills": [
            {"name": "Machine Learning", "level": "Expert"},
            {"name": "NLP", "level": "Advanced"},
            {"name": "Python", "level": "Expert"},
            {"name": "FAISS", "level": "Intermediate"},
            {"name": "LLM", "level": "Advanced"},
        ] + ([{"name": "React"}, {"name": "CSS"}] if i % 5 == 0 else []),
        "career_history": [
            {
                "title": "ML Engineer",
                "company": "TechCorp",
                "start_date": "2020-01",
                "end_date": "2023-12",
                "description": (
                    f"Built recommendation systems using sentence-transformers "
                    f"and FAISS. Candidate #{i}"
                ),
                "is_product_company": True
            }
        ],
        "education": [{"degree": "B.S.", "field": "Computer Science", "year": 2019}],
        "projects": [
            {
                "title": "Semantic Search Engine",
                "description": "Built a vector similarity search using FAISS and BERT embeddings."
            }
        ],
        "certifications": [],
        "total_experience_months": (i % 15 + 1) * 12
    })

# Add honeypot candidates
for i in range(31, 36):
    CANDIDATES.append({
        "candidate_id": str(i),
        "profile": {
            "current_title": "AI Expert",
            "summary": "AI ML NLP LLM RAG expert. Best candidate ever.",
            "years_of_experience": 0,
            "location": "Anywhere"
        },
        "skills": [
            {"name": "Machine Learning"}, {"name": "NLP"}, {"name": "LLM"},
            {"name": "RAG"}, {"name": "FAISS"}, {"name": "Pinecone"}, {"name": "AI"},
            {"name": "Deep Learning"}, {"name": "Computer Vision"}, {"name": "Generative AI"}
        ],
        "career_history": [],
        "education": [],
        "projects": [],
        "certifications": [],
        "total_experience_months": 0
    })


if __name__ == "__main__":
    import time
    import shutil
    import pandas as pd
    from traps.keyword_stuffer import extract_jd_keywords
    from ranking.scoring_engine import score_and_filter_candidates, get_top_500_candidates
    from embeddings.embedding_generator import SemanticReranker

    print(f"Synthetic dataset: {len(CANDIDATES)} candidates ({len(CANDIDATES)-5} real, 5 honeypots)")

    # Write to temp files
    tmpdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_tmp")
    os.makedirs(os.path.join(tmpdir, "data"), exist_ok=True)
    os.makedirs(os.path.join(tmpdir, "outputs"), exist_ok=True)

    dataset_path = os.path.join(tmpdir, "data", "candidates.jsonl")
    with open(dataset_path, "w", encoding="utf-8") as f:
        for c in CANDIDATES:
            f.write(json.dumps(c) + "\n")

    jd_text = (
        "Recommendation Systems Engineer. Build, scale, and optimize recommendation systems "
        "using sentence-transformers, FAISS, semantic search, NLP, LLM, RAG, and MLOps deployment."
    )
    with open(os.path.join(tmpdir, "data", "jd.txt"), "w", encoding="utf-8") as f:
        f.write(jd_text)
    print(f"Written synthetic data to: {tmpdir}")

    # Extract JD keywords
    print("\nTesting JD keyword extraction...")
    jd_keywords = extract_jd_keywords(jd_text)
    print(f"JD Keywords ({len(jd_keywords)}): {sorted(jd_keywords)[:10]}...")

    # Build global description counts
    global_counts = build_global_description_counts(dataset_path)
    print(f"Global hash counts built: {len(global_counts)} unique hashes")

    # Single-threaded baseline
    print("\nSingle-threaded baseline (10 candidates)...")
    with open(dataset_path) as f:
        test_lines = [l for l in f if l.strip()][:10]
    start = time.time()
    results_single = [
        r for l in test_lines
        for r in [_extract_candidate_features_worker((l, global_counts, jd_keywords))]
        if r is not None
    ]
    single_time = time.time() - start
    print(f"Single-threaded: {len(results_single)} candidates in {single_time:.3f}s")

    # Multiprocessing test
    num_workers = max(1, multiprocessing.cpu_count() - 1)
    print(f"\nMultiprocessing ({num_workers} workers, {len(CANDIDATES)} candidates)...")
    with open(dataset_path) as f:
        all_lines = [l for l in f if l.strip()]
    tasks = [(line, global_counts, jd_keywords) for line in all_lines]

    start = time.time()
    with multiprocessing.Pool(processes=num_workers) as pool:
        results_mp = [
            r for r in pool.imap(_extract_candidate_features_worker, tasks, chunksize=5)
            if r is not None
        ]
    mp_time = time.time() - start
    print(f"Multiprocessing:  {len(results_mp)} candidates in {mp_time:.3f}s")
    assert len(results_mp) == len(CANDIDATES), f"Expected {len(CANDIDATES)}, got {len(results_mp)}"
    print("Results count: CORRECT!")

    df = pd.DataFrame(results_mp)
    print(f"Feature columns: {list(df.columns)[:10]}...")

    # Scoring
    print("\nTesting scoring engine...")
    df_scored = score_and_filter_candidates(df)
    top_n = get_top_500_candidates(df_scored)
    print(f"Candidates after scoring: {len(df_scored)}")
    print(f"Top N selected: {len(top_n)}")
    if "honeypot_flag" in df_scored.columns:
        honeypots = int(df_scored["honeypot_flag"].sum())
        print(f"Honeypots caught: {honeypots}")

    # Semantic reranking with TF-IDF fallback
    print("\nTesting SemanticReranker (TF-IDF fallback)...")
    reranker = SemanticReranker()
    print(f"Using TF-IDF fallback: {reranker.model is None}")

    with open(dataset_path) as f:
        raw = {str(json.loads(l)["candidate_id"]): json.loads(l) for l in f if l.strip()}

    top_ids = list(top_n["candidate_id"].apply(clean_id))[:5]
    top_raw = [raw[cid] for cid in top_ids if cid in raw]
    scores = reranker.score_candidates(jd_text, top_raw)
    print(f"Semantic scores for top 5: {[round(s, 4) for s in scores]}")
    assert any(s > 0 for s in scores), "Expected non-zero semantic scores!"
    print("Semantic scores: CORRECT (non-zero)!")

    print()
    print("=" * 55)
    print("MINI END-TO-END PIPELINE TEST PASSED!")
    print("=" * 55)

    shutil.rmtree(tmpdir, ignore_errors=True)
