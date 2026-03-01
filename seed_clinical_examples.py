import requests
import json

def seed_clinical_examples():
    url = "http://localhost:8000/members"
    
    examples = [
        {
            "name": "High Risk Chronic Member",
            "data": {
                "AGE": 80,
                "BMI": 42.5,
                "BP_S": 165,
                "GLUCOSE": 210,
                "HbA1c": 9.8,
                "CHOLESTEROL": 240,
                "IN_ADM": 2,
                "OUT_VISITS": 12,
                "ED_VISITS": 4,
                "RX_ADH": 0.45,
                "TOTAL_CLAIMS_COST": 45000,
                "GENDER_1": 1,
                "RENAL_DISEASE_1": 1,
                "HEARTFAILURE_1": 1,
                "CANCER_1": 1,
                "PULMONARY_1": 0,
                "STROKE_1": 0
            }
        },
        {
            "name": "Extreme Cardiac Risk",
            "data": {
                "AGE": 72,
                "BMI": 33.0,
                "BP_S": 185,
                "GLUCOSE": 110,
                "HbA1c": 5.7,
                "CHOLESTEROL": 310,
                "IN_ADM": 1,
                "OUT_VISITS": 8,
                "ED_VISITS": 2,
                "RX_ADH": 0.75,
                "TOTAL_CLAIMS_COST": 28000,
                "GENDER_1": 1,
                "HEARTFAILURE_1": 1,
                "CHEST_PAIN_TYPE_1": 1,
                "MAX_HEART_RATE": 175,
                "EXERCISE_ANGINA_1": 1
            }
        },
        {
            "name": "Uncontrolled Diabetes Member",
            "data": {
                "AGE": 55,
                "BMI": 38.2,
                "BP_S": 145,
                "GLUCOSE": 280,
                "HbA1c": 11.5,
                "CHOLESTEROL": 210,
                "IN_ADM": 0,
                "OUT_VISITS": 15,
                "ED_VISITS": 5,
                "RX_ADH": 0.30,
                "TOTAL_CLAIMS_COST": 15000,
                "GENDER_1": 0,
                "INSULIN": 45,
                "DIABETES_PEDIGREE": 1.2
            }
        },
        {
            "name": "Healthy Baseline Member",
            "data": {
                "AGE": 45,
                "BMI": 24.5,
                "BP_S": 118,
                "GLUCOSE": 95,
                "HbA1c": 5.2,
                "CHOLESTEROL": 180,
                "IN_ADM": 0,
                "OUT_VISITS": 1,
                "ED_VISITS": 0,
                "RX_ADH": 0.98,
                "TOTAL_CLAIMS_COST": 500,
                "GENDER_1": 1
            }
        }
    ]

    print("Seeding Clinical Examples...")
    for ex in examples:
        try:
            response = requests.post(url, json=ex["data"])
            if response.status_code == 200:
                member = response.json()
                print(f"✓ Added {ex['name']}: {member['final_risk_tier']} Risk (ID: {member['id']})")
            else:
                print(f"✗ Failed to add {ex['name']}: {response.text}")
        except Exception as e:
            print(f"! Error: {e}")

if __name__ == "__main__":
    seed_clinical_examples()
