
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import RiskCard from '../components/RiskCard';

const EXAMPLE_DATA = {
    "AGE": 68,
    "RENAL_DISEASE": 0,
    "HEARTFAILURE": 1,
    "CANCER": 0,
    "PULMONARY": 1,
    "STROKE": 1,
    "BMI": 35.9,
    "BP_S": 116,
    "GLUCOSE": 168,
    "HbA1c": 11.37,
    "CHOLESTEROL": 207,
    "IN_ADM": 3,
    "OUT_VISITS": 19,
    "ED_VISITS": 3,
    "RX_ADH": 0.94,
    "TOTAL_CLAIMS_COST": 5899,
    "CHEST_PAIN_TYPE": 3,
    "RESTING_BP": 153,
    "MAX_HEART_RATE": 170,
    "EXERCISE_ANGINA": 0,
    "OLDPEAK": 1.46,
    "BLOOD_PRESSURE": 115,
    "INSULIN": 33,
    "SKIN_THICKNESS": 28,
    "DIABETES_PEDIGREE": 2.15,
    "GENDER_1": 1,
    "CHEST_PAIN_TYPE_1": 0,
    "CHEST_PAIN_TYPE_2": 0,
    "CHEST_PAIN_TYPE_3": 1,
    "FASTING_BS_1": 0,
    "EXERCISE_ANGINA_1": 0
};

const Dashboard = () => {
    const [jsonInput, setJsonInput] = useState(JSON.stringify(EXAMPLE_DATA, null, 4));
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setAuthenticated(true);
    }, []);

    const handleLogin = async () => {
        try {
            await api.login("admin", "password");
            setAuthenticated(true);
        } catch (E) { // eslint-disable-line no-unused-vars
            alert("Login failed");
        }
    };

    const handlePredict = async () => {
        setLoading(true);
        setResults([]);
        try {
            const data = JSON.parse(jsonInput);

            // Call all APIs in parallel
            const promises = [
                api.predictDeterioration30d(data).catch(E => ({ error: "30d failed" })), // eslint-disable-line no-unused-vars
                api.predictDeterioration60d(data).catch(E => ({ error: "60d failed" })), // eslint-disable-line no-unused-vars
                api.predictDeterioration90d(data).catch(E => ({ error: "90d failed" })), // eslint-disable-line no-unused-vars
                api.predictHeartDisease(data).catch(E => ({ error: "Heart failed" })), // eslint-disable-line no-unused-vars
                api.predictDiabetes(data).catch(E => ({ error: "Diabetes failed" })) // eslint-disable-line no-unused-vars
            ];

            const responses = await Promise.all(promises);
            // Filter out failures or handle them
            const validResults = responses.map(r => r.data ? r.data : r);
            setResults(validResults);

        } catch (E) { // eslint-disable-line no-unused-vars
            alert("Invalid JSON data or API error");
        } finally {
            setLoading(false);
        }
    };

    if (!authenticated) {
        return (
            <div style={{ padding: '50px', display: 'flex', justifyContent: 'center' }}>
                <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '1.2rem' }}>
                    Connect to Anitgravity System (Login)
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '20px', fontSize: '2rem', fontWeight: 'bold', color: '#1a237e' }}>
                Patient Risk Stratification
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                {/* Input Section */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '15px', fontWeight: 'bold' }}>Patient Data (JSON)</h3>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        style={{ width: '100%', height: '400px', fontFamily: 'monospace', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                    />
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handlePredict}
                            disabled={loading}
                            style={{
                                background: '#1a237e', color: 'white', padding: '12px 24px',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Analyzing...' : 'Analyze Risk'}
                        </button>
                        <button
                            onClick={() => setJsonInput(JSON.stringify(EXAMPLE_DATA, null, 4))}
                            style={{
                                background: '#f5f5f5', color: '#333', padding: '12px 24px',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                            }}
                        >
                            Reset Data
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div>
                    <h3 style={{ marginBottom: '15px', fontWeight: 'bold' }}>Risk Analysis Results</h3>
                    {results.length === 0 && !loading && (
                        <div style={{ color: '#888', fontStyle: 'italic' }}>Run analysis to see predictions.</div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {results.map((res, idx) => (
                            res.error ?
                                <div key={idx} style={{ color: 'red' }}>Error: {res.error}</div> :
                                <RiskCard key={idx} result={res} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
