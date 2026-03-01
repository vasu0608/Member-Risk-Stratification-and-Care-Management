"""
Risk Scoring Engine for Member Risk Stratification
Loads trained XGBoost models and generates risk predictions
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple, Union
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RiskScoringEngine:
    """
    Manages risk scoring across multiple time windows and health conditions
    """
    
    def __init__(self, models_dir: str):
        """
        Initialize the risk scoring engine
        
        Args:
            models_dir: Path to directory containing joblib model files
        """
        self.models_dir = Path(models_dir)
        self.models = {}
        self.feature_requirements = {
            '30day_deterioration': ['age', 'chronic_conditions', 'recent_claims', 'medication_count'],
            '60day_deterioration': ['age', 'chronic_conditions', 'recent_claims', 'medication_count'],
            '90day_deterioration': ['age', 'chronic_conditions', 'recent_claims', 'medication_count'],
            'diabetes': ['age', 'bmi', 'pregnancies', 'glucose', 'blood_pressure', 'skin_thickness', 'insulin', 'dpf'],
            'heart_disease': ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
        }
        
        self._load_models()
    
    def _load_models(self):
        """Load all trained models from joblib files"""
        model_files = {
            '30day_deterioration': 'xgb_model_30day_deterioration.joblib',
            '60day_deterioration': 'xgb_model_60day_deterioration.joblib',
            '90day_deterioration': 'xgb_model_90day_deterioration.joblib',
            'diabetes': 'xgb_model_diabetes.joblib',
            'heart_disease': 'xgb_model_heart_disease.joblib'
        }
        
        for model_name, filename in model_files.items():
            filepath = self.models_dir / filename
            try:
                self.models[model_name] = joblib.load(filepath)
                logger.info(f"✓ Loaded model: {model_name}")
            except FileNotFoundError:
                logger.warning(f"✗ Model not found: {filepath}")
            except Exception as e:
                logger.error(f"✗ Error loading {model_name}: {str(e)}")
    
    def score_member(self, member_data: Dict) -> Dict:
        """
        Generate risk scores for a member across all conditions and timeframes
        
        Args:
            member_data: Dictionary containing member health features
            
        Returns:
            Dictionary with risk scores for all conditions
        """
        results = {
            'member_id': member_data.get('member_id', 'Unknown'),
            'scores': {},
            'probabilities': {}
        }
        
        for model_name, model in self.models.items():
            try:
                # Prepare features for this model
                features = self._prepare_features(model_name, member_data)
                
                if features is not None:
                    # Get prediction and probability
                    prediction = model.predict(features)
                    probability = model.predict_proba(features)
                    
                    results['scores'][model_name] = {
                        'prediction': int(prediction[0]),
                        'risk_probability': float(probability[0][1]) if probability.shape[1] > 1 else float(probability[0][0])
                    }
            except Exception as e:
                logger.warning(f"Error scoring {model_name} for member {member_data.get('member_id')}: {str(e)}")
        
        return results
    
    def _prepare_features(self, model_name: str, member_data: Dict) -> Union[np.ndarray, None]:
        """
        Prepare and validate features for a specific model
        
        Args:
            model_name: Name of the model
            member_data: Member health data
            
        Returns:
            Numpy array of features or None if validation fails
        """
        try:
            required_features = self.feature_requirements.get(model_name, [])
            features = []
            
            for feature in required_features:
                if feature in member_data:
                    features.append(member_data[feature])
                else:
                    # Use default value if feature missing
                    logger.warning(f"Missing feature '{feature}' for {model_name}, using default value")
                    features.append(0)
            
            return np.array(features).reshape(1, -1)
        except Exception as e:
            logger.error(f"Error preparing features for {model_name}: {str(e)}")
            return None
    
    def batch_score_members(self, members_data: List[Dict]) -> List[Dict]:
        """
        Score multiple members in batch
        
        Args:
            members_data: List of member data dictionaries
            
        Returns:
            List of risk scores for all members
        """
        results = []
        for member_data in members_data:
            results.append(self.score_member(member_data))
        return results
    
    def get_model_info(self) -> Dict:
        """Get information about loaded models"""
        return {
            'loaded_models': list(self.models.keys()),
            'total_models': len(self.models),
            'feature_requirements': self.feature_requirements
        }
