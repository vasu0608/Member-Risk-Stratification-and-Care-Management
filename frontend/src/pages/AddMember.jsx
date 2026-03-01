
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { saveMember } from '../services/api';
import { Save, AlertCircle, CheckCircle2, ArrowRight, UserPlus, Home, TrendingUp, ShieldAlert } from 'lucide-react';


const InputGroup = ({ label, register, name, type = "number", step = "1", required = true }) => (
    <motion.div
        whileHover={{ x: 5 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
        <input
            {...register(name, { required, valueAsNumber: type === 'number' })}
            type={type}
            step={step}
            style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                background: '#f8fafc',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
            onFocus={(e) => { e.target.style.border = '1px solid #3b82f6'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }}
            onBlur={(e) => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
        />
    </motion.div>
);

const SelectGroup = ({ label, register, name, options }) => (
    <motion.div
        whileHover={{ x: 5 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
        <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
        <select
            {...register(name, { valueAsNumber: true })}
            style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                background: '#f8fafc',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </motion.div>
);

const AddMember = () => {
    const { register, handleSubmit, reset } = useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const onSubmit = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const response = await saveMember(data);
            setResult(response.data);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (ERR) {
            console.error(ERR);
            const detail = ERR.response?.data?.detail;
            const msg = typeof detail === 'string'
                ? detail
                : (Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : "Internal Server Error");
            setError(`Failed to save: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setError(null);
        reset();
    };

    const getTierColor = (tier) => {
        const colors = {
            'Very High': '#ef4444',
            'High': '#f59e0b',
            'Medium': '#3b82f6',
            'Low': '#10b981',
            'Very Low': '#6366f1'
        };
        return colors[tier] || '#64748b';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}
        >
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px', margin: 0 }}>Add New Patient</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '8px' }}>Enter clinical metrics for instant risk stratification</p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ background: '#fef2f2', color: '#b91c1c', padding: '20px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #fee2e2', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                    <AlertCircle size={20} />
                    {error}
                </motion.div>
            )}

            {result ? (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-panel"
                    style={{ padding: '60px', textAlign: 'center' }}
                >
                    <div style={{
                        width: '80px', height: '80px', background: '#10b9811a', borderRadius: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10b981'
                    }}>
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Analysis Complete</h2>
                    <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '40px' }}>Patient profile has been stratified and saved to the registry.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px', textAlign: 'left' }}>
                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <ShieldAlert size={20} style={{ color: getTierColor(result.final_risk_tier) }} />
                                <span style={{ fontWeight: '700', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Risk Stratification</span>
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: getTierColor(result.final_risk_tier) }}>
                                {result.final_risk_tier}
                            </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <TrendingUp size={20} style={{ color: '#3b82f6' }} />
                                <span style={{ fontWeight: '700', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Projected ROI</span>
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1e293b' }}>
                                {(result.expected_roi * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', padding: '32px', borderRadius: '24px', marginBottom: '48px', textAlign: 'left', border: '1px solid #bae6fd' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '1.1rem', fontWeight: '800' }}>Recommended Intervention</h4>
                        <p style={{ margin: 0, color: '#0c4a6e', fontSize: '1.1rem', lineHeight: '1.6' }}>{result.intervention}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleReset}
                            style={{
                                flex: 1, background: 'var(--primary-gradient)', color: 'white', padding: '18px',
                                borderRadius: '16px', border: 'none', fontSize: '1.1rem', fontWeight: '700',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                boxShadow: '0 10px 15px -3px rgba(30, 58, 138, 0.3)'
                            }}
                        >
                            <UserPlus size={20} />
                            Add Next Patient
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, background: '#f1f5f9' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/')}
                            style={{
                                flex: 1, background: 'white', color: '#475569', padding: '18px',
                                borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '1.1rem', fontWeight: '700',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                            }}
                        >
                            <Home size={20} />
                            Return to Registry
                        </motion.button>
                    </div>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="glass-panel" style={{ padding: '48px', marginBottom: '60px' }}>
                    <div style={{ marginBottom: '48px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '32px', height: '32px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>1</div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>Demographics & Vitals</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <InputGroup label="Age" name="AGE" register={register} />
                            <InputGroup label="BMI" name="BMI" step="0.1" register={register} />
                            <SelectGroup label="Gender" name="GENDER_1" register={register} options={[{ value: 1, label: 'Male' }, { value: 0, label: 'Female' }]} />
                            <InputGroup label="Systolic BP" name="BP_S" register={register} />
                            <InputGroup label="Resting BP" name="RESTING_BP" register={register} />
                            <InputGroup label="Diastolic BP" name="BLOOD_PRESSURE" register={register} />
                            <InputGroup label="Max Heart Rate" name="MAX_HEART_RATE" register={register} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '48px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '32px', height: '32px', background: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>2</div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>Clinical Laboratory Analysis</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <InputGroup label="Glucose" name="GLUCOSE" register={register} />
                            <InputGroup label="HbA1c" name="HbA1c" step="0.1" register={register} />
                            <InputGroup label="Cholesterol" name="CHOLESTEROL" register={register} />
                            <InputGroup label="Insulin" name="INSULIN" register={register} />
                            <InputGroup label="Skin Thickness" name="SKIN_THICKNESS" register={register} />
                            <InputGroup label="Diabetes Pedigree" name="DIABETES_PEDIGREE" step="0.01" register={register} />
                            <InputGroup label="Oldpeak" name="OLDPEAK" step="0.1" register={register} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '48px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '32px', height: '32px', background: '#ec4899', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>3</div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>Utilization & Adherence</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <InputGroup label="Inpatient Admissions" name="IN_ADM" register={register} />
                            <InputGroup label="Outpatient Visits" name="OUT_VISITS" register={register} />
                            <InputGroup label="ED Visits" name="ED_VISITS" register={register} />
                            <InputGroup label="Rx Adherence (0-1)" name="RX_ADH" step="0.01" register={register} />
                            <InputGroup label="Total Claims Cost (₹)" name="TOTAL_CLAIMS_COST" register={register} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '48px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '32px', height: '32px', background: '#f59e0b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>4</div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>History & Comorbidities</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                            <SelectGroup label="Heart Failure" name="HEARTFAILURE_1" register={register} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                            <SelectGroup label="Renal Disease" name="RENAL_DISEASE_1" register={register} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                            <SelectGroup label="Cancer" name="CANCER_1" register={register} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                            <SelectGroup label="Pulmonary" name="PULMONARY_1" register={register} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                            <SelectGroup label="Stroke" name="STROKE_1" register={register} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                            <SelectGroup label="Fasting BS > 120" name="FASTING_BS_1" register={register} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                            <SelectGroup label="Exercise Angina" name="EXERCISE_ANGINA_1" register={register} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '48px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '32px', height: '32px', background: '#6366f1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>5</div>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>Chest Pain Type</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                            <SelectGroup label="Type 1" name="CHEST_PAIN_TYPE_1" register={register} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                            <SelectGroup label="Type 2" name="CHEST_PAIN_TYPE_2" register={register} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                            <SelectGroup label="Type 3" name="CHEST_PAIN_TYPE_3" register={register} options={[{ value: 0, label: 'No' }, { value: 1, label: 'Yes' }]} />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'var(--primary-gradient)',
                            color: 'white',
                            padding: '20px',
                            borderRadius: '16px',
                            border: 'none',
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            boxShadow: '0 10px 15px -3px rgba(30, 58, 138, 0.3)'
                        }}
                    >
                        <Save size={24} />
                        {loading ? 'Running AI Stratification...' : 'Analyze Patient Profile'}
                    </motion.button>
                </form>
            )}
        </motion.div>
    );
};

export default AddMember;
