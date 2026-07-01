# Member 1 Pipeline Documentation

This document covers the feature extraction pipeline and trap detection logic.

## Feature Extraction Modules

- `preprocessing/title_features.py` — Title matching and relevance scoring.
- `preprocessing/career_features.py` — Career evidence for AI/ML product engineering.
- `preprocessing/skill_features.py` — Skill match scoring based on technical competencies.
- `preprocessing/behavioral_features.py` — Behavioral signals such as stability and activity.
- `preprocessing/experience_features.py` — Total experience scoring.
- `preprocessing/product_company_features.py` — Product/company fit and services-only detection.
- `preprocessing/location_features.py` — Location and remote fit scoring.

## Trap Detection Modules

- `traps/keyword_stuffer.py` — Detects keyword stuffing using JD keyword overlap and evidence.
- `traps/honeypot_detector.py` — Detects impossible or mismatched profile details.
- `traps/duplicate_detector.py` — Flags duplicate career-history patterns.

## Main Feature Extraction Script

- `generate_features.py` — Runs the extraction pipeline over `candidates.jsonl` and writes `outputs/candidate_features.csv`.

## Notes

This member’s functionality is complete and provides the pre-computed features used by the ranking stage.
