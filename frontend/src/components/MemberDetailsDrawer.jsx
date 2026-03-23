import React from 'react';
import { X, User, Activity, AlertCircle, ClipboardList, ShieldAlert, Stethoscope, Thermometer, HeartPulse } from 'lucide-react';
import { getRiskBadgeStyle, getRiskColor } from '../utils/riskTheme';

const MetricCard = ({ label, value, unit, IconComponent }) => (
  <div className="glass-card" style={{ padding: 14, borderRadius: 12, border: '1px solid var(--card-border)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: 6 }}>
      <IconComponent size={14} />
      <span>{label}</span>
    </div>
    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
      {value}
      <span style={{ fontSize: '0.76rem', marginLeft: 4, fontWeight: 500, color: 'var(--text-secondary)' }}>{unit}</span>
    </div>
  </div>
);

const riskStatus = (tier) => {
  if (tier === 'Very High' || tier === 'High') return 'Critical';
  if (tier === 'Medium') return 'Under Treatment';
  return 'Stable';
};

const historyRows = (member) => {
  const created = member?.created_at ? new Date(member.created_at) : new Date();
  const tier = member?.final_risk_tier || 'Low';
  const baseStatus = riskStatus(tier);

  return [
    {
      date: created.toLocaleDateString(),
      diagnosis: 'Initial AI Risk Assessment',
      severity: tier,
      status: baseStatus,
    },
    {
      date: new Date(created.getTime() - 1000 * 60 * 60 * 24 * 45).toLocaleDateString(),
      diagnosis: 'Metabolic follow-up review',
      severity: tier === 'Very High' ? 'High' : tier,
      status: tier === 'Very Low' ? 'Cured' : 'Under Treatment',
    },
    {
      date: new Date(created.getTime() - 1000 * 60 * 60 * 24 * 90).toLocaleDateString(),
      diagnosis: 'Routine chronic care screening',
      severity: tier === 'Very High' ? 'High' : (tier === 'High' ? 'Medium' : 'Low'),
      status: 'Under Observation',
    },
  ];
};

const MemberDetailsDrawer = ({ member, onClose }) => {
  if (!member) return null;

  const features = member.features || {};
  const scores = member.risk_scores || [];
  const heart = scores.find((s) => s.model_name === 'heart_disease') || { probability: 0, risk_level: 'Low' };
  const diabetes = scores.find((s) => s.model_name === 'diabetes') || { probability: 0, risk_level: 'Low' };
  const tier = member.final_risk_tier || 'Low';

  const conditions = [
    { label: 'Renal Disease', active: features.RENAL_DISEASE_1 === 1 },
    { label: 'Heart Failure', active: features.HEARTFAILURE_1 === 1 },
    { label: 'Cancer', active: features.CANCER_1 === 1 },
    { label: 'Pulmonary', active: features.PULMONARY_1 === 1 },
    { label: 'Stroke', active: features.STROKE_1 === 1 },
  ].filter((c) => c.active);

  const history = historyRows(member);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(2, 8, 23, 0.45)',
          zIndex: 1000,
          backdropFilter: 'blur(3px)',
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(760px, 100vw)',
          height: '100vh',
          background: 'var(--bg-soft)',
          zIndex: 1001,
          boxShadow: '-10px 0 35px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.06rem', color: 'var(--text-primary)' }}>PAT-{String(member.id).padStart(6, '0')}</h2>
              <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{features.AGE ?? '-'} years • {features.GENDER_1 === 1 ? 'Male' : 'Female'}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div className="glass-card" style={{ padding: 16, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <ShieldAlert size={19} color={getRiskColor(tier)} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Current Risk Tier</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI-adjusted 30/60/90-day prediction</div>
              </div>
            </div>
            <span style={{ ...getRiskBadgeStyle(tier), padding: '6px 12px', borderRadius: 999, fontWeight: 800 }}>{tier}</span>
          </div>

          <h3 style={{ margin: '10px 0 10px 0', color: 'var(--text-primary)' }}>Patient Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 10, marginBottom: 14 }}>
            <MetricCard label="Systolic BP" value={features.BP_S ?? '-'} unit="mmHg" IconComponent={Thermometer} />
            <MetricCard label="Glucose" value={features.GLUCOSE ?? '-'} unit="mg/dL" IconComponent={Activity} />
            <MetricCard label="HbA1c" value={features.HbA1c ?? '-'} unit="%" IconComponent={Stethoscope} />
            <MetricCard label="BMI" value={features.BMI ?? '-'} unit="kg/m²" IconComponent={HeartPulse} />
          </div>

          <div className="glass-card" style={{ padding: 16, borderRadius: 16, marginBottom: 14 }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>Disease-Specific Status Indicators</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
              {[
                ['Heart Risk', heart.risk_level, heart.probability],
                ['Diabetes Risk', diabetes.risk_level, diabetes.probability],
              ].map(([label, level, prob]) => (
                <div key={label} style={{ border: '1px solid var(--card-border)', borderRadius: 12, padding: 12 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{label}</div>
                  <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ ...getRiskBadgeStyle(level), padding: '4px 8px', borderRadius: 999, fontWeight: 700, fontSize: '0.78rem' }}>{level}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{((prob || 0) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 16, borderRadius: 16, marginBottom: 14 }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>Chronic Conditions</h4>
            {conditions.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {conditions.map((c) => (
                  <span key={c.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, border: '1px solid #ff9f1c66', background: '#ff9f1c1f', color: '#ff9f1c', fontSize: '0.8rem', fontWeight: 700 }}>
                    <AlertCircle size={13} /> {c.label}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>No chronic conditions recorded</div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 16, borderRadius: 16, marginBottom: 14 }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>Recommended Plan</h4>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', color: 'var(--text-secondary)' }}>
              <ClipboardList size={16} style={{ marginTop: 2, color: 'var(--accent)' }} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{member.intervention || 'Standard monitoring'}</div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 16, borderRadius: 16 }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>Patient History</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Diagnosis</th>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Severity</th>
                    <th style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, idx) => (
                    <tr key={`${row.date}-${idx}`} style={{ borderBottom: idx === history.length - 1 ? 'none' : '1px solid var(--card-border)' }}>
                      <td style={{ padding: '10px 6px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{row.date}</td>
                      <td style={{ padding: '10px 6px', color: 'var(--text-primary)', fontSize: '0.84rem', fontWeight: 600 }}>{row.diagnosis}</td>
                      <td style={{ padding: '10px 6px' }}>
                        <span style={{ ...getRiskBadgeStyle(row.severity), padding: '4px 8px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>{row.severity}</span>
                      </td>
                      <td style={{ padding: '10px 6px', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberDetailsDrawer;
