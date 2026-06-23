import json
import pandas as pd

from preprocessing.feature_extractor import extract_features

rows = []

with open("candidates.jsonl") as f:

    for line in f:

        candidate = json.loads(line)

        rows.append(
            extract_features(candidate)
        )

df = pd.DataFrame(rows)

df.to_csv(
    "outputs/candidate_features.csv",
    index=False
)

print(df.head())
print(df.shape)