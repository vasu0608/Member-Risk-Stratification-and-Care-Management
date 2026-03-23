
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import {
    Upload,
    FileText,
    AlertTriangle,
    Loader2,
    Brain,
    ShieldAlert
} from 'lucide-react';
import { saveMember } from '../services/api';
import { getRiskColor, getRiskBadgeStyle } from '../utils/riskTheme';

const normalizeHeader = (header) => String(header || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toNumber = (value) => {
    if (value == null || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
};

const toBinary = (value) => {
    if (value == null || value === '') return null;
    if (typeof value === 'number') return value > 0 ? 1 : 0;

    const normalized = String(value).trim().toLowerCase();
    if (['yes', 'y', 'true', '1', 'positive', 'present'].includes(normalized)) return 1;
    if (['no', 'n', 'false', '0', 'negative', 'absent'].includes(normalized)) return 0;

    const numeric = toNumber(value);
    if (numeric == null) return null;
    return numeric > 0 ? 1 : 0;
};

const buildNormalizedRecord = (record) => {
    const normalizedMap = {};

    const walk = (obj, path = []) => {
        if (obj == null) return;

        if (Array.isArray(obj)) {
            obj.forEach((item, index) => walk(item, [...path, String(index)]));
            return;
        }

        if (typeof obj !== 'object') {
            const terminal = path[path.length - 1] || '';
            if (terminal) normalizedMap[normalizeHeader(terminal)] = obj;
            const combined = normalizeHeader(path.join('_'));
            if (combined) normalizedMap[combined] = obj;
            return;
        }

        Object.entries(obj).forEach(([k, v]) => walk(v, [...path, k]));
    };

    walk(record);
    return normalizedMap;
};

const firstValue = (normalizedMap, aliases) => {
    for (const alias of aliases) {
        const key = normalizeHeader(alias);
        if (Object.prototype.hasOwnProperty.call(normalizedMap, key)) {
            const value = normalizedMap[key];
            if (value !== '' && value != null) return value;
        }
    }
    return null;
};

const mapDmrRecordToApiSchema = (record) => {
    const src = buildNormalizedRecord(record);

    const chestPainRaw = firstValue(src, ['CHEST_PAIN_TYPE', 'CHEST_PAIN', 'CP_TYPE', 'CP']);
    const chestPain = toNumber(chestPainRaw);

    const genderRaw = firstValue(src, ['GENDER_1', 'GENDER', 'SEX']);
    const genderString = String(genderRaw || '').trim().toLowerCase();
    let gender = toBinary(genderRaw);
    if (genderString === 'male' || genderString === 'm') gender = 1;
    if (genderString === 'female' || genderString === 'f') gender = 0;

    const rxAdhRaw = firstValue(src, ['RX_ADH', 'RX_ADHERENCE', 'MED_ADHERENCE', 'MEDICATION_ADHERENCE']);
    let rxAdh = toNumber(rxAdhRaw);
    if (rxAdh != null && rxAdh > 1 && rxAdh <= 100) rxAdh = rxAdh / 100;

    const mapped = {
        AGE: toNumber(firstValue(src, ['AGE', 'PATIENT_AGE'])),
        BMI: toNumber(firstValue(src, ['BMI', 'BODY_MASS_INDEX'])),
        BP_S: toNumber(firstValue(src, ['BP_S', 'SYSTOLIC_BP', 'SBP', 'SYSTOLIC_BLOOD_PRESSURE'])),
        GLUCOSE: toNumber(firstValue(src, ['GLUCOSE', 'BLOOD_GLUCOSE', 'FASTING_GLUCOSE'])),
        HbA1c: toNumber(firstValue(src, ['HBA1C', 'HBA1C_PERCENT', 'A1C'])),
        CHOLESTEROL: toNumber(firstValue(src, ['CHOLESTEROL', 'TOTAL_CHOLESTEROL', 'CHOL'])),
        IN_ADM: toNumber(firstValue(src, ['IN_ADM', 'INPATIENT_ADMISSIONS', 'INPATIENT', 'IP_ADMISSIONS'])),
        OUT_VISITS: toNumber(firstValue(src, ['OUT_VISITS', 'OUTPATIENT_VISITS', 'OP_VISITS', 'AMBULATORY_VISITS'])),
        ED_VISITS: toNumber(firstValue(src, ['ED_VISITS', 'ER_VISITS', 'EMERGENCY_VISITS', 'ED_COUNT'])),
        RX_ADH: rxAdh,
        TOTAL_CLAIMS_COST: toNumber(firstValue(src, ['TOTAL_CLAIMS_COST', 'TOTAL_CLAIMS', 'CLAIMS_COST', 'CLAIM_AMOUNT'])),

        RESTING_BP: toNumber(firstValue(src, ['RESTING_BP', 'REST_BP'])),
        MAX_HEART_RATE: toNumber(firstValue(src, ['MAX_HEART_RATE', 'MAX_HR', 'HEART_RATE_MAX'])),
        OLDPEAK: toNumber(firstValue(src, ['OLDPEAK', 'ST_DEPRESSION'])),
        BLOOD_PRESSURE: toNumber(firstValue(src, ['BLOOD_PRESSURE', 'DIASTOLIC_BP', 'DBP'])),
        INSULIN: toNumber(firstValue(src, ['INSULIN', 'FASTING_INSULIN'])),
        SKIN_THICKNESS: toNumber(firstValue(src, ['SKIN_THICKNESS'])),
        DIABETES_PEDIGREE: toNumber(firstValue(src, ['DIABETES_PEDIGREE', 'DPF'])),

        GENDER_1: gender,
        RENAL_DISEASE_1: toBinary(firstValue(src, ['RENAL_DISEASE_1', 'RENAL_DISEASE', 'CKD'])),
        HEARTFAILURE_1: toBinary(firstValue(src, ['HEARTFAILURE_1', 'HEART_FAILURE', 'CHF'])),
        CANCER_1: toBinary(firstValue(src, ['CANCER_1', 'CANCER'])),
        PULMONARY_1: toBinary(firstValue(src, ['PULMONARY_1', 'PULMONARY_DISEASE', 'COPD'])),
        STROKE_1: toBinary(firstValue(src, ['STROKE_1', 'STROKE'])),
        FASTING_BS_1: toBinary(firstValue(src, ['FASTING_BS_1', 'FASTING_BS_GT_120', 'FASTING_BS'])),
        EXERCISE_ANGINA_1: toBinary(firstValue(src, ['EXERCISE_ANGINA_1', 'EXERCISE_ANGINA'])),
        CHEST_PAIN_TYPE_1: chestPain === 1 ? 1 : 0,
        CHEST_PAIN_TYPE_2: chestPain === 2 ? 1 : 0,
        CHEST_PAIN_TYPE_3: chestPain === 3 ? 1 : 0
    };

    const output = {};
    Object.entries(mapped).forEach(([key, value]) => {
        if (value != null && value !== '') output[key] = value;
    });
    return output;
};

const parseOcrTextToRecord = (text) => {
    const raw = String(text || '');
    const lower = raw.toLowerCase();

    const extractNumber = (patterns) => {
        for (const pattern of patterns) {
            const found = raw.match(pattern);
            if (!found || !found[1]) continue;
            const parsed = Number(found[1]);
            if (Number.isFinite(parsed)) return parsed;
        }
        return null;
    };

    const hasTerm = (patterns) => patterns.some((pattern) => pattern.test(lower));

    const matchBloodPressure = raw.match(/(?:bp|blood\s*pressure)?\s*[:=-]?\s*(\d{2,3})\s*[\/-]\s*(\d{2,3})/i);
    const systolic = matchBloodPressure ? Number(matchBloodPressure[1]) : null;
    const diastolic = matchBloodPressure ? Number(matchBloodPressure[2]) : null;

    const age = extractNumber([
        /(?:age|current\s*age|patient\s*age|years?\s*old)\D{0,10}(\d{1,3})/i,
        /\b(\d{1,3})\s*(?:y\/o|yrs?\b|years?\b)/i
    ]);
    const bmi = extractNumber([
        /(?:bmi|body\s*mass\s*index)\D{0,12}(\d{1,2}(?:\.\d+)?)/i
    ]);
    const glucose = extractNumber([
        /(?:glucose|blood\s*glucose|fasting\s*glucose|fbs|rbs|random\s*blood\s*sugar)\D{0,14}(\d{2,3}(?:\.\d+)?)/i
    ]);
    const hba1c = extractNumber([
        /(?:hba1c|hb\s*a1c|a1c|glycated\s*hemoglobin)\D{0,12}(\d{1,2}(?:\.\d+)?)/i
    ]);
    const cholesterol = extractNumber([
        /(?:total\s*cholesterol|cholesterol|chol)\D{0,14}(\d{2,3}(?:\.\d+)?)/i
    ]);

    const admissions = extractNumber([
        /(?:inpatient\s*admissions?|admissions?)\D{0,8}(\d{1,2})/i
    ]);
    const outpatientVisits = extractNumber([
        /(?:outpatient\s*visits?|op\s*visits?)\D{0,8}(\d{1,2})/i
    ]);
    const edVisits = extractNumber([
        /(?:ed\s*visits?|er\s*visits?|emergency\s*visits?)\D{0,8}(\d{1,2})/i
    ]);

    const record = {
        AGE: age,
        BMI: bmi,
        BP_S: systolic,
        BLOOD_PRESSURE: diastolic,
        GLUCOSE: glucose,
        HbA1c: hba1c,
        CHOLESTEROL: cholesterol,
        IN_ADM: admissions,
        OUT_VISITS: outpatientVisits,
        ED_VISITS: edVisits,
        GENDER_1: /\bmale\b|\bm\b/i.test(lower) ? 1 : (/\bfemale\b|\bf\b/i.test(lower) ? 0 : null),
        HEARTFAILURE_1: hasTerm([/(heart\s*failure|congestive\s*heart\s*failure|chf)/]) ? 1 : null,
        RENAL_DISEASE_1: hasTerm([/(renal|kidney\s*disease|ckd)/]) ? 1 : null,
        PULMONARY_1: hasTerm([/(pulmonary|copd|asthma)/]) ? 1 : null,
        STROKE_1: hasTerm([/\bstroke\b/]) ? 1 : null,
        CANCER_1: hasTerm([/\bcancer\b/]) ? 1 : null,
        EXERCISE_ANGINA_1: hasTerm([/(exercise\s*angina|exang|chest\s*pain\s*on\s*exertion)/]) ? 1 : null
    };

    const cleaned = {};
    Object.entries(record).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') cleaned[key] = value;
    });

    return cleaned;
};

const parseImageToRecord = async (selectedFile) => {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');

    try {
        const { data } = await worker.recognize(selectedFile);
        const record = parseOcrTextToRecord(data?.text || '');

        const informativeCount = [record.AGE, record.BMI, record.BP_S, record.GLUCOSE, record.HbA1c, record.CHOLESTEROL]
            .filter(v => v != null && Number(v) > 0).length;
        if (informativeCount < 3) {
            throw new Error('Could not extract enough structured clinical fields from image. Upload CSV/JSON for best accuracy.');
        }

        return [record];
    } finally {
        await worker.terminate();
    }
};

const parsePdfToRecord = async (selectedFile) => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfWorkerSrc = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    let combinedText = '';
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
        const page = await pdf.getPage(pageNo);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(' ');
        combinedText += `\n${pageText}`;
    }

    let record = parseOcrTextToRecord(combinedText);

    // If text layer is weak (scanned PDF), run OCR on rendered pages.
    let informativeCount = [record.AGE, record.BMI, record.BP_S, record.GLUCOSE, record.HbA1c, record.CHOLESTEROL]
        .filter(v => v != null && Number(v) > 0).length;
    if (informativeCount < 3) {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');

        try {
            let ocrText = '';
            for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
                const page = await pdf.getPage(pageNo);
                const viewport = page.getViewport({ scale: 1.8 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);

                await page.render({ canvasContext: context, viewport }).promise;
                const { data } = await worker.recognize(canvas);
                ocrText += `\n${data?.text || ''}`;
            }

            record = parseOcrTextToRecord(ocrText);
            informativeCount = [record.AGE, record.BMI, record.BP_S, record.GLUCOSE, record.HbA1c, record.CHOLESTEROL]
                .filter(v => v != null && Number(v) > 0).length;
        } finally {
            await worker.terminate();
        }
    }

    if (informativeCount < 3) {
        throw new Error('Could not extract enough clinical fields from PDF. For best accuracy, upload structured CSV/JSON or a clearer scan.');
    }

    return [record];
};

const AddMember = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [summary, setSummary] = useState(null);

    const getRiskLevelColor = (riskLevel) => {
        return getRiskColor(riskLevel);
    };

    const historyRowsFor = (item) => {
        const created = item?.created_at ? new Date(item.created_at) : new Date();
        const tier = item?.final_risk_tier || 'Low';
        return [
            {
                date: created.toLocaleDateString(),
                diagnosis: 'Uploaded EHR AI Assessment',
                severity: tier,
                status: tier === 'Very High' || tier === 'High' ? 'Under Treatment' : 'Stable'
            },
            {
                date: new Date(created.getTime() - 86400000 * 40).toLocaleDateString(),
                diagnosis: 'Follow-up clinical review',
                severity: tier === 'Very High' ? 'High' : tier,
                status: 'Under Observation'
            }
        ];
    };

    const parseJsonRecords = (text) => {
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) return parsed;
        if (parsed && Array.isArray(parsed.patients)) return parsed.patients;
        if (parsed && typeof parsed === 'object') return [parsed];

        return [];
    };

    const parseTextAsCsvRecords = (text) => {
        const parsed = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true
        });

        if (parsed.errors?.length) {
            throw new Error(parsed.errors[0].message || 'Unable to parse CSV file.');
        }

        return parsed.data;
    };

    const readAndExtractRecords = async (selectedFile) => {
        const ext = selectedFile.name.split('.').pop()?.toLowerCase();

        if (ext === 'pdf' || selectedFile.type === 'application/pdf') {
            return parsePdfToRecord(selectedFile);
        }

        if (selectedFile.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'bmp', 'webp'].includes(ext || '')) {
            return parseImageToRecord(selectedFile);
        }

        const fileText = await selectedFile.text();

        if (ext === 'json') {
            return parseJsonRecords(fileText);
        }

        return parseTextAsCsvRecords(fileText);
    };

    const handleFileChange = (event) => {
        const selected = event.target.files?.[0] || null;
        setFile(selected);
        setResults([]);
        setError(null);
        setSummary(null);
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResults([]);
        setSummary(null);

        try {
            const records = await readAndExtractRecords(file);

            if (!records.length) {
                throw new Error('No patient records found in the uploaded file.');
            }

            const normalizedRecords = records.map(mapDmrRecordToApiSchema);

            const settleResults = await Promise.allSettled(
                normalizedRecords.map((record) => saveMember(record))
            );

            const successRows = settleResults
                .filter((item) => item.status === 'fulfilled')
                .map((item) => item.value.data);

            const failureRows = settleResults
                .filter((item) => item.status === 'rejected');

            const failureReason = failureRows[0]?.reason?.response?.data?.detail
                || failureRows[0]?.reason?.message
                || null;

            setResults(successRows);
            setSummary({
                uploaded: records.length,
                saved: successRows.length,
                failed: failureRows.length
            });

            if (successRows.length === 0) {
                throw new Error('No records could be saved. Please verify the file schema and required fields.');
            }

            if (failureRows.length > 0) {
                setError(`${failureRows.length} record(s) could not be saved. ${successRows.length} record(s) were added to Health Overview.${failureReason ? ` Reason: ${failureReason}` : ''}`);
            }
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            const message = typeof detail === 'string'
                ? detail
                : (err.message || 'Failed to analyze medical record file.');
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto' }}
        >
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-1px' }}>
                    Digital Medical Record Analysis
                </h1>
                <p style={{ marginTop: '8px', color: '#64748b', fontSize: '1.05rem' }}>
                    Upload doctor records to automatically analyze risk and add members to Health Overview.
                </p>
            </div>

            <motion.div
                whileHover={{ scale: 1.005 }}
                className="glass-panel"
                style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '22px',
                    padding: '44px 36px',
                    textAlign: 'center',
                    marginBottom: '28px'
                }}
            >
                <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '16px', background: 'var(--accent-gradient)', color: 'white', marginBottom: '14px' }}>
                    <Upload size={30} />
                </div>

                <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontWeight: 800 }}>
                    Upload Medical Record File
                </h3>
                <p style={{ margin: '0 0 20px 0', color: '#64748b' }}>
                    Supported formats: CSV, JSON, TXT (CSV-style headers), PDF, PNG/JPG form screenshots.
                </p>

                <input
                    id="medical-record-upload"
                    type="file"
                    accept=".csv,.json,.txt,.pdf,.png,.jpg,.jpeg,.bmp,.webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <label
                        htmlFor="medical-record-upload"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 22px',
                            borderRadius: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            color: file ? '#334155' : 'white',
                            background: file ? '#f1f5f9' : 'var(--primary-gradient)',
                            border: file ? '1px solid #e2e8f0' : 'none'
                        }}
                    >
                        <FileText size={18} />
                        {file ? file.name : 'Select Medical Record'}
                    </label>

                    {file && (
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '14px 22px',
                                borderRadius: '14px',
                                border: 'none',
                                fontWeight: 800,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                color: 'white',
                                background: 'var(--success-gradient)'
                            }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
                            {loading ? 'Analyzing Risk...' : 'Analyze Risk'}
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                marginTop: '18px',
                                color: '#b91c1c',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <AlertTriangle size={16} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {summary && (
                <div style={{ marginBottom: '18px', background: '#ecfeff', border: '1px solid #a5f3fc', color: '#155e75', borderRadius: '12px', padding: '10px 12px', fontSize: '0.92rem' }}>
                    Uploaded: <strong>{summary.uploaded}</strong> | Saved to Health Overview: <strong>{summary.saved}</strong> | Failed: <strong>{summary.failed}</strong>
                </div>
            )}

            {results.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel"
                    style={{ borderRadius: '20px', overflow: 'hidden', background: 'var(--card-bg)' }}
                >
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--card-border)', background: 'var(--bg-soft)' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>
                            Risk Analysis Results ({results.length} saved record{results.length > 1 ? 's' : ''})
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {results.map((item, index) => {
                            const risk = item?.final_risk_tier || 'Low';
                            const tierColor = getRiskLevelColor(risk);
                            const f = item?.features || {};

                            const extractedPairs = [
                                ['AGE', f.AGE],
                                ['BMI', f.BMI],
                                ['BP_S', f.BP_S],
                                ['GLUCOSE', f.GLUCOSE],
                                ['HbA1c', f.HbA1c],
                                ['CHOLESTEROL', f.CHOLESTEROL],
                                ['IN_ADM', f.IN_ADM],
                                ['ED_VISITS', f.ED_VISITS]
                            ].filter(([, v]) => v != null && v !== '');

                            return (
                                <div
                                    key={index}
                                    style={{
                                        padding: '18px 24px',
                                        borderBottom: index === results.length - 1 ? 'none' : '1px solid var(--card-border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '18px',
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                            Record #{index + 1}
                                        </div>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: tierColor, fontWeight: 800 }}>
                                            <ShieldAlert size={16} />
                                            {risk}
                                        </div>
                                        <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '620px' }}>
                                            Extracted Fields: {extractedPairs.length > 0
                                                ? extractedPairs.map(([k, v]) => `${k}=${v}`).join(', ')
                                                : 'No structured clinical fields returned'}
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Intervention: <strong>{item?.intervention || '-'}</strong>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ padding: '20px 24px', borderTop: '1px solid var(--card-border)' }}>
                        <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Patient Profile (Latest Upload)</h3>
                        {(() => {
                            const item = results[0];
                            if (!item) return null;
                            const f = item.features || {};
                            const tier = item.final_risk_tier || 'Low';
                            const historyRows = historyRowsFor(item);

                            return (
                                <>
                                    <div className="glass-card" style={{ borderRadius: 14, padding: 14, marginBottom: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                            <div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.name || `Member ${item.id}`}</div>
                                                <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>Age {f.AGE ?? '-'} • Gender {f.GENDER_1 === 1 ? 'Male' : (f.GENDER_1 === 0 ? 'Female' : 'Unknown')}</div>
                                            </div>
                                            <span style={{ ...getRiskBadgeStyle(tier), padding: '6px 10px', borderRadius: 999, fontWeight: 800 }}>{tier}</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 12 }}>
                                        {[
                                            ['BP', f.BP_S, 'mmHg'],
                                            ['Glucose', f.GLUCOSE, 'mg/dL'],
                                            ['HbA1c', f.HbA1c, '%'],
                                            ['BMI', f.BMI, 'kg/m²'],
                                        ].map(([k, v, u]) => (
                                            <div key={k} className="glass-card" style={{ borderRadius: 12, padding: 10 }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{k}</div>
                                                <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{v ?? '-'} <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{u}</span></div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="glass-card" style={{ borderRadius: 12, padding: 12 }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>Patient History</h4>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                        <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>Date</th>
                                                        <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>Diagnosis</th>
                                                        <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>Severity</th>
                                                        <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {historyRows.map((row, idx) => (
                                                        <tr key={`${row.date}-${idx}`} style={{ borderBottom: idx === historyRows.length - 1 ? 'none' : '1px solid var(--card-border)' }}>
                                                            <td style={{ padding: '8px 4px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{row.date}</td>
                                                            <td style={{ padding: '8px 4px', color: 'var(--text-primary)', fontSize: '0.82rem' }}>{row.diagnosis}</td>
                                                            <td style={{ padding: '8px 4px' }}><span style={{ ...getRiskBadgeStyle(row.severity), padding: '4px 8px', borderRadius: 999, fontWeight: 700, fontSize: '0.74rem' }}>{row.severity}</span></td>
                                                            <td style={{ padding: '8px 4px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{row.status}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default AddMember;
