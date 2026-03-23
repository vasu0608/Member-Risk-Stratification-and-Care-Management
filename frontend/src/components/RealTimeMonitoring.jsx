import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Activity, HeartPulse } from 'lucide-react';
import { getLiveMonitoring } from '../services/api';
import { getRiskColor } from '../utils/riskTheme';

const normalizeRows = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.patients)) return raw.patients;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

const statusForVitals = (patient) => {
  const hr = Number(patient.heart_rate);
  const spo2 = Number(patient.oxygen_level);
  const temp = Number(patient.temperature);

  if (spo2 < 90 || hr > 120 || temp >= 39) return 'Critical';
  if (spo2 < 94 || hr > 105 || temp >= 37.9) return 'Warning';
  return 'Normal';
};

const bpToNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.includes('/')) {
    const [sys] = value.split('/');
    return Number(sys);
  }
  if (value && typeof value === 'object') {
    return Number(value.systolic ?? value.sys ?? 0);
  }
  return Number(value || 0);
};

const formatBloodPressure = (value) => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const sys = value.systolic ?? value.sys;
    const dia = value.diastolic ?? value.dia;
    if (sys != null && dia != null) return `${sys}/${dia}`;
  }
  return value ?? '-';
};

const statusColor = (status) => {
  if (status === 'Critical') return '#ff4d6d';
  if (status === 'Warning') return '#ff9f1c';
  return '#36d399';
};

const statusProgress = (status) => {
  if (status === 'Critical') return 100;
  if (status === 'Warning') return 65;
  return 35;
};

const RealTimeMonitoring = () => {
  const [patients, setPatients] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchLive = async () => {
      try {
        const response = await getLiveMonitoring();
        const rows = normalizeRows(response?.data).slice(0, 50);

        if (!active) return;
        setPatients(rows);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!active) return;
        setError('Unable to fetch live monitoring data.');
        console.error(err);
      } finally {
        if (!active) return;
        setIsInitialLoading(false);
      }
    };

    fetchLive();
    const intervalId = setInterval(fetchLive, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) return 'Waiting for first update...';
    return lastUpdated.toLocaleTimeString();
  }, [lastUpdated]);

  return (
    <div className="glass-card" style={{ borderRadius: 24, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>Real-Time Monitoring Grid</h3>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={14} />
          <span>Last update: {lastUpdatedText}</span>
        </div>
      </div>

      {error && (
        <div style={{ color: '#ff4d6d', background: '#ff4d6d22', border: '1px solid #ff4d6d66', borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {isInitialLoading && (
        <div style={{ color: 'var(--text-secondary)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: '0.9rem' }}>
          Fetching hospital node data...
        </div>
      )}

      {!isInitialLoading && patients.length === 0 && !error && (
        <div style={{ color: 'var(--text-secondary)', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: '0.9rem' }}>
          Waiting for hospital node data...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {patients.map((patient, index) => {
          const riskTier = patient.risk_tier ?? 'Low';
          const riskColor = getRiskColor(riskTier);
          const status = statusForVitals(patient);
          const sColor = statusColor(status);
          const pulseRate = Number(patient.heart_rate) || 0;
          const oxygen = Number(patient.oxygen_level) || 0;
          const bp = bpToNumber(patient.blood_pressure);

          return (
            <div
              key={patient.patient_id ?? index}
              className="glass-card"
              style={{
                borderRadius: 16,
                border: `1px solid ${riskColor}66`,
                padding: 16,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}>Patient ID: {patient.patient_id ?? `PAT-${index + 1}`}</div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 999,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: sColor,
                  border: `1px solid ${sColor}66`,
                  background: `${sColor}1f`,
                }}>
                  {status}
                </span>
              </div>

              <div style={{ marginTop: 9, fontSize: '0.8rem', color: riskColor, fontWeight: 700 }}>Risk Tier: {riskTier}</div>

              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HeartPulse size={14} className="pulse" style={{ color: sColor }} />
                  Heart Rate: <strong style={{ color: 'var(--text-primary)' }}>{pulseRate || '-'}</strong>
                </div>
                <div>Blood Pressure: <strong style={{ color: 'var(--text-primary)' }}>{formatBloodPressure(patient.blood_pressure)}</strong></div>
                <div>Oxygen: <strong style={{ color: 'var(--text-primary)' }}>{oxygen || '-'}</strong></div>
                <div>Temperature: <strong style={{ color: 'var(--text-primary)' }}>{patient.temperature ?? '-'}</strong></div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 5 }}>
                  <span>Stability Index</span>
                  <span>{statusProgress(status)}%</span>
                </div>
                <div className="status-progress">
                  <span style={{ width: `${statusProgress(status)}%`, background: `linear-gradient(90deg, ${sColor}, ${riskColor})` }} />
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2, alignItems: 'end', height: 24 }}>
                  {[pulseRate, oxygen, bp, Number(patient.temperature) * 10].map((val, i) => (
                    <div key={i} style={{
                      gridColumn: `span 3`,
                      height: `${Math.max(15, Math.min(100, val)) * 0.2}px`,
                      borderRadius: 4,
                      background: `linear-gradient(180deg, ${riskColor}, ${riskColor}55)`,
                    }} />
                  ))}
                </div>
              </div>

              {status !== 'Normal' && (
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#ff4d6d', fontSize: '0.75rem', fontWeight: 700 }}>
                  <AlertTriangle size={12} /> Intervention alert: monitor this patient closely.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RealTimeMonitoring;
