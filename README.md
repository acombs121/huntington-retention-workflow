# Huntington Horizon: Intelligent Liquidity Orchestration

Production-grade, interactive full-stack Google Cloud Run demonstration application for **Huntington Horizon: Intelligent Liquidity Orchestration**. Built strictly in accordance with the **Google Cloud Run Demo Standard** (`/cloud-run-demo`), the approved **Huntington Bank Corporate Design Specification** (`DESIGN.md`, `brand_kit.html`), and **Functional Requirements** (`PRD.md`, `DEMO_SCRIPT.md`).

---

## 1. Executive Summary & Core Thesis

Huntington cannot scale its wealth management franchise by asking bankers to work harder. The commercial book experiences **$4.5B in annual CRE and middle-market loan payoffs**, with **~78% of net liquidity wiring out to external competitors within 48–72 hours**.

### The Two-Sided Capacity Bottleneck
1. **Commercial Side:** Commercial RMs focus on loan production and lack the bandwidth for 6–8 hours of manual discovery, entity resolution, and valuation across siloed systems per deal.
2. **Wealth Side (Onboarding & Ongoing Servicing):** Manual onboarding takes 2–3 weeks, and ongoing fiduciary servicing caps Private Wealth Advisors (PWAs) at ~80–100 accounts. Flooding advisors with leads trades a commercial bottleneck for an acute wealth bottleneck.
3. **The 1031 Exchange Leakage:** 50–65% of commercial property dispositions execute an IRC §1031 like-kind exchange. If funds touch commercial operating checking, tax deferral is voided, forcing funds to leak to third-party Qualified Intermediaries (QIs).

### The Solution: Dual-Sided Agentic Capacity Leverage
Powered by the **Gemini Enterprise Agent Platform (fka Vertex AI Platform)** running `gemini-3.7-flash`:
- **Monitors 100% of the $4.5B book** for title payoff statement requests in real time.
- **Absorbs Commercial Discovery**: Extracts borrowing LLCs to beneficial owners with pixel-level bounding-box citations, resolving unstated contract sale prices via trailing NOI grounded by Vertex AI Search (~7 hrs → 4 min).
- **Automates Wealth Scaffolding**: Pre-stages 80% of KYC/CIP, SEI custodial shell, and draft IPS behind a **GLBA Quarantined Consent Gate**, and automates ongoing quarterly review dossiers (expanding advisor capacity from 80 to 150 accounts).
- **Safeguards 1031 Exchange Liquidity**: Automatically routes exchange proceeds to the **Huntington 1031 Qualified Escrow Depository (Partner QI Network)** under Treas. Reg. § 1.1031(k)-1(g)(3), preserving deposits on balance sheet for 180 days.
- **Zero Net New Headcount**: Scales the franchise across both Commercial and Wealth with existing staff.

---

## 2. Technical Monostack Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  HUNTINGTON HORIZON MONOSTACK                                   │
├───────────────────────────────┬─────────────────────────────────┬───────────────────────────────┤
│ FRONTEND (React 18 + Vite)    │ REASONING ORCHESTRATOR          │ CLOUD RUN DEPLOYMENT          │
│ • Tailwind CSS + shadcn/ui    │ • Gemini Enterprise Agent       │ • python:3.11-slim Container  │
│ • Swiss Minimalist Console    │   Platform (gemini-3.7-flash)   │ • Non-root appuser execution  │
│ • 3-Pane Interactive Layout   │ • Vertex AI Search Grounding    │ • Cloud Run Native Direct IAP │
│ • Dual Persona Switcher       │ • Deterministic Tools           │   (--iap --no-invoker-iam)    │
│ • Dynamic Sale Price Slider   │   - Valuation Calculator        │ • Scale-to-Zero Idle (0-3)    │
│ • 1031 Strategy Fork Toggle   │   - 1031 Exchange Detector      │ • Zero SA Keys (ADC / Runtime)│
│ • Mandatory Admin Panel       │   - Exclusion Sentry Filter     │ • Least Privilege IAM         │
└───────────────────────────────┴─────────────────────────────────┴───────────────────────────────┘
```

- **Frontend (`frontend/`)**: React 18 single-page application built with Vite, TypeScript, and Tailwind CSS. Includes bounded `vite:preloadError` retry guard and anti-caching meta tags.
- **Backend (`main.py`)**: Python 3.11 FastAPI backend featuring native Vertex AI integration, cryptographic IAP JWT verification with public key caching (`iap_jwt_middleware.py`), and hardened static SPA router with path-traversal protection.
- **Security & Governance**: Zero hardcoded secrets, DRS org policy compliance (no `domain:google.com` IAM bindings), GLBA technical information barrier, and FINRA Rule 2040 non-fee splitting compliance.

---

## 3. Quickstart & Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Google Cloud SDK (`gcloud`) with ADC configured for live Vertex AI calls:
  ```bash
  gcloud auth application-default login
  ```

### Local Dev Orchestrator
To run both the FastAPI backend and Vite frontend proxy concurrently bound strictly to `127.0.0.1`:
```bash
./run_local.sh
```
- **Frontend SPA**: `http://127.0.0.1:5173`
- **Backend API**: `http://127.0.0.1:8080`
- **Admin Panel**: Click the gear icon on the far right of the top header.
- **Interactive Brand Kit**: `http://127.0.0.1:5173/brand_kit.html`
- **Presenter Demo Script**: `http://127.0.0.1:5173/demo_script.html`

### Manual Verification Commands
- **Backend Import & Boot**:
  ```bash
  source .venv/bin/activate
  uvicorn main:app --host 127.0.0.1 --port 8080
  ```
- **Frontend Compilation & Build**:
  ```bash
  cd frontend && npm run build
  ```
- **Strict Zero-Emoji Rule Verification**:
  ```bash
  ! LC_ALL=C grep -rn '[^ -~	]' frontend/src/ && echo "PASS: STRICT ZERO-EMOJI RULE VERIFIED"
  ```

---

## 4. API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | GET | Diagnostic telemetry (Platform, Model, Project, Service, IAP status). |
| `/api/user` | GET | Authenticated Google / IAP user profile (`developer@google.com` locally). |
| `/api/payoffs` | GET | Inbound commercial servicing queue items with Synthetic Capacity Meter. |
| `/api/entity-resolution` | GET | Gemini 3.7 Flash multimodal document extraction with visual bounding boxes. |
| `/api/valuation` | POST | Deterministic valuation calculator, loan payoff, net proceeds, and yield math. |
| `/api/quarantine` | GET/POST | GLBA Quarantined Consent Gate status check and verbal opt-in toggle. |
| `/api/wire-instructions` | GET | Generates verified First American Title Settlement Wire Instruction data. |
| `/api/wealth-onboarding` | GET | 80% pre-staged KYC/CIP, SEI custodial shell, draft IPS, and quarterly review. |
| `/api/generate` | POST | Native Gemini 3.7 Flash generation with high-fidelity realistic fallbacks. |

---

## 5. Demonstration Walkthrough (The 10-Minute Script)

1. **Step 1 (00:00–01:30) - The Problem & The $4.5B Flight Cliff**: Review the two-sided capacity bottleneck: Commercial discovery drag (~7 hrs) vs. Wealth onboarding/servicing capacity limit (80 accounts).
2. **Step 2 (01:30–03:30) - Book-Scale Monitoring (Pane 1)**: Inspect the Synthetic Capacity Meter (`2,140 screened ▸ 6 qualified & staged`, `~46 hrs manual discovery absorbed`). View Riverfront Commercial Commons at T-12 days.
3. **Step 3 (03:30–06:00) - The Agentic Proof (Pane 2 & Pane 3)**: Click Marcus Vance. Watch Gemini 3.7 Flash decompose `Vance Riverfront Properties IV, LLC` with visual bounding boxes on scanned credit certificates. Resolve unstated contract sale price via trailing NOI ($637.5k) capitalized at 7.50% cap rate grounded via Vertex AI Search. Adjust the **Sale Price Slider** live from $8.5M to $9.0M, dynamically recalculating net proceeds to $3.35M.
4. **Step 4 (06:00–08:30) - The Human Touch & Wealth Capacity Leveraged**: Review Greg Miller's 4-minute call script. Click **[Approve & Deliver Wire Form]**, generating First American Title's wire letter. Toggle to Sarah Jenkins (PWA) to inspect the 80% pre-staged KYC/CIP, SEI shell, and Automated Quarterly Review Dossier that doubles ongoing advisor capacity to 150 accounts.
5. **Step 5 (08:30–09:15) - Institutional Guardrails (CRO Defense)**: Open the slide-out Compliance Drawer to review green audit badges for FINRA Rule 2040, GLBA Quarantined Consent Gate, OCC SR 11-7 Triage Designation, and IRC §1031 Qualified Escrow Safe Harbor.
6. **Step 6 (09:15–10:00) - Financial ROI & CFO Sensitivity**: Slide the Layer B Retention Capture Slider from 5% ($482.5k net ROI, 8.6 mo payback) to 10% ($2.2M net ROI, 4.3 mo payback). Review the componentized $1.25M enterprise run-rate defense.

---

## 6. Cloud Run Production Deployment

To deploy to Google Cloud Run with Direct IAP and Gemini Enterprise Agent Platform:
```bash
./deploy.sh
```

To safely tear down all Cloud Run infrastructure:
```bash
./destroy.sh
```

---
*Huntington Horizon v5.2 — Proving dual-sided agentic capacity leverage: scaling wealth management with existing headcount across both Commercial and Wealth.*
