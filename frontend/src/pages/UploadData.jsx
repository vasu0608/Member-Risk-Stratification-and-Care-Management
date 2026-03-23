
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { batchPredict } from '../services/api';

const UploadData = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setResults(null);
            setError(null);
        }
    };

    const processFile = () => {
        if (!file) return;
        setLoading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: async (results) => {
                try {
                    const patients = results.data;
                    const response = await batchPredict(patients);
                    setResults(response.data);
                } catch (err) {
                    console.error("Batch error:", err);
                    const detail = err.response?.data?.detail;
                    const msg = typeof detail === 'string'
                        ? detail
                        : (Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : "Check CSV schema.");
                    setError(`Failed: ${msg}`);
                } finally {
                    setLoading(false);
                }
            },
            error: (err) => {
                setError("Error parsing CSV: " + err.message);
                setLoading(false);
            }
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}
        >
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px', margin: 0 }}>Batch Risk Analysis</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '8px' }}>Upload patient datasets for population-level stratification</p>
            </div>

            {/* Upload Area */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="glass-panel"
                style={{
                    padding: '60px',
                    textAlign: 'center',
                    marginBottom: '40px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '2px dashed #cbd5e1'
                }}
            >
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    style={{ marginBottom: '24px', display: 'inline-block' }}
                >
                    <div style={{
                        background: 'var(--accent-gradient)', padding: '24px', borderRadius: '30px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                        boxShadow: '0 20px 40px -10px rgba(56, 189, 248, 0.4)'
                    }}>
                        <Upload size={48} />
                    </div>
                </motion.div>

                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                    {file ? 'Ready to Process' : 'Drop your CSV here'}
                </h3>
                <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '1rem', maxWidth: '400px', margin: '0 auto 32px' }}>
                    Supports multi-member datasets for immediate clinical scoring. Ensure headers match system requirements.
                </p>

                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="csv-upload"
                />

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <label
                        htmlFor="csv-upload"
                        style={{
                            background: file ? '#f1f5f9' : 'var(--primary-gradient)',
                            color: file ? '#475569' : 'white',
                            padding: '16px 32px',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: file ? 'none' : '0 10px 20px -5px rgba(30, 58, 138, 0.3)',
                            transition: 'all 0.3s'
                        }}
                    >
                        <FileText size={20} />
                        {file ? file.name : 'Select CSV Dataset'}
                    </label>

                    {file && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={processFile}
                            disabled={loading}
                            style={{
                                background: 'var(--success-gradient)',
                                color: 'white',
                                border: 'none',
                                padding: '16px 32px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                fontWeight: '800',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                            {loading ? 'Analyzing...' : 'Execute AI Scoring'}
                        </motion.button>
                    )}
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{ color: '#ef4444', marginTop: '24px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <AlertTriangle size={18} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Results Section */}
            <AnimatePresence>
                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel"
                        style={{ overflow: 'hidden', padding: 0 }}
                    >
                        <div style={{ padding: '32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Stratification Report</h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Successfully processed {results.length} patient records</p>
                            </div>
                            <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px 16px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                Analysis Complete
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '20px 32px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', background: '#f8fafc' }}>Record</th>
                                        <th style={{ padding: '20px 32px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', background: '#f8fafc' }}>AI Risk Tier</th>
                                        <th style={{ padding: '20px 32px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', background: '#f8fafc' }}>Recommended Clinical Pathway</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((res, idx) => {
                                        const getOverallRisk = () => {
                                            if (res?.final_risk_tier) return res.final_risk_tier;

                                            const levels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
                                            const r30 = res.deterioration_30d?.risk_level || 'Low';
                                            const r60 = res.deterioration_60d?.risk_level || 'Low';
                                            const r90 = res.deterioration_90d?.risk_level || 'Low';

                                            const highest = [r30, r60, r90].reduce((prev, curr) => {
                                                return levels.indexOf(curr) > levels.indexOf(prev) ? curr : prev;
                                            }, r30);
                                            return highest;
                                        };

                                        const overallRisk = getOverallRisk();
                                        const isHigh = overallRisk === 'High' || overallRisk === 'Very High';
                                        const isMedium = overallRisk === 'Medium';

                                        return (
                                            <motion.tr
                                                key={idx}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                style={{ borderBottom: '1px solid #f1f5f9' }}
                                            >
                                                <td style={{ padding: '20px 32px', fontWeight: '700', color: '#1e293b' }}>MEM-{1000 + idx}</td>
                                                <td style={{ padding: '20px 32px' }}>
                                                    <span
                                                        style={{
                                                            padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '800',
                                                            background: isHigh ? '#fef2f2' : (isMedium ? '#fffbeb' : '#f0fdf4'),
                                                            color: isHigh ? '#b91c1c' : (isMedium ? '#b45309' : '#15803d'),
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: isHigh ? '#ef4444' : (isMedium ? '#f59e0b' : '#10b981') }} />
                                                        {overallRisk}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px 32px', color: '#475569', fontSize: '0.95rem' }}>
                                                    {res?.intervention ? (
                                                        <span style={{ fontWeight: '600', color: isHigh ? '#b91c1c' : '#475569' }}>{res.intervention}</span>
                                                    ) : isHigh ? (
                                                        <span style={{ fontWeight: '600', color: '#b91c1c' }}>Urgent Care Manager Assignment Required</span>
                                                    ) : (
                                                        isMedium ? 'Baseline screening and nurse follow-up' : 'Mobile health monitoring and wellness guidance'
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UploadData;
