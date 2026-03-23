import requests
import random

tiers_found = set()
for _ in range(100):
    age = random.randint(18, 50)
    p = {
        'AGE': age, 'BMI': random.uniform(18, 25), 'BP_S': random.randint(100, 120),
        'GLUCOSE': random.randint(70, 100), 'HbA1c': random.uniform(4, 5.5),
        'CHOLESTEROL': random.randint(140, 180), 'IN_ADM': 0, 'OUT_VISITS': 0,
        'ED_VISITS': 0, 'RX_ADH': 1.0, 'TOTAL_CLAIMS_COST': random.randint(0, 500),
        'GENDER_1': random.randint(0, 1)
    }
    r = requests.post('http://localhost:8000/predict/batch', json={'patients': [p]})
    res = r.json()[0]
    # Prefer authoritative final tier from backend; fallback to model-risk aggregation.
    final_tier = res.get('final_risk_tier')
    if not final_tier:
        tier_order = ["Very Low", "Low", "Medium", "High", "Very High"]
        all_tiers = [
            v.get('risk_level')
            for v in res.values()
            if isinstance(v, dict) and v.get('risk_level') in tier_order
        ]
        if not all_tiers:
            continue
        max_idx = max([tier_order.index(t) for t in all_tiers])
        final_tier = tier_order[max_idx]
    
    if final_tier not in tiers_found:
        print(f"Found {final_tier} for Age {age}")
        tiers_found.add(final_tier)
    
    if len(tiers_found) == 5:
        break
print(f"Total tiers identified: {tiers_found}")
