# Neural Slayers — Redrob Hackathon Submission

## Overview
This repository contains the ranking pipeline for the Redrob Hackathon submission.
The pipeline extracts features from `ui/ranking/data/candidates.jsonl`, applies trap detection, performs rule-based ranking, optionally applies semantic reranking, and writes the final top-100 submission file.

## Reproduce the Submission CSV
Run this from the repository root:

```bash
python rank.py
```

This will produce:
- `ui/ranking/outputs/top100.csv`
- `ui/ranking/outputs/submission.csv`

## Directory layout
- `rank.py` — root entrypoint for reproduction.
- `ui/ranking/` — ranking pipeline source and data.
- `submission_metadata.yaml` — submission metadata file.

## Dependencies
Install dependencies with:

```bash
pip install -r requirements.txt
```

## Notes
- The ranking step is designed to run on CPU-only within a small data subset.
- No external network calls are required during ranking.
- `submission_metadata.yaml` must be completed with real contact, repo, and sandbox info before final submission.
