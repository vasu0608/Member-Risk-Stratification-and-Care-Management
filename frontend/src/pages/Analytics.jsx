
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area, Cell
} from 'recharts';
import { TrendingUp, ShieldCheck, Banknote, ClipboardCheck, Loader2, Target } from 'lucide-react';
import { getMembers } from '../services/api';

const StatCard = ({ title, value, subtext, icon: IconComponent, color, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        style={{
            background: 'white',
            padding: '24px',
            borderRadius: '20px',
            flex: 1,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}
    >
        <div>
            <h3 style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>{title}</h3>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '5px' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>{subtext}</div>
        </div>
        <div style={{
            background: color,
            padding: '14px',
            borderRadius: '16px',
            color: 'white',
            boxShadow: `0 8px 16px ${color}30`
        }}>
            <IconComponent size={24} />
        </div>
    </motion.div>
);

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        totalSavings: 0,
        activeInterventions: 0,
        preventedAdmissions: 0,
        avgRoi: 0,
        roiByTier: [],
        claimsByTier: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getMembers();
            const members = res.data;

            let totalInterventionCost = 0;
            let totalNetSavings = 0;
            let totalActiveInterventions = 0;
            const tiers = {};
            const tierClaims = {};

            members.forEach(m => {
                const level = m.final_risk_tier || 'Low';
                tiers[level] = (tiers[level] || 0) + 1;
                tierClaims[level] = (tierClaims[level] || 0) + (m.features?.TOTAL_CLAIMS_COST || 0);

                totalInterventionCost += (m.intervention_cost || 0);
                totalNetSavings += (m.projected_savings || 0);
                if (level === 'High' || level === 'Very High') totalActiveInterventions++;
            });

            const finalRoiByTier = Object.keys(tiers).map(tier => {
                const tierMembers = members.filter(m => m.final_risk_tier === tier);
                const tierSavings = tierMembers.reduce((sum, m) => sum + (m.projected_savings || 0), 0);
                const tierCost = tierMembers.reduce((sum, m) => sum + (m.intervention_cost || 0), 0);
                const roiValue = tierCost > 0 ? tierSavings / tierCost : 0;

                return {
                    tier,
                    roi: parseFloat(roiValue.toFixed(2)),
                    color: tier.includes('High') ? '#ef4444' : (tier === 'Medium' ? '#f59e0b' : '#10b981')
                };
            }).sort((a, b) => {
                const order = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
                return order.indexOf(a.tier) - order.indexOf(b.tier);
            });

            const avgRoi = totalInterventionCost > 0 ? totalNetSavings / totalInterventionCost : 0;
            const claimsDist = Object.keys(tierClaims).map(key => ({
                name: key,
                claims: tierClaims[key] / 1000,
                color: key.includes('High') ? '#ef4444' : (key === 'Medium' ? '#f59e0b' : '#3b82f6')
            })).sort((a, b) => {
                const order = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
                return order.indexOf(a.name) - order.indexOf(b.name);
            });

            setAnalytics({
                totalSavings: totalNetSavings,
                activeInterventions: totalActiveInterventions,
                preventedAdmissions: Math.floor(totalActiveInterventions * 0.35),
                avgRoi: avgRoi.toFixed(1),
                roiByTier: finalRoiByTier,
                claimsByTier: claimsDist
            });

            // Analytics already set above
        } catch (_err) {
            console.error("Failed to fetch analytics", _err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                    <Loader2 size={48} color="#3b82f6" />
                </motion.div>
                <span style={{ mt: '20px', fontWeight: '600' }}>Synthesizing Clinical Intelligence...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '40px' }}
        >
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px', margin: 0 }}>Clinical ROI Analytics</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '8px' }}>Quantifying the impact of AI-driven interventions</p>
            </header>

            {/* KPI Row */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
                <StatCard
                    index={0}
                    title="Net Projected Savings"
                    value={`₹${(analytics.totalSavings / 1000).toFixed(1)}k`}
                    subtext="📈 Savings Momentum"
                    icon={Banknote}
                    color="#0ea5e9"
                />
                <StatCard
                    index={1}
                    title="Intervention Targets"
                    value={analytics.activeInterventions}
                    subtext="🎯 High Precision"
                    icon={Target}
                    color="#6366f1"
                />
                <StatCard
                    index={2}
                    title="Projected Avoidances"
                    value={analytics.preventedAdmissions}
                    subtext="🛡️ ER Prev. Impact"
                    icon={ShieldCheck}
                    color="#10b981"
                />
                <StatCard
                    index={3}
                    title="Program Multiple"
                    value={`${analytics.avgRoi}x`}
                    subtext="⚡ Performance Coeff."
                    icon={TrendingUp}
                    color="#14b8a6"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card"
                    style={{ padding: '32px', borderRadius: '24px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: 'bold' }}>Investment Efficiency by Risk Tier</h3>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>UNITS: ROI MULTIPLE</div>
                    </div>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.roiByTier} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis dataKey="tier" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 'bold' }} width={100} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="roi" radius={[0, 10, 10, 0]} barSize={32}>
                                    {analytics.roiByTier.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
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
                    <h3 style={{ marginBottom: '32px', color: '#0f172a', fontSize: '1.1rem', fontWeight: 'bold' }}>Claims Intensity Mapping</h3>
                    <div style={{ height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={analytics.claimsByTier}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="claims" radius={[8, 8, 0, 0]} barSize={50}>
                                    {analytics.claimsByTier.map((entry, index) => (
                                        <Cell key={`cell-claims-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{ marginTop: '30px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '32px', borderRadius: '24px', color: 'white' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '16px', borderRadius: '16px' }}>
                        <ShieldCheck size={32} color="#38bdf8" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Predictive Strategy Active</h4>
                        <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.6)', maxWidth: '800px' }}>
                            Our ROI models are currently optimized for High-Risk deterioration prevention. Every ₹1 spent on "Very High" risk interventions is projected to yield ₹3.8 in avoided medical expenses.
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Analytics;
