# AI-Run Ranking Project

## Overview
This repository contains the AI candidate ranking system for the hackathon.
The pipeline ingests `ui/ranking/data/candidates.jsonl`, extracts candidate features, applies trap detection, and generates the final submission CSV.

## Reproduce the submission
From the repo root, run:

```bash
python rank.py
```

This produces:
- `ui/ranking/outputs/top100.csv`
- `ui/ranking/outputs/submission.csv`

## What is included
- `rank.py` — root entrypoint for reproduction
- `requirements.txt` — Python dependencies
- `ui/ranking/` — ranking code, feature extraction, traps, and output generation
- `ui/ranking/data/` — candidate dataset and JD text

## Notes
- Ensure `ui/ranking/data/candidates.jsonl` and `ui/ranking/data/jd.txt` are present.
- The ranking step is meant to run CPU-only with no external network calls.
- `submission_metadata.yaml` should be filled with your team info and sandbox link.

## Current status
- Ranking pipeline is implemented and runnable.
- The repo needs final validation of `ui/ranking/outputs/submission.csv` before submission.
