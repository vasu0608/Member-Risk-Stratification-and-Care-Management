# Technical Module Understanding Report

Date: 2026-03-20
Project: Member Risk Stratification

## 1) Executive Technical Summary

This project is a full-stack clinical risk stratification platform with:

- A FastAPI backend that normalizes incoming health records, runs 5 XGBoost models, computes a final risk tier, and stores member and score history in SQLite.
- A React + Vite frontend that supports single-record onboarding, batch scoring, dashboard analytics, and live monitoring visualization.
- Utility and verification scripts for model integrity checks, risk mapping logic validation, demo data seeding, and data recomputation.

Core prediction targets:

- Deterioration (30d, 60d, 90d)
- Diabetes risk
- Heart disease risk

## 2) System Architecture

### 2.1 Backend Layer

- Framework: FastAPI
- Inference: joblib-loaded XGBoost models
- Storage: SQLite via SQLAlchemy ORM
- Auth: JWT bearer token (demo credential endpoint)
- Main APIs:
  - /token
  - /members (create + persist predictions)
  - /members (list)
  - /predict/batch
  - /predict/deterioration/30d, /60d, /90d
  - /predict/diabetes
  - /predict/heart-disease
  - /monitoring/live
  - /seed

### 2.2 Frontend Layer

- Framework: React 19 + Vite
- Routing: react-router-dom
- HTTP client: axios with token interceptor
- Visual stack: recharts, framer-motion, lucide-react
- File ingest: papaparse (CSV), pdfjs-dist + tesseract.js (PDF/image extraction)

### 2.3 Data and Model Assets

- Models: backend/ml_models/*.joblib (5 classifiers)
- Features references: backend/data/features/*.txt and root feature text exports
- Datasets used for model training: backend/ml_models/Datasets/*.csv

## 3) Runtime Data Flow (End-to-End)

1. User submits a member record from Add Member or Upload pages.
2. Backend canonicalizes input keys and values.
3. Backend validates minimum informative data before prediction.
4. ModelManager aligns input into strict model training feature order.
5. Each model predicts probability and maps to a risk level tier.
6. Backend computes final risk tier using:
   - highest deterioration model tier as base
   - disease escalation (+1 cap) when diabetes/heart disease are high severity
   - clinical floor from severe biomarker red flags
7. Backend computes intervention text and ROI metrics.
8. Records are persisted to patients and risk_scores tables.
9. Frontend dashboard renders members, tier distribution, trends, ROI, and drill-down details.
10. Monitoring page polls /monitoring/live every 5 seconds for live-like vitals tiles.

## 4) Backend Module-by-Module Explanation

### 4.1 API Core

- backend/app/main.py
  - Application entrypoint for FastAPI routes and core orchestration.
  - Handles CORS, token login route, prediction endpoints, persistence logic, seed route, and live monitoring feed.
  - Contains canonical key mapping, value normalization helpers, input quality validation, clinical floor logic, and final tier/intervention aggregation logic.

- backend/app/prediction.py
  - Contains ModelManager, the central inference engine.
  - Loads all model artifacts, captures expected feature schema per model, aligns incoming records, runs prediction, normalizes probability values, and maps values to 5 risk tiers.
  - Exposes model_manager singleton used by API and scripts.

- backend/app/models.py
  - SQLAlchemy ORM entities:
    - Patient: features blob, final tier, intervention, ROI and impact metrics.
    - RiskScore: per-model risk outputs over time.
  - Defines one-to-many relationship Patient -> RiskScore.

- backend/app/schemas.py
  - Pydantic contracts for request/response validation.
  - Unified PatientData schema includes canonical model fields, one-hot categorical fields, and raw aliases.
  - Defines PredictionResponse, BatchPredictionRequest, and MemberResponse.

- backend/app/database.py
  - SQLAlchemy engine/session setup for SQLite at backend/data/careinsight_v2.db.
  - Provides Base and get_db session dependency.

- backend/app/auth.py
  - JWT encode/decode and OAuth2 bearer extraction.
  - verify_token dependency protects selected prediction routes.
  - Uses hardcoded secret key (acceptable for demo only).

- backend/run_backend.py
  - Starts uvicorn server with reload on 127.0.0.1:8000.

- backend/__init__.py
  - Package marker for backend importability.

- backend/app/__init__.py
  - Empty package initializer for app module.

### 4.2 Backend Scripts (Validation, Seeding, Maintenance)

- backend/scripts/test_api.py
  - Authenticates via /token and validates multiple prediction endpoints and batch prediction.

- backend/scripts/verify_models.py
  - Verifies that all 5 model files exist and can be loaded.

- backend/scripts/verify_risk_mapping.py
  - Validates probability-to-tier thresholds in ModelManager.get_risk_level().

- backend/scripts/verify_escalation_logic.py
  - Early final-tier escalation validation script using direct test cases.

- backend/scripts/verify_escalation_logic_v2.py
  - Refined escalation tests validating capped +1 upgrade behavior.

- backend/scripts/inspect_models.py
  - Extracts and exports model feature names into text files for inspection.

- backend/scripts/seed_demo_patients.py
  - Destructive reset-and-seed utility creating realistic multi-tier demo cohorts and computed outcomes.

- backend/scripts/verify_demo_data.py
  - Pulls /members and prints tier distribution and sample member summaries.

- backend/scripts/test_roi.py
  - Verifies ROI computation logic against expected tier configuration values.

- backend/scripts/recompute_risks.py
  - Recomputes scores for all patients after deleting old scores, then recomputes final tier/intervention and ROI fields.

- backend/scripts/recompute_risks_append.py
  - Appends new scores without deleting prior score history and updates aggregate fields.

## 5) Frontend Module-by-Module Explanation

### 5.1 App Shell and Infrastructure

- frontend/src/main.jsx
  - React bootstrap; wraps app in ThemeProvider.

- frontend/src/App.jsx
  - Router shell and sidebar layout.
  - Defines route map for dashboard, monitoring, analytics, add-member, upload, and settings.

- frontend/src/services/api.js
  - Central axios client with bearer token injection.
  - Exposes login/logout and all backend endpoint wrappers used by pages/components.

- frontend/src/context/ThemeContext.jsx
  - Theme state, persistence to localStorage, and root data-theme attribute management.

- frontend/src/utils/riskTheme.js
  - Single source of frontend risk colors and badge style helpers.

### 5.2 Pages

- frontend/src/pages/PopulationDashboard.jsx
  - Main operational dashboard:
    - loads members
    - computes aggregate stats and risk distributions
    - displays charts and care protocol guidance
    - hosts member table and details drawer

- frontend/src/pages/RealTimeMonitoring.jsx
  - Thin page wrapper for monitoring component.

- frontend/src/pages/Analytics.jsx
  - ROI and claims analytics page, including tier-level ROI and claims-intensity visualizations.

- frontend/src/pages/AddMember.jsx
  - Single/bulk member ingestion with broad file support.
  - Parses and normalizes CSV/JSON/TXT/PDF/image records into API schema.
  - Submits records via /members and renders saved results with profile/history context.

- frontend/src/pages/UploadData.jsx
  - Batch CSV upload and /predict/batch orchestration.
  - Displays final risk and intervention recommendations per processed row.

- frontend/src/pages/Settings.jsx
  - Theme settings UI (light/dark selection).

- frontend/src/pages/Dashboard.jsx
  - Legacy/manual testing view for direct JSON input and parallel endpoint prediction cards.
  - Not currently routed in App.jsx.

### 5.3 Reusable UI Components

- frontend/src/layout/Sidebar.jsx
  - Main navigation and logout action.

- frontend/src/components/MembersTable.jsx
  - Search/filter/sort-like member listing for triage and drawer open action.

- frontend/src/components/MemberDetailsDrawer.jsx
  - Member drill-down panel with biometrics, disease indicators, risk details, intervention, and synthetic history rendering.

- frontend/src/components/RealTimeMonitoring.jsx
  - Polling component for /monitoring/live every 5s.
  - Computes local status labels (Normal/Warning/Critical) from vitals and risk tier.

- frontend/src/components/RiskCard.jsx
  - Compact model result card used by legacy dashboard/testing flow.

### 5.4 Styling Modules

- frontend/src/index.css
  - Global design tokens, theme variables, glass-card utilities, layout and animation primitives.

- frontend/src/App.css
  - Vite starter CSS leftovers (mostly not central to active design system).

- frontend/src/components/RiskCard.css
  - Component-scoped styling for RiskCard.

## 6) Root-Level Utility Modules

- risk_scoring_engine.py
  - Standalone non-API scoring engine class that loads and scores model files directly.
  - Uses a different naming scheme from backend canonical model keys; appears to be a legacy/parallel utility.

- seed_clinical_examples.py
  - Seeds curated clinical examples through /members API for quick demonstrations.

- search_tiers.py
  - Randomized request generator used to discover/verify tier outcomes from /predict/batch.

- reset_db.py
  - Drops and recreates all DB tables via ORM metadata (destructive).

- debug_p.py
  - Lightweight debug utility calling /predict/batch and printing model outputs and final tier.

- start_backend.bat
  - Windows launcher that attempts to stop uvicorn process and starts backend/run_backend.py.

## 7) Supporting Artifacts and Their Role

- debug_out.txt
  - Captured output from debugging runs.

- *_features.txt files at root and backend/data/features/
  - Feature dictionaries exported/used for model inspection and schema references.

- full_module_audit_report_2026-03-20.md
  - Prior repository audit documentation.

- module_remediation_validation_report_2026-03-20.md
  - Prior remediation/validation report.

- sample_module_test_report_2026-03-20.md
  - Prior sample testing report.

- frontend/lint_*.txt, lint_results.*
  - Lint output snapshots and diagnostics.

## 8) Technical Observations (Important for Understanding)

1. Canonical schema is critical.
   - Backend prediction depends on strict feature alignment and one-hot derivations.

2. Final tier logic is domain-driven, not just max probability.
   - Deterioration models set base severity.
   - Heart/diabetes can escalate severity by one level.
   - Clinical floor protects against under-classification in sparse/noisy uploads.

3. Frontend and backend both include normalization logic.
   - This improves robustness but introduces drift risk when mappings evolve.

4. Some modules are operational vs. diagnostic.
   - Operational: backend/app/*, frontend/src pages/components in active routes.
   - Diagnostic/maintenance: backend/scripts/*, root debug utilities.

5. Legacy module exists.
   - risk_scoring_engine.py is not the primary runtime path for API-based flow.

## 9) Recommended Next Technical Cleanup

1. Extract shared canonical key map and tier constants into a single backend module imported by API and scripts.
2. Add a backend endpoint that validates/normalizes records so frontend no longer maintains duplicate mapping logic.
3. Move destructive scripts (reset/recompute/seed) into a dedicated scripts/destructive folder with safety prompts.
4. Decide whether to archive or adapt risk_scoring_engine.py to current canonical model keys.
5. Remove or re-route frontend/src/pages/Dashboard.jsx to avoid orphaned module drift.

## 10) Conclusion

The project is technically mature in core architecture: robust input handling, multi-model scoring, clinically aware risk aggregation, ROI projection, and front-end observability. The main complexity lies in schema normalization and duplicated business rules across modules. Consolidating constants and normalization into shared sources would reduce long-term maintenance risk while preserving current functionality.
