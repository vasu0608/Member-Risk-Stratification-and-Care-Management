
import React from 'react';
import './RiskCard.css';
import { Share2, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const RiskCard = ({ result }) => {
    if (!result) return null;

    const { model_name, prediction, probability, risk_level, timestamp } = result;
    const date = new Date(timestamp).toLocaleString();
    const percent = (probability * 100).toFixed(1);

    const getRiskInfo = (level) => {
        switch (level.toLowerCase()) {
            case 'high': return { class: 'risk-high', bar: 'fill-high', icon: <AlertTriangle size={18} /> };
            case 'medium': return { class: 'risk-medium', bar: 'fill-medium', icon: <Activity size={18} /> };
            default: return { class: 'risk-low', bar: 'fill-low', icon: <CheckCircle size={18} /> };
        }
    };

    const info = getRiskInfo(risk_level);

    return (
        <div className="risk-card">
            <div className="risk-header">
                <span className="risk-title">{model_name}</span>
                <span className={`risk-badge ${info.class}`}>
                    {risk_level} Risk
                </span>
            </div>

            <div className="probability-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>Probability</strong>
                    <span>{percent}%</span>
                </div>
                <div className="progress-bar-bg">
                    <div
                        className={`progress-bar-fill ${info.bar}`}
                        style={{ width: `${percent}%` }}
                    ></div>
                </div>
            </div>

            <div className="risk-footer">
                <span>Prediction: {prediction === 1 ? 'Positive' : 'Negative'}</span>
                <span>{date}</span>
            </div>
        </div>
    );
};

export default RiskCard;
