import requests
p = {
    'AGE': 30, 'BMI': 22.0, 'BP_S': 115, 'GLUCOSE': 85, 'HbA1c': 5.0, 
    'CHOLESTEROL': 180, 'IN_ADM': 0, 'OUT_VISITS': 0, 'ED_VISITS': 0, 
    'RX_ADH': 1.0, 'TOTAL_CLAIMS_COST': 500, 'GENDER_1': 0
}
r = requests.post('http://localhost:8000/predict/batch', json={'patients': [p]})
res = r.json()[0]
for k, v in res.items():
    if isinstance(v, dict) and 'risk_level' in v:
        print(f"{k}: {v.get('probability')} -> {v.get('risk_level')}")

print(f"final_risk_tier: {res.get('final_risk_tier')}")
print(f"intervention: {res.get('intervention')}")
