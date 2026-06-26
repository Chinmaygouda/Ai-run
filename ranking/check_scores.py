import pandas as pd

# Load generated features
df = pd.read_csv("outputs/candidate_features.csv")

score_cols = [
    "title_score",
    "career_score",
    "skill_score",
    "behavior_score",
    "experience_score"
]

print("\n===== DESCRIBE =====")
print(df[score_cols].describe())

print("\n===== SAMPLE 20 ROWS =====")
print(
    df[
        [
            "candidate_id",
            *score_cols,
            "keyword_stuffer_flag",
            "honeypot_flag"
        ]
    ].sample(20)
)

print("\n===== ZERO SCORES =====")

for col in score_cols:
    zeros = (df[col] == 0).sum()

    print(
        f"{col}: {zeros}/{len(df)} "
        f"({100 * zeros / len(df):.2f}%)"
    )

print("\n===== FLAG COUNTS =====")

print(
    "Keyword Stuffers:",
    df["keyword_stuffer_flag"].sum()
)

print(
    "Honeypots:",
    df["honeypot_flag"].sum()
)