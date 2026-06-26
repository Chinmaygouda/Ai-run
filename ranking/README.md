# INDIA RUNS Hackathon - AI Candidate Screening System

## Project Overview
This project is developed for the INDIA RUNS Hackathon. It is an automated AI Candidate Screening System designed to evaluate thousands of software engineering and ML profiles. The system ingests raw candidate JSON data, extracts standardized features, detects misleading resume practices (such as keyword stuffing and skill inflation), and prepares a clean, normalized dataset for a downstream ranking model.

The pipeline successfully processes large datasets (e.g., 100,000 candidates) efficiently and reliably.

## Team Responsibilities
- **Member 1 (Feature Engineering + Trap Detection)**: Responsible for parsing raw JSON profiles, engineering normalized scoring features (`career_score`, `skill_score`, etc.), and implementing trap detectors to identify "honeypot" resumes or keyword stuffers. (Implementation Complete)
- **Member 2 (Ranking Model / ML)**: Responsible for taking the processed feature dataset, applying machine learning algorithms or ranking heuristics, and generating the final ordered list of top candidates. (Pending/In Progress)

## Architecture Overview
The system is divided into two major stages:
1. **Feature Extraction Pipeline (Member 1)**:
   - **Preprocessing Modules**: Analyze various aspects of the candidate profile (skills, career history, title, behavior, experience) and calculate normalized scores (`0.0` to `1.0`).
   - **Trap Detectors**: Identify "honeypot" conditions or unnatural patterns in resumes (e.g. claiming 10 years of expert AI experience with only 2 years of total work history).
2. **Ranking & Classification (Member 2)**:
   - Ingests the normalized CSV output.
   - Applies soft or hard filtering based on trap penalties.
   - Outputs the final candidate ranking.

## Repository Structure
```text
.
├── preprocessing/               # Feature extraction modules
│   ├── behavioral_features.py
│   ├── career_features.py       # Weighted AI/ML category scoring
│   ├── experience_features.py
│   ├── feature_extractor.py     # Orchestrator for all preprocessing
│   ├── skill_features.py
│   └── title_features.py
├── traps/                       # Fraud detection modules
│   ├── honeypot_detector.py     # Detects unrealistic expertise/inflation
│   └── keyword_stuffer.py       # Detects keyword stuffing without evidence
├── outputs/                     # Generated dataset artifacts (ignored by git)
│   └── candidate_features.csv
├── generate_features.py         # Main script to process candidates.jsonl
├── test_pipeline.py             # Pipeline sanity tests
├── check_scores.py              # Utility to verify scoring logic
├── top_candidates.py            # Utility to preview top candidates
├── README.md                    # Main project documentation
└── README_MEMBER1.md            # Detailed documentation for Member 1's pipeline
```

## Quick Start Instructions

### Prerequisites
- Python 3.8+
- Pandas

### Setup
1. Clone the repository and navigate to the project directory.
2. Ensure you have the raw data file named `candidates.jsonl` located in the root of the project.

### Running the Pipeline
To generate the feature dataset, run:
```bash
python generate_features.py
```
*This script will process `candidates.jsonl` and output the results to `outputs/candidate_features.csv`.*

To run the pipeline's tests and utilities:
```bash
python test_pipeline.py
python check_scores.py
```

## How to Generate Features
The `generate_features.py` script reads the `candidates.jsonl` file line by line. For each candidate, it calls `preprocessing.feature_extractor.extract_features()`. This orchestrator runs all individual preprocessing modules and trap detectors, generating a unified dictionary of features. These dictionaries are then aggregated and saved as a CSV using Pandas.

## Expected Output
The generation process produces `outputs/candidate_features.csv` with the following schema:

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `candidate_id` | String | Unique identifier |
| `title_score` | Float [0.0 - 1.0] | Normalized score for job titles |
| `career_score` | Float [0.0 - 1.0] | Normalized score for AI/ML career evidence |
| `skill_score` | Float [0.0 - 1.0] | Normalized score for technical skills |
| `behavior_score` | Float [0.0 - 1.0] | Normalized score for behavior |
| `experience_score` | Float [0.0 - 1.0] | Normalized score for total experience |
| `keyword_stuffer_flag` | Boolean | True if flagged for keyword stuffing |
| `keyword_stuffer_penalty` | Float [0.0 - 1.0] | Penalty for keyword stuffing |
| `honeypot_flag` | Boolean | True if flagged for unrealistic profile |
| `honeypot_penalty` | Float [0.0 - 1.0] | Penalty for honeypot criteria |

## Integration with Member 2 Ranking Model
Member 2 will use `outputs/candidate_features.csv` to build the ranking model.

**Guidelines for Member 2**:
- **Scaling**: All score features (`title_score`, `career_score`, etc.) are pre-normalized to the `0.0-1.0` range. No further scaling is required for model ingestion.
- **Handling Traps**: You MUST account for the trap detectors. We recommend using the provided penalty values to adjust the final ranking scores (e.g., `final_score = base_score * (1.0 - honeypot_penalty)`), or performing a hard filter to drop any candidate where a `_flag` is `True`.
- **Primary Signal**: The `career_score` is a highly robust indicator of actual AI/ML engineering experience, evaluated via weighted distinct categories (RAG, Vector DBs, etc.). Rely on it more heavily than raw skill counts.
