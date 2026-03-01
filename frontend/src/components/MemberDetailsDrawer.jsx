
import React from 'react';
import {
    X, User, Activity, AlertCircle, Heart, Droplets,
    TrendingUp, TrendingDown, ClipboardList, ShieldAlert,
    Stethoscope, Thermometer, Briefcase
} from 'lucide-react';

const MetricCard = ({ label, value, unit, icon: IconComponent }) => ( // eslint-disable-line no-unused-vars
    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', marginBottom: '8px' }}>
            <IconComponent size={14} />
            <span>{label}</span>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>
            {value} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#64748b' }}>{unit}</span>
        </div>
    </div>
);

const RiskCard = ({ label, probability, level }) => {
    const getColors = (lvl) => {
        if (lvl === 'Very High' || lvl === 'High') return { bg: '#ffebee', text: '#c62828' };
        if (lvl === 'Medium') return { bg: '#fff3e0', text: '#ef6c00' };
        return { bg: '#e8f5e9', text: '#2e7d32' };
    };
    const colors = getColors(level);

    return (
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: 1 }}>
            <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Activity size={12} /> {label}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>
                {(probability * 100).toFixed(1)}%
            </div>
            <span style={{
                padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold',
                background: colors.bg, color: colors.text
            }}>
                {level}
            </span>
        </div>
    );
};

const MemberDetailsDrawer = ({ member, onClose }) => {
    if (!member) return null;

    const features = member.features || {};
    const scores = member.risk_scores || [];

    const score30 = scores.find(s => s.model_name === 'deterioration_30d') || {};
    const SCORE_HEART = scores.find(s => s.model_name === 'heart_disease') || { probability: 0 };
    const SCORE_DIABETES = scores.find(s => s.model_name === 'diabetes') || { probability: 0 };

    const isHighRisk = score30.risk_level === 'High' || score30.risk_level === 'Very High';

    // Chronic Conditions Mapping
    const conditions = [
        { label: 'Renal Disease', active: features.RENAL_DISEASE_1 === 1 },
        { label: 'Heart Failure', active: features.HEARTFAILURE_1 === 1 },
        { label: 'Cancer', active: features.CANCER_1 === 1 },
        { label: 'Pulmonary', active: features.PULMONARY_1 === 1 },
        { label: 'Stroke', active: features.STROKE_1 === 1 },
    ].filter(c => c.active);

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.3)', zIndex: 1000, backdropFilter: 'blur(2px)'
                }}
            />

            <div style={{
                position: 'fixed', top: 0, right: 0, width: '500px', height: '100vh',
                background: 'white', zIndex: 1001, boxShadow: '-5px 0 25px rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column', overflowY: 'auto'
            }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                            <User size={20} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>BEN{String(member.id).padStart(10, '0')}</h2>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{features.AGE} years • {features.GENDER_1 === 1 ? 'Male' : 'Female'}</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    {/* Risk Tier Badge */}
                    <div style={{
                        background: (member.final_risk_tier === 'High' || member.final_risk_tier === 'Very High') ? '#fff5f5' : (member.final_risk_tier === 'Medium' ? '#fffbeb' : '#f0fdf4'),
                        padding: '16px', borderRadius: '12px', border: `1px solid ${(member.final_risk_tier === 'High' || member.final_risk_tier === 'Very High') ? '#fee2e2' : (member.final_risk_tier === 'Medium' ? '#fef3c7' : '#dcfce7')}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <ShieldAlert size={20} color={(member.final_risk_tier === 'High' || member.final_risk_tier === 'Very High') ? '#ef4444' : (member.final_risk_tier === 'Medium' ? '#f59e0b' : '#22c55e')} />
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>Final Risk Tier</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Highest of 30/60/90 day horizons</div>
                            </div>
                        </div>
                        <span style={{
                            padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem',
                            background: member.final_risk_tier === 'Very High' ? '#b91c1c' : (member.final_risk_tier === 'High' ? '#ef4444' : (member.final_risk_tier === 'Medium' ? '#f59e0b' : (member.final_risk_tier === 'Low' ? '#22c55e' : '#15803d'))),
                            color: 'white'
                        }}>
                            {member.final_risk_tier || 'Low'}
                        </span>
                    </div>

                    {/* Health Metrics */}
                    <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Health Metrics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        <MetricCard label="BMI" value={features.BMI} unit="kg/m²" icon={Activity} />
                        <MetricCard label="Blood Pressure" value={features.BP_S} unit="mmHg" icon={Thermometer} />
                        <MetricCard label="Glucose" value={features.GLUCOSE} unit="mg/dL" icon={Droplets} />
                        <MetricCard label="HbA1c" value={features.HbA1c} unit="%" icon={Stethoscope} />
                        <MetricCard label="Cholesterol" value={features.CHOLESTEROL} unit="mg/dL" icon={ClipboardList} />
                        <MetricCard label="Rx Adherence" value={(features.RX_ADH * 100).toFixed(0)} unit="%" icon={TrendingUp} />
                    </div>

                    {/* Disease-Specific Risks */}
                    <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Disease-Specific Intelligence</h3>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        <RiskCard label="Heart Risk" probability={SCORE_HEART.probability} level={SCORE_HEART.risk_level} />
                        <RiskCard label="Diabetes Risk" probability={SCORE_DIABETES.probability} level={SCORE_DIABETES.risk_level} />
                    </div>

                    {/* Chronic Conditions */}
                    <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Chronic Conditions</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                        {conditions.length > 0 ? conditions.map(c => (
                            <span key={c.label} style={{
                                padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                <AlertCircle size={14} /> {c.label}
                            </span>
                        )) : <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No chronic conditions recorded</span>}
                    </div>

                    {/* Utilization stats */}
                    <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Healthcare Utilization</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '5px' }}>Inpatient Admissions</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{features.IN_ADM}</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '5px' }}>Outpatient Visits</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{features.OUT_VISITS}</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '5px' }}>ED Visits</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{features.ED_VISITS}</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '5px' }}>Total Claims</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>₹{features.TOTAL_CLAIMS_COST.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Recommended Intervention */}
                    <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 'bold' }}>Recommended Intervention</h3>
                    <div style={{
                        background: '#f0f9ff', padding: '20px', borderRadius: '12px', border: '1px solid #e0f2fe'
                    }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <ClipboardList size={18} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '5px', lineHeight: '1.4' }}>
                                    {member.intervention || 'Standard monitoring'}
                                </div>
                                <div style={{ color: '#0369a1', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <TrendingUp size={14} /> Expected Influence: <span style={{ fontWeight: 'bold' }}>High ROI</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Impact Metrics */}
                    <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', marginTop: '24px', fontWeight: 'bold' }}>Projected Clinical Impact</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                            <div style={{ color: '#166534', fontSize: '0.75rem', marginBottom: '5px' }}>Hospitalizations Avoided</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#14532d' }}>{member.hospitalizations_avoided?.toFixed(2)}</div>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                            <div style={{ color: '#166534', fontSize: '0.75rem', marginBottom: '5px' }}>Readmissions Prevented</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#14532d' }}>{member.readmissions_prevented?.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MemberDetailsDrawer;
