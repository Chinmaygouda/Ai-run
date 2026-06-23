# Weights for the Rule-Based Ranking Score (Must sum to 1.0)
RULE_WEIGHTS = {
    "title_score": 0.25,
    "skill_score": 0.20,
    "career_score": 0.20,
    "experience_score": 0.10,
    "product_company_score": 0.10,
    "behavior_score": 0.10,
    "location_score": 0.05
}

# Fusion Weights for combination of Rule Score and Semantic Score
FUSION_WEIGHTS = {
    "rule_score_weight": 0.70,
    "semantic_score_weight": 0.30
}
