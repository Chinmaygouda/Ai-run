import sys, os
sys.path.append(os.path.dirname(__file__))

# Quick smoke test: verify all imports work
print('Testing imports...')
from preprocessing.feature_extractor import extract_features
from traps.duplicate_detector import get_description_hashes, calculate_duplicate_penalty
from traps.keyword_stuffer import extract_jd_keywords, detect_keyword_stuffer
from embeddings.embedding_generator import SemanticReranker, SimpleTFIDF
from ranking.scoring_engine import score_and_filter_candidates, get_top_500_candidates
from ranking.weight_config import FUSION_WEIGHTS
print('All imports OK!')

# Test TF-IDF fallback
print('\nTesting SimpleTFIDF cosine similarity...')
tfidf = SimpleTFIDF()
docs = ['machine learning NLP recommendation systems FAISS vector database semantic search',
        'React developer web frontend JavaScript HTML CSS']
tfidf.fit_transform(docs)
jd_vec = tfidf.transform_single('recommendation systems semantic search NLP machine learning sentence embeddings')
v1 = tfidf.transform_single(docs[0])
v2 = tfidf.transform_single(docs[1])
s1 = tfidf.cosine_similarity(jd_vec, v1)
s2 = tfidf.cosine_similarity(jd_vec, v2)
print(f'  ML/NLP candidate similarity:   {s1:.4f}')
print(f'  React/frontend similarity:     {s2:.4f}')
assert s1 > s2, f'TF-IDF should rank ML/NLP higher! Got {s1:.4f} vs {s2:.4f}'
print('  TF-IDF ranking is CORRECT!')

# Test SemanticReranker with TF-IDF fallback
print('\nTesting SemanticReranker (TF-IDF fallback mode)...')
reranker = SemanticReranker()
print(f'  Model loaded: {reranker.model is not None}')
fake_candidates = [
    {"profile": {"current_title": "Machine Learning Engineer", "summary": "NLP, LLM, FAISS, semantic search expert"},
     "career_history": [{"title": "ML Engineer", "description": "Built recommendation systems with sentence-transformers"}],
     "projects": []},
    {"profile": {"current_title": "Web Developer", "summary": "React, HTML, CSS specialist"},
     "career_history": [{"title": "Frontend Dev", "description": "Built React dashboards and landing pages"}],
     "projects": []},
]
jd = "Recommendation Systems Engineer. NLP, LLM, semantic search, sentence embeddings, FAISS."
scores = reranker.score_candidates(jd, fake_candidates)
print(f'  Candidate 1 (ML/NLP) score:    {scores[0]:.4f}')
print(f'  Candidate 2 (Web/React) score: {scores[1]:.4f}')
assert scores[0] > scores[1], f'Reranker should prefer ML candidate! Got {scores[0]:.4f} vs {scores[1]:.4f}'
print('  SemanticReranker TF-IDF fallback is CORRECT!')

# Test JD keyword extraction
print('\nTesting JD keyword extraction...')
jd_text = 'Recommendation Systems Engineer. Build NLP LLM RAG semantic search ML pipeline FAISS Pinecone.'
kw = extract_jd_keywords(jd_text)
print(f'  Extracted {len(kw)} keywords: {sorted(list(kw))[:15]}')
assert 'nlp' in kw or 'recommendation' in kw, f'Expected NLP/recommendation in keywords, got: {kw}'
print('  Keyword extraction OK!')

# Test multiprocessing imports
print('\nTesting multiprocessing setup...')
import multiprocessing
cpus = multiprocessing.cpu_count()
print(f'  Available CPUs: {cpus}')
workers = max(1, cpus - 1)
print(f'  Workers to be used: {workers}')
print('  Multiprocessing ready!')

print()
print('=' * 50)
print('ALL SMOKE TESTS PASSED!')
print('=' * 50)
