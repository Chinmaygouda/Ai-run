import os
import sys
from pathlib import Path

# Add the repository root to the import path so the ranking package can be resolved.
root_dir = Path(__file__).resolve().parent
repo_root = None
for parent in [root_dir, root_dir.parent, root_dir.parent.parent, root_dir.parent.parent.parent]:
    if (parent / "ranking" / "ranking" / "__init__.py").exists():
        repo_root = parent
        break
if repo_root is None:
    raise FileNotFoundError(f"Repository root with ranking package not found starting from {root_dir}")
sys.path.insert(0, str(repo_root))

from ranking.ranking.rank_candidates import run_ranking_pipeline


def main() -> None:
    """Run the ranking pipeline from the repository root."""
    base_dir = str(ranking_dir)
    run_ranking_pipeline(base_dir=base_dir)


if __name__ == "__main__":
    main()
