import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Users, AlertCircle, DollarSign, TrendingUp, BrainCircuit } from 'lucide-react';
import { getMembers } from '../services/api';
import MembersTable from '../components/MembersTable';
import MemberDetailsDrawer from '../components/MemberDetailsDrawer';
import { getRiskColor } from '../utils/riskTheme';

const StatCard = ({ title, value, subtext, icon: IconComponent, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    whileHover={{ y: -6, scale: 1.01 }}
    className="glass-card"
    style={{ padding: 22, borderRadius: 20, position: 'relative', overflow: 'hidden' }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 'auto -16px -18px auto',
        width: 120,
        height: 120,
        background: `radial-gradient(circle, ${color}33 0%, transparent 65%)`,
      }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.7, color: 'var(--text-secondary)', fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 8 }}>{value}</div>
        <div style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 600 }}>{subtext}</div>
      </div>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          display: 'grid',
          placeItems: 'center',
          background: `linear-gradient(145deg, ${color}, ${color}cc)`,
          color: '#fff',
          boxShadow: `0 8px 20px ${color}55`,
        }}
      >
        <IconComponent size={21} />
      </div>
    </div>
  </motion.div>
);

const PopulationDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ total: 0, highRisk: 0, avg90d: '0.0', roi: '0.0', riskDist: [], trends: [] });
  const [loadError, setLoadError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadError('');
    try {
      const res = await getMembers();
      const data = res.data;
      setMembers(data);

      const total = data.length;
      const dist = { 'Very Low': 0, Low: 0, Medium: 0, High: 0, 'Very High': 0 };
      let highAndVeryHigh = 0;
      let totalNetSavings = 0;
      let sum90d = 0;
      let totalMembersWith90d = 0;

      data.forEach((m) => {
        const level = m.final_risk_tier || 'Low';
        dist[level]++;
        if (level === 'High' || level === 'Very High') highAndVeryHigh++;

        const score90 = m.risk_scores.find((s) => s.model_name === 'deterioration_90d');
        if (score90) {
          sum90d += score90.probability;
          totalMembersWith90d++;
        }

        totalNetSavings += m.projected_savings || 0;
      });

      const avg90d = totalMembersWith90d > 0 ? (sum90d / totalMembersWith90d) * 100 : 0;
      const roiFormatted = (totalNetSavings / 1000).toFixed(1);

      const distData = [
        { name: 'Very Low', value: dist['Very Low'], color: getRiskColor('Very Low') },
        { name: 'Low', value: dist.Low, color: getRiskColor('Low') },
        { name: 'Medium', value: dist.Medium, color: getRiskColor('Medium') },
        { name: 'High', value: dist.High, color: getRiskColor('High') },
        { name: 'Very High', value: dist['Very High'], color: getRiskColor('Very High') },
      ];

      const calcTrend = (modelKey) => {
        const trend = { 'Very High': 0, High: 0, Medium: 0, Low: 0, 'Very Low': 0 };
        data.forEach((m) => {
          const score = m.risk_scores.find((s) => s.model_name === modelKey);
          if (score) trend[score.risk_level]++;
        });
        return trend;
      };

      const trendsData = [
        { name: '30-Day', ...calcTrend('deterioration_30d') },
        { name: '60-Day', ...calcTrend('deterioration_60d') },
        { name: '90-Day', ...calcTrend('deterioration_90d') },
      ];

      setStats({
        total,
        highRisk: highAndVeryHigh,
        avg90d: avg90d.toFixed(1),
        roi: roiFormatted,
        riskDist: distData,
        trends: trendsData,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setMembers([]);
      setStats({ total: 0, highRisk: 0, avg90d: '0.0', roi: '0.0', riskDist: [], trends: [] });
      setLoadError('Could not load member history from the backend. Make sure the API is running on http://127.0.0.1:8000.');
    } finally {
      setLoading(false);
    }
  };

  const insightRows = [
    `Risk concentration: ${stats.highRisk || 0} patients are in High or Very High tiers.`,
    `Average 90-day risk is ${stats.avg90d || 0}%.`,
    'Recommended: prioritize nurse follow-up for Medium/High risk cohorts.',
  ];

  if (loading) return <div style={{ padding: 30, color: 'var(--text-secondary)' }}>Loading population health data...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '34px' }}>
      <header style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div className="page-header-block">
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>Population Health Command</h1>
          <p>Interactive clinical intelligence across {stats.total} monitored members.</p>
        </div>
        <div className="glass-card" style={{ padding: '10px 14px', borderRadius: 999, fontWeight: 700, color: 'var(--text-secondary)' }}>
          Real-time Predictive Sync
        </div>
      </header>

      {loadError && (
        <div className="glass-card" style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 14, color: 'var(--text-secondary)', border: '1px solid rgba(239,68,68,0.35)' }}>
          {loadError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard index={0} title="Total Population" value={stats.total} subtext="Active monitoring" icon={Users} color="#1d8cff" />
        <StatCard index={1} title="High Priority" value={stats.highRisk} subtext="Immediate action" icon={AlertCircle} color={getRiskColor('Very High')} />
        <StatCard index={2} title="Avg 90D Risk" value={`${stats.avg90d}%`} subtext="Clinical trend score" icon={TrendingUp} color={getRiskColor('Medium')} />
        <StatCard index={3} title="ROI Impact" value={`₹${stats.roi} Lakhs`} subtext="Projected cost impact" icon={DollarSign} color={getRiskColor('Low')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.25fr) minmax(280px, 1fr)', gap: 18, marginBottom: 24 }}>
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: 22, borderRadius: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Risk Horizon Forecast</h3>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(148,163,184,0.15)' }} contentStyle={{ borderRadius: 14, border: '1px solid var(--card-border)', background: 'var(--card-bg)' }} />
                <Legend />
                <Bar dataKey="Very High" stackId="a" fill={getRiskColor('Very High')} radius={[0, 0, 0, 0]} animationDuration={900} />
                <Bar dataKey="High" stackId="a" fill={getRiskColor('High')} radius={[0, 0, 0, 0]} animationDuration={900} />
                <Bar dataKey="Medium" stackId="a" fill={getRiskColor('Medium')} radius={[0, 0, 0, 0]} animationDuration={900} />
                <Bar dataKey="Low" stackId="a" fill={getRiskColor('Low')} radius={[0, 0, 6, 6]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: 22, borderRadius: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Risk Distribution</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.riskDist} cx="50%" cy="50%" innerRadius={56} outerRadius={88} dataKey="value" paddingAngle={7} animationDuration={900}>
                  {stats.riskDist.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid var(--card-border)', background: 'var(--card-bg)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="ai-insight-panel" style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontWeight: 700 }}>
              <BrainCircuit size={17} /> AI Insight Panel
            </div>
            {insightRows.map((row) => (
              <div key={row} className="ai-insight-item">{row}</div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 360px)', gap: 18, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 22, borderRadius: 20 }}>
          <h3 style={{ margin: '0 0 14px 0', color: 'var(--text-primary)' }}>Claims and Risk Momentum</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.riskDist.map((d, i) => ({ name: d.name, claims: d.value * (i + 1) }))}>
                <defs>
                  <linearGradient id="claimsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d8cff" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#1d8cff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid var(--card-border)', background: 'var(--card-bg)' }} />
                <Area type="monotone" dataKey="claims" stroke="#1d8cff" fill="url(#claimsGradient)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 22, borderRadius: 20 }}>
          <h3 style={{ margin: '0 0 14px 0', color: 'var(--text-primary)' }}>Care Protocol</h3>
          {[
            ['Very High', 'Emergency watch and intensive case management'],
            ['High', 'Care manager assignment and frequent review'],
            ['Medium', 'Nurse follow-up and behavior interventions'],
            ['Low', 'Periodic monitoring and adherence nudges'],
            ['Very Low', 'Preventive wellness guidance'],
          ].map(([tier, text]) => (
            <div key={tier} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <span className="risk-dot" style={{ background: getRiskColor(tier), marginTop: 6 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{tier}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ borderRadius: 20, padding: 20 }}>
        <h3 style={{ margin: '4px 0 14px 0', color: 'var(--text-primary)' }}>Member Prioritization Table</h3>
        {members.length > 0 ? (
          <MembersTable members={members} onMemberClick={setSelectedMember} />
        ) : (
          <div style={{ padding: 16, border: '1px dashed var(--card-border)', borderRadius: 12, color: 'var(--text-secondary)' }}>
            No previous patient history found in current view.
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedMember && <MemberDetailsDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />}
      </AnimatePresence>
    </motion.div>
  );
};

export default PopulationDashboard;
