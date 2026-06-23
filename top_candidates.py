import pandas as pd

df = pd.read_csv(
    "outputs/candidate_features.csv"
)

df["simple_score"] = (
    0.25 * df["title_score"] +
    0.25 * df["career_score"] +
    0.20 * df["skill_score"] +
    0.15 * df["behavior_score"] +
    0.15 * df["experience_score"]
)

top = df.sort_values(
    "simple_score",
    ascending=False
)

print(
    top[
        [
            "candidate_id",
            "simple_score",
            "title_score",
            "career_score",
            "skill_score"
        ]
    ].head(20)
)