# Neural Slayers Submission TODOs

## Highest priority
- [ ] Fill `submission_metadata.yaml` with real team contact info, GitHub repo URL, and sandbox link.
- [ ] Confirm `python rank.py` runs successfully from the repo root and generates `ui/ranking/outputs/submission.csv`.
- [ ] Validate `ui/ranking/outputs/submission.csv` against the competition spec.

## Submission spec requirements
- [ ] Output file name must be `<team_id>.csv` when submitting.
- [ ] Ensure `submission.csv` has columns: `candidate_id,rank,score,reasoning`.
- [ ] Ensure exactly 100 candidate rows plus header.
- [ ] Ensure ranks are unique integers from 1 to 100.
- [ ] Ensure `score` is monotonically non-increasing.
- [ ] Ensure every `candidate_id` exists in `ui/ranking/data/candidates.jsonl`.

## Ranking pipeline polish
- [ ] Verify the ranking system avoids honeypots in the top 100.
- [ ] Confirm duplicate detection is working and consider fuzzy matching improvements.
- [ ] Review experience scoring for ageism or bias.
- [ ] Improve reasoning generation quality and ensure it is specific.

## Metadata and repo requirements
- [ ] Add sandbox/demo link in `submission_metadata.yaml`.
- [ ] Add `github_repo` URL in `submission_metadata.yaml`.
- [ ] Add `submission_metadata.yaml` to the repo root.
- [ ] Keep the full code repository in sync with the submitted CSV output.
- [ ] Include a short methodology summary in `submission_metadata.yaml`.

## Frontend / UI work (recommended)
- [ ] Implement file upload validation in `ui/frontend`.
- [ ] Add loading states to upload/processing flows.
- [ ] Add error boundary component(s) in the frontend.
- [ ] Fix `alert()` usage in `ui/frontend/src/pages/Upload.tsx`.
- [ ] Add `aria-label` and accessibility improvements.
- [ ] Add code splitting / lazy loading for pages.

## Production hardening
- [ ] Add ESLint or other linting configuration for `ui/frontend`.
- [ ] Add error logging / tracking integration.
- [ ] Add or verify CSP/security headers if applicable.
- [ ] Document any precomputation steps clearly in README.

## Validation checklist
- [ ] Run `python rank.py` and verify no errors.
- [ ] Open `ui/ranking/outputs/submission.csv` and confirm format.
- [ ] Confirm the submission CSV is UTF-8 encoded.
- [ ] Confirm the repo contains all code needed to reproduce the CSV.
