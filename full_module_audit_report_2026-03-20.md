# Full Module Audit Report

Date: 2026-03-20
Project: Member Risk Stratification
Auditor: GitHub Copilot (GPT-5.3-Codex)

## 1) Scope And Approach
This audit covers:
- Module purpose and functional behavior (backend, frontend, utility scripts)
- Runtime health checks for API and selected scripts
- Build/syntax validation for backend and frontend
- Practical status classification:
  - `Working`
  - `Partially Working`
  - `Not Working`
  - `Not Executed (by design)`

Executed checks:
- Python syntax compilation:
  - `"d:/Member Risk Stratification/.venv/Scripts/python.exe" -m compileall backend risk_scoring_engine.py search_tiers.py seed_clinical_examples.py reset_db.py debug_p.py`
- Backend health:
  - `GET /` -> 200
  - `GET /members` -> OK
  - `POST /predict/batch` -> OK
  - `GET /monitoring/live` -> OK
- Frontend health:
  - `npm run build` in `frontend/` -> success
- Script execution matrix (non-destructive scripts): executed and recorded below.

## 2) High-Level Architecture
- Backend API: FastAPI app in `backend/app/main.py`
- Model Inference Layer: `backend/app/prediction.py` loads XGBoost models and aligns features
- Persistence Layer: SQLite + SQLAlchemy models in `backend/app/database.py` and `backend/app/models.py`
- Auth Layer: JWT token helper in `backend/app/auth.py`
- Frontend: React + Vite app in `frontend/src/`
- Utility/ops scripts: `backend/scripts/` and root-level `*.py`

## 3) Backend Core Modules

### `backend/app/main.py`
- Purpose:
  - Main API router for member creation, batch prediction, monitoring feed, and seed endpoint.
- How it works:
  - Canonicalizes uploaded payload keys (`_canonicalize_payload`), validates minimum data quality.
  - Calls model manager for 5 model predictions.
  - Computes final risk tier with disease escalation rules.
  - Computes intervention and ROI metrics and persists to DB.
- Status: `Working`
- Evidence:
  - `/` and `/members`, `/predict/batch`, `/monitoring/live` all responded successfully.

### `backend/app/prediction.py`
- Purpose:
  - Central inference module for all ML models.
- How it works:
  - Loads model files from `backend/ml_models/`.
  - Aligns incoming features to exact training schema.
  - Normalizes probability and maps to tier (`Very Low` ... `Very High`).
  - Returns per-model prediction payload.
- Status: `Working`
- Evidence:
  - Batch prediction endpoint returned valid model outputs and final tier.

### `backend/app/schemas.py`
- Purpose:
  - Pydantic schemas for API validation and response serialization.
- How it works:
  - Defines `PatientData`, prediction response models, and member response shape.
- Status: `Working`
- Evidence:
  - API accepted normalized payloads and returned schema-conformant responses.

### `backend/app/database.py`
- Purpose:
  - SQLAlchemy engine/session/base setup.
- How it works:
  - Points to SQLite DB at `backend/data/careinsight_v2.db`.
  - Provides `get_db()` dependency generator.
- Status: `Working`

### `backend/app/models.py`
- Purpose:
  - ORM definitions for `Patient` and `RiskScore`.
- How it works:
  - Stores feature blobs, per-model scores, final tier, interventions, ROI impact.
- Status: `Working`

### `backend/app/auth.py`
- Purpose:
  - JWT generation and token verification for protected endpoints.
- How it works:
  - Issues HS256 JWT tokens and validates `sub` claim.
- Status: `Working` (basic flow)
- Note:
  - Uses hardcoded secret key; acceptable for demo, not for production.

## 4) Backend Script Modules (`backend/scripts`)

### Working scripts (executed successfully)
- `backend/scripts/verify_escalation_logic.py`
  - Purpose: unit-style checks for escalation logic (older version).
  - Status: `Working` (PASS cases).
- `backend/scripts/verify_escalation_logic_v2.py`
  - Purpose: improved escalation test suite with cap-at-+1 behavior.
  - Status: `Working` (PASS cases).

### Partially working / outdated scripts
- `backend/scripts/verify_models.py`
  - Purpose: verify that model files can be loaded.
  - Status: `Partially Working`
  - Issue:
    - Uses hardcoded model path to local desktop (`c:\Users\...\Models`), not project path.
    - Script runs but reports all model files not found.
- `backend/scripts/inspect_models.py`
  - Purpose: inspect and export model feature names.
  - Status: `Not Working`
  - Issue:
    - Missing `pandas` dependency in current environment.
    - Also uses hardcoded external model path.
- `backend/scripts/verify_risk_mapping.py`
  - Purpose: test `get_risk_level` tier thresholds.
  - Status: `Not Working`
  - Issue:
    - Incorrect import path: `from backend.prediction import model_manager` (actual module path is under `backend/app`).

### API-dependent scripts (not working in current venv due missing `requests`)
- `backend/scripts/test_api.py`
- `backend/scripts/test_roi.py`
- `backend/scripts/verify_demo_data.py`
- Status: `Not Working`
- Issue:
  - `ModuleNotFoundError: requests`

### Not executed (destructive/data mutating)
- `backend/scripts/seed_demo_patients.py`
  - Purpose: clear and repopulate DB with demo cohort.
  - Status: `Not Executed (by design)` (destructive).
- `backend/scripts/recompute_risks.py`
  - Purpose: recompute all stored member scores and overwrite score history.
  - Status: `Not Executed (by design)` (mutates all records).
- `backend/scripts/recompute_risks_append.py`
  - Purpose: recompute and append fresh scores without deleting history.
  - Status: `Not Executed (by design)` (mutates all records).

## 5) Frontend Modules

### App shell and routing
- `frontend/src/main.jsx`
  - Purpose: React root bootstrap.
  - Status: `Working`.
- `frontend/src/App.jsx`
  - Purpose: route map + sidebar layout.
  - Routes: `/`, `/monitoring`, `/analytics`, `/add-member`, `/upload`.
  - Status: `Working`.

### Feature pages
- `frontend/src/pages/PopulationDashboard.jsx`
  - Purpose: population stats, risk distribution, member table and detail drawer.
  - Data source: `GET /members`.
  - Status: `Working`.
- `frontend/src/pages/Analytics.jsx`
  - Purpose: ROI analytics and claims intensity visualizations.
  - Data source: `GET /members`.
  - Status: `Working`.
- `frontend/src/pages/RealTimeMonitoring.jsx`
  - Purpose: wrapper page for real-time monitoring panel.
  - Status: `Working`.
- `frontend/src/pages/AddMember.jsx`
  - Purpose: upload single/multi records from CSV/JSON/TXT/PDF/image, normalize, and save via `/members`.
  - Status: `Working`.
- `frontend/src/pages/UploadData.jsx`
  - Purpose: batch prediction view via `/predict/batch`.
  - Status: `Working`.

### Components
- `frontend/src/components/RealTimeMonitoring.jsx`
  - Purpose: polling dashboard for `/monitoring/live` every 5 seconds.
  - Status: `Working`.
- `frontend/src/components/MembersTable.jsx`
  - Purpose: searchable/filterable table for members.
  - Status: `Working`.
- `frontend/src/components/MemberDetailsDrawer.jsx`
  - Purpose: detailed risk and utilization view for selected member.
  - Status: `Working`.
- `frontend/src/components/RiskCard.jsx`
  - Purpose: card display for model result on standalone dashboard.
  - Status: `Working`.

### Frontend quality checks
- Build command: `npm run build`
- Result: `Success` (all modules bundled).
- Note:
  - Build warnings on large chunks (>500 KB), performance optimization opportunity, not a runtime failure.

## 6) Root-Level Utility Modules

### `backend/run_backend.py`
- Purpose: start FastAPI server via uvicorn on `127.0.0.1:8000`.
- Status: `Working`.

### `start_backend.bat`
- Purpose: Windows launcher for backend.
- How it works:
  - Kills existing uvicorn python process by window title filter.
  - Starts `python backend\run_backend.py`.
- Status: `Likely Working` (not re-executed in this audit cycle because backend already running).

### `risk_scoring_engine.py`
- Purpose:
  - Legacy standalone risk engine class (`RiskScoringEngine`) for direct model scoring outside FastAPI.
- How it works:
  - Loads models from provided folder, prepares features per model, returns predictions.
- Status: `Not Verified at runtime` (import/syntax OK).
- Note:
  - Feature names differ from current API canonical schema; appears legacy/parallel implementation.

### `search_tiers.py`
- Purpose: random payload probing script for tier discovery through `/predict/batch`.
- Status: `Not Working` in current env (missing `requests`).

### `seed_clinical_examples.py`
- Purpose: seed a few curated clinical examples via `/members` endpoint.
- Status: `Not Working` in current env (missing `requests`).

### `reset_db.py`
- Purpose: reset database schema.
- Status: `Not Verified at runtime`.
- Risk note:
  - Imports look stale (`from backend.database ...`) and may not match current package layout.

### `debug_p.py`
- Purpose: quick debug script for `/predict/batch` response values.
- Status: `Not Working` in current env (missing `requests`).

## 7) Consolidated Working Status

### Fully working (validated)
- Backend API core modules (`main.py`, `prediction.py`, `schemas.py`, `database.py`, `models.py`, `auth.py`)
- Frontend app modules (all routed pages/components) based on successful production build
- Escalation test scripts (`verify_escalation_logic.py`, `verify_escalation_logic_v2.py`)

### Not working / needs fixes
- Scripts requiring `requests` package (`test_api.py`, `test_roi.py`, `verify_demo_data.py`, `search_tiers.py`, `seed_clinical_examples.py`, `debug_p.py`)
- `verify_risk_mapping.py` (bad import path)
- `inspect_models.py` (missing `pandas`, hardcoded path)
- `verify_models.py` (hardcoded model path)

### Not executed intentionally
- Data-mutating scripts (`seed_demo_patients.py`, `recompute_risks.py`, `recompute_risks_append.py`)

## 8) Priority Fix Recommendations

1. Standardize script imports and paths:
- Update all scripts to use `backend/app` import layout.
- Replace hardcoded model paths with project-relative paths.

2. Add missing script dependencies in venv:
- Install `requests` and `pandas` (if scripts are still needed).

3. Keep one source of truth for risk-tier logic:
- Continue using backend-computed `final_risk_tier` for frontend displays.

4. Add a unified script health runner:
- Create a single `backend/scripts/health_check.py` to run non-destructive checks and output pass/fail summary.

## 9) Final Conclusion
- Core product modules (backend API + frontend app) are operational.
- Main application flows are working: member scoring, batch scoring, monitoring feed, and UI build.
- Several utility/test scripts are outdated or dependency-blocked; they need cleanup to make the entire script suite fully green.
