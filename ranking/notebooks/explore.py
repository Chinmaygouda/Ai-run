import json

with open("data/candidates.jsonl", "r") as f:
    for i in range(5):
        candidate = json.loads(next(f))

        print("=" * 50)
        print("ID:", candidate["candidate_id"])

        print("\nTITLE:")
        print(candidate["profile"]["current_title"])

        print("\nEXPERIENCE:")
        print(candidate["profile"]["years_of_experience"])

        print("\nSKILLS:")
        for skill in candidate["skills"][:5]:
            print(skill["name"])

        print("\nCAREER:")
        for job in candidate["career_history"]:
            print(job["title"])