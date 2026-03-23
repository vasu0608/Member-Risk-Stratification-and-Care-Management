
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, AlertCircle, Heart, User } from 'lucide-react';
import { getRiskColor } from '../utils/riskTheme';

const MembersTable = ({ members, onMemberClick }) => {
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState('All');

    const filtered = members.filter(m => {
        const matchesSearch = String(m.id).includes(search) || m.name.toLowerCase().includes(search.toLowerCase());
        const matchesTier = tierFilter === 'All' || m.final_risk_tier === tierFilter;
        return matchesSearch && matchesTier;
    });

    const getTierBadge = (tier) => {
        const color = getRiskColor(tier);
        const style = { bg: `${color}20`, text: color, label: tier || 'Low' };

        return (
            <span style={{
                padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800',
                background: style.bg, color: style.text, minWidth: '85px', textAlign: 'center',
                display: 'inline-block', border: `1px solid ${style.text}40`, textTransform: 'uppercase'
            }}>
                {style.label}
            </span>
        );
    };

    return (
        <div className="glass-card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>High-Priority Members</h2>
                    <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Members requiring immediate attention</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--card-bg)', padding: '5px 15px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '10px' }}>Filter Tier:</span>
                        <select
                            value={tierFilter}
                            onChange={(e) => setTierFilter(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            <option value="All">All Tiers</option>
                            <option value="Very High">Very High</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                            <option value="Very Low">Very Low</option>
                        </select>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                padding: '10px 15px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                fontSize: '0.9rem', width: '250px', outline: 'none', background: 'var(--card-bg)', color: 'var(--text-primary)'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Patient ID</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Age</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Final Risk Tier</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>90-Day Risk</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Care Action</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>ROI</th>
                            <th style={{ padding: '16px 24px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((member, idx) => {
                            const score30 = member.risk_scores.find(s => s.model_name === 'deterioration_30d') || {};
                            const score90 = member.risk_scores.find(s => s.model_name === 'deterioration_90d') || {};
                            const isHigh = score30.risk_level === 'High' || score30.risk_level === 'Very High';

                            return (
                                <motion.tr
                                    key={member.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => onMemberClick(member)}
                                    style={{ borderBottom: '1px solid var(--card-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                background: isHigh ? '#ffebee' : '#e0f2fe',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {isHigh ? <AlertCircle size={16} color="#ef4444" /> : <User size={16} color="#0ea5e9" />}
                                            </div>
                                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{String(member.id).padStart(6, '0')}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontWeight: '500' }}>
                                        {member.features.AGE}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {getTierBadge(member.final_risk_tier || 'Low')}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--card-bg)', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                                                {(score90.probability * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ maxWidth: '180px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                            {member.intervention || 'Monitoring'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '0.85rem' }}>
                                            +{((score90.probability || 0.1) * 5).toFixed(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <ChevronRight size={18} color="#cbd5e1" />
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MembersTable;
