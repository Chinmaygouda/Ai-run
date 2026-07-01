import os
import sys
from pathlib import Path

# Add the ranking package to the import path.
root_dir = Path(__file__).resolve().parent
ranking_dir = None
for candidate in [root_dir / "ranking", root_dir / "ui" / "ranking"]:
    if candidate.exists():
        ranking_dir = candidate
        break
if ranking_dir is None:
    raise FileNotFoundError(f"Ranking directory not found in {root_dir}")
sys.path.insert(0, str(ranking_dir))

from ranking.ranking.rank_candidates import run_ranking_pipeline


def main() -> None:
    """Run the ranking pipeline from the repository root."""
    base_dir = str(ranking_dir)
    run_ranking_pipeline(base_dir=base_dir)


if __name__ == "__main__":
    main()
