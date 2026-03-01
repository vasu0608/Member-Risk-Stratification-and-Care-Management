
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Users, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import { getMembers } from '../services/api';
import MembersTable from '../components/MembersTable';
import MemberDetailsDrawer from '../components/MemberDetailsDrawer';

// Trends will be calculated dynamically from the members list

const StatCard = ({ title, value, subtext, icon: IconComponent, color, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        style={{
            background: 'white',
            padding: '24px',
            borderRadius: '20px',
            flex: 1,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{
            position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px',
            background: `${color}08`, borderRadius: '50%'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <h3 style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>{title}</h3>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '5px', letterSpacing: '-1px' }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: subtext.includes('🚨') ? '#ef4444' : '#64748b', fontWeight: '600' }}>
                    {subtext}
                </div>
            </div>
            <div style={{
                background: color,
                padding: '12px',
                borderRadius: '16px',
                boxShadow: `0 8px 16px ${color}40`,
                color: 'white'
            }}>
                <IconComponent size={24} />
            </div>
        </div>
    </motion.div>
);

const PopulationDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({ total: 0, highRisk: 0, riskDist: [], trends: [] });
    const [selectedMember, setSelectedMember] = useState(null);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getMembers();
            const data = res.data;
            setMembers(data);

            const total = data.length;
            const dist = { 'Very Low': 0, 'Low': 0, 'Medium': 0, 'High': 0, 'Very High': 0 };
            let highAndVeryHigh = 0;
            let totalInterventionCost = 0;
            let totalNetSavings = 0;
            let sum90d = 0;
            let totalMembersWith90d = 0;

            data.forEach(m => {
                const level = m.final_risk_tier || 'Low';
                dist[level]++;
                if (level === 'High' || level === 'Very High') highAndVeryHigh++;

                const score90 = m.risk_scores.find(s => s.model_name === 'deterioration_90d');
                if (score90) {
                    sum90d += score90.probability;
                    totalMembersWith90d++;
                }

                totalInterventionCost += (m.intervention_cost || 0);
                totalNetSavings += (m.projected_savings || 0);
            });

            const avg90d = totalMembersWith90d > 0 ? (sum90d / totalMembersWith90d) * 100 : 0;
            const netSavings = totalNetSavings;
            const roiFormatted = (netSavings / 1000).toFixed(1); // Scaled for regional Population Impact (Lakhs)

            const distData = [
                { name: 'Very Low', value: dist['Very Low'], color: '#15803d' },
                { name: 'Low', value: dist['Low'], color: '#22c55e' },
                { name: 'Medium', value: dist['Medium'], color: '#f59e0b' },
                { name: 'High', value: dist['High'], color: '#ef4444' },
                { name: 'Very High', value: dist['Very High'], color: '#b91c1c' },
            ];

            const calcTrend = (modelKey) => {
                const trend = { 'Very High': 0, 'High': 0, 'Medium': 0, 'Low': 0, 'Very Low': 0 };
                data.forEach(m => {
                    const score = m.risk_scores.find(s => s.model_name === modelKey);
                    if (score) trend[score.risk_level]++;
                });
                return trend;
            };

            const trendsData = [
                { name: '30-Day', ...calcTrend('deterioration_30d') },
                { name: '60-Day', ...calcTrend('deterioration_60d') },
                { name: '90-Day', ...calcTrend('deterioration_90d') }
            ];

            setStats({
                total,
                highRisk: highAndVeryHigh,
                avg90d: avg90d.toFixed(1),
                roi: roiFormatted,
                riskDist: distData,
                trends: trendsData
            });
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '30px', color: '#64748b' }}>Loading population health data...</div>;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '40px' }}
        >
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', letterSpacing: '-1px', margin: 0 }}>Population Health</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '4px' }}>AI-powered risk insights across {stats.total} patients</p>
                </div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{ fontSize: '0.9rem', color: '#0369a1', background: '#e0f2fe', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold' }}
                >
                    Real-time Predictive Sync
                </motion.div>
            </header>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
                <StatCard
                    index={0}
                    title="Total Population"
                    value={stats.total}
                    subtext="👥 Active Monitoring"
                    icon={Users}
                    color="#1e3a8a"
                />
                <StatCard
                    index={1}
                    title="High Priority"
                    value={stats.highRisk}
                    subtext="🚨 Immediate Action"
                    icon={AlertCircle}
                    color="#ef4444"
                />
                <StatCard
                    index={2}
                    title="Avg 90D Risk"
                    value={`${stats.avg90d}%`}
                    subtext="📊 Clinical Score"
                    icon={TrendingUp}
                    color="#f59e0b"
                />
                <StatCard
                    index={3}
                    title="ROI Impact"
                    value={`₹${stats.roi} Lakhs`}
                    subtext="📈 Projected Population Impact"
                    icon={DollarSign}
                    color="#10b981"
                />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card"
                    style={{ padding: '32px', borderRadius: '24px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 'bold' }}>Risk Horizon Forecast (30/60/90 Days)</h3>
                        <TrendingUp size={20} color="#64748b" />
                    </div>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="VeryHigh" stackId="a" fill="#b91c1c" radius={[0, 0, 0, 0]} barSize={45} />
                                <Bar dataKey="High" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={45} />
                                <Bar dataKey="Medium" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={45} />
                                <Bar dataKey="Low" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} barSize={45} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card"
                    style={{ padding: '32px', borderRadius: '24px' }}
                >
                    <h3 style={{ marginBottom: '32px', color: '#0f172a', fontSize: '1.1rem', fontWeight: 'bold' }}>Stratification Distribution</h3>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.riskDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={130}
                                    paddingAngle={12}
                                    dataKey="value"
                                    animationBegin={500}
                                    animationDuration={1500}
                                >
                                    {stats.riskDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* ROI & Strategy Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card"
                    style={{ padding: '32px', borderRadius: '24px' }}
                >
                    <h3 style={{ marginBottom: '24px', color: '#0f172a', fontSize: '1.1rem', fontWeight: 'bold' }}>Investment & ROI Insight</h3>
                    <div style={{ height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={stats.riskDist.map((d, i) => ({ ...d, roi: [3.8, 3.2, 1.4, 0.2, -0.4][i] }))}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={80} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="roi" radius={[0, 6, 6, 0]} barSize={28}>
                                    {stats.riskDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index < 2 ? '#b91c1c' : (index === 2 ? '#f59e0b' : '#10b981')} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '32px', borderRadius: '24px', color: 'white', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <h3 style={{ marginBottom: '24px', color: '#38bdf8', fontSize: '1.2rem', fontWeight: '800' }}>Care Management Protocol</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {[
                            { color: '#b91c1c', label: 'Very High', meaning: 'Emergency Watch' },
                            { color: '#ef4444', label: 'High Risk', meaning: 'Active Case Mgmt' },
                            { color: '#f59e0b', label: 'Medium Risk', meaning: 'Nurse Follow-up' },
                            { color: '#10b981', label: 'Low Risk', meaning: 'Periodic Check' },
                            { color: '#34d399', label: 'Very Low', meaning: 'Wellness Guidance' },
                            { color: '#38bdf8', label: 'Strategy', meaning: 'Cost Mitigation' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: 14, height: 14, borderRadius: '4px', background: item.color, boxShadow: `0 0 10px ${item.color}40` }} />
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>{item.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{item.meaning}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Members List */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
            >
                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '24px', color: '#0f172a', fontWeight: '800' }}>Member Prioritization Table</h3>
                    <MembersTable members={members} onMemberClick={setSelectedMember} />
                </div>
            </motion.div>

            {/* Details Drawer */}
            <AnimatePresence>
                {selectedMember && (
                    <MemberDetailsDrawer
                        member={selectedMember}
                        onClose={() => setSelectedMember(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PopulationDashboard;
