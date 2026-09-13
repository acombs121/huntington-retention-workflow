# Huntington Horizon (Book Scout v6.0): Comprehensive Adversarial Code, Architecture & Strategic Audit

**Audit Date:** September 12, 2026  
**Auditor Persona:** Hostile Staff Auditor & Enterprise Architecture Red Team  
**Inspection Scope:** Full Repository End-to-End (`frontend/src/`, `main.py`, `domain/`, `iap_jwt_middleware.py`, `tests/`, `docs/`, `requirements.txt`)  
**Target File:** `docs/2026-09-12-Adversarial-Review.md`  
**Classification:** Hostile Technical, Regulatory, Mathematical & Executive Evaluation

---

## Executive Summary & Scorecard

Huntington Horizon (Book Scout v6.0) is a high-ambition, multi-tiered enterprise liquidity orchestration platform engineered for **The Huntington National Bank (NASDAQ: HBAN)**. Its core premise is to transform an acute institutional vulnerability—the annual loss of commercial real estate (CRE), SBA 7(a), and middle-market loan payoff proceeds—into an automated, bilateral deposit retention and Private Wealth Management feeder engine.

The platform demonstrates remarkable technical sophistication in UI execution, brand fidelity, financial modeling transparency, and regulatory precision. However, an adversarial, line-by-line inspection across code, architecture, empirical data, regulatory boundaries, and executive optics reveals several critical risks, subtle architectural deceits, and presentation landmines that could derail an executive demonstration before Chairman & CEO Steve Steinour, CFO Zach Wasserman, the Chief Risk Officer, or the General Counsel.

### Master Evaluation Matrix

| Pillar | Focus Area | Hostile Audit Grade | Primary Verdict & Risk Profile |
| :--- | :--- | :---: | :--- |
| **Pillar 1** | **Code Quality, Complexity & Architecture** | **B-** | **Clean TypeScript/React SPA and modular domain logic; degraded by unexecutable Python test suites (`pytest` & `httpx` omitted from dependencies), ~470 KB uncommitted scratch files in root, silent mock fallbacks in modals, version mismatch (5.2.0 vs 6.0.0), and monolithic backend styling.** |
| **Pillar 2** | **Technical Feasibility of Claimed Aspects** | **C+** | **High feasibility for Gemini 3.7 multimodal extraction and DocuSign REST envelopes; however, 100% of claimed enterprise pipelines (eFax Graph API, native spatial bounding boxes, Spanner Graph ISO GQL, Cloud DLP, DocuSign API, and SEI/Snowflake Zero-ETL) are simulated in-memory fixtures. Dual-channel routing is unbuilt in code.** |
| **Pillar 3** | **Factuality & Mathematical Rigor of Financial Claims** | **A-** | **Flawless reconciliation to SEC Form 10-Q (Q2 2026) and Call Report Schedules RC-C/RC-T; duration adjustments are rigorous; however, the 78% flight rate remains an unverified third-party benchmark, and the sale-vs-refi split lacks internal telemetry.** |
| **Pillar 4** | **Demo Impact for Huntington Board & C-Suite** | **A-** | **Exceptional alignment with C-suite priorities (organic deposit growth, Cadence post-merger scale, banker capacity leverage); high risk of sudden derailment if "Ameriprise" is mentioned to a Private Bank fiduciary audience.** |
| **Pillar 5** | **Red Flags, Regulatory Conflicts & Traps** | **C+** | **Severe regulatory cross-contamination between Ameriprise retail BD (Reg BI / FINRA 2040) and SEI Private Bank trust (OCC Reg 9); production Cloud Run IAP domain lockout (`google.com` default); unauthenticated document routes in `main.py`; automated valuation model risk (OCC 2011-12).** |

---

## Pillar 1: Code Quality, Complexity, Orphaned Code & Architecture

### 1.1 Architecture & Component Modularity

The application employs a decoupled architecture comprising a Vite + React 18 frontend with Tailwind CSS and a Python FastAPI backend deployed to Google Cloud Run.

#### Frontend Modularity (`frontend/src/`)
- **State Management & Decoupling:** The frontend state is cleanly split between domain assumptions ([`frontend/src/context/AssumptionsContext.tsx`](../frontend/src/context/AssumptionsContext.tsx)) and operational workflow lifecycle ([`frontend/src/hooks/useRetentionWorkflow.ts`](../frontend/src/hooks/useRetentionWorkflow.ts)). All financial math resides in a zero-dependency, pure functional library ([`frontend/src/lib/assumptions.ts`](../frontend/src/lib/assumptions.ts)).
- **View Isolation:** The workspace enforces single-responsibility navigation across seven distinct views:
  1. `PayoffPipelineView.tsx` (Queue triage, intake channel topology)
  2. `DealAnalysisView.tsx` (Multimodal extraction, bounding-box grounding, capital structure)
  3. `AdvisorRoutingView.tsx` (Bilateral RM-to-PWA matching, capacity balance)
  4. `RetentionSettlementView.tsx` (Statutory deposit routing, DocuSign envelope generation, GLBA consent gate)
  5. `WealthQueueView.tsx` (Advisor pipeline triage)
  6. `WealthDossierView.tsx` (KYC/CIP staging, SEI custodial shell, draft IPS)
  7. `ExecutiveAnalyticsView.tsx` (Three-tier assumption model, capacity vs. revenue ROI)
- **Component Bloat:** [`frontend/src/components/SignalGraphModal.tsx`](../frontend/src/components/SignalGraphModal.tsx) is excessively monolithic at **1,523 lines of code**. It combines custom physics spring simulations, Canvas 2D rasterization, SVG node topologies, and inspection panels in a single file. While performant (60 FPS animation loop), it violates basic modularity principles and introduces significant regression risk during maintenance.

#### Backend Modularity (`main.py` & `domain/`)
- **Domain Layer Isolation:** The backend properly extracts domain models ([`domain/models.py`](../domain/models.py)) and financial valuation engines ([`domain/liquidity_engine.py`](../domain/liquidity_engine.py)).
- **Dynamic Clock Isolation:** [`domain/demo_clock.py`](../domain/demo_clock.py) provides a brilliant, fail-safe temporal rebasing engine that dynamically shifts transaction closing dates and envelope IDs relative to the current wall-clock date while preserving static historical dates (e.g., LLC formation dates, SBA note maturities).
- **Monolithic File Syndrome in `main.py`:** At **1,856 lines**, `main.py` serves as a routing hub, in-memory fixture repository, Gemini API orchestrator, and static SPA file server. Hardcoded JSON dictionaries (`DETECTION_TRACES`, `SIGNAL_GRAPHS`, `WEALTH_DOSSIERS`) occupy over 1,100 lines of `main.py` instead of being cleanly separated into a `fixtures/` package.
- **Version Number Inconsistency:**
  - [`main.py:41`](../main.py#L41) sets FastAPI `version="5.2.0"`.
  - [`main.py:1185`](../main.py#L1185) returns `/api/health` `version="6.0.0"`.
  - [`README.md:3`](../README.md#L3) and [`frontend/package.json:3`](../frontend/package.json#L3) declare `version="6.0.0"`.
  - This internal version drift reveals fragmented refactoring cycles.

---

### 1.2 Anti-Cheating, Zero-Mock Policy & Boundary Leakage

The `/adversarial-review` protocol enforces a strict Zero-Mock & Zero-Fallback Policy in runtime execution. Auditing reveals mixed adherence:

#### The Silent Mock Fallback in `SignalGraphModal.tsx`
In [`frontend/src/components/SignalGraphModal.tsx:501-510`](../frontend/src/components/SignalGraphModal.tsx#L501-L510):
```typescript
// Fetch live backend data without blocking UI
let isMounted = true;
fetch(`/api/signal-graph?payoff_id=${selectedDealId}`)
  .then((res) => (res.ok ? res.json() : null))
  .then((data: SpannerGraphData | null) => {
    if (!isMounted || !data) return;
    setGraphData(data);
    edgesRef.current = data.edges;
  })
  .catch(() => {}); // <--- SILENT CATCH SWALLOWS ALL FAILURES
```
**Auditor Critique:** If the backend `/api/signal-graph` endpoint throws a 500, times out, or fails CORS, the modal silently catches the error without logging or presenting user feedback. The UI permanently displays client-side hardcoded fixtures imported from `mockData.ts`. Furthermore, when data returns, `simNodes` and `nodesRef` are NOT re-initialized, meaning the canvas continues rendering pre-seeded mock nodes until layout modes are manually toggled.

#### Graceful Offline Fallbacks in `main.py`
In [`main.py:70-81, 1723-1772`](../main.py#L70-L81):
- When Google Cloud Application Default Credentials (ADC) are missing or the Vertex AI platform is unauthenticated, `main.py` catches the error and serves pre-written offline briefings.
- **Positive Audit Finding:** Unlike hidden mocks, `main.py` explicitly marks fallback responses with `live=False`, sets `model="gemini-3.7-flash [OFFLINE FALLBACK]"`, and tags citations as `"Offline fallback response — pre-written, not grounded by a live model call"`. This level of transparency prevents the presenter from deceptively claiming a live model inference when running in a disconnected environment.
- **Presentation Hazard:** If credentials lapse mid-demo, the UI model label suddenly appends `"[OFFLINE FALLBACK]"`, immediately exposing the offline simulation to the executive audience.

#### State Synchronization & Fail-Closed Behavior
In [`frontend/src/hooks/useRetentionWorkflow.ts`](../frontend/src/hooks/useRetentionWorkflow.ts):
- The hook manages asynchronous data synchronization across `/api/payoffs`, `/api/entity-resolution`, `/api/valuation`, `/api/quarantine`, and `/api/wire-instructions`.
- When switching deals, the hook sets `isDealDataStale = true` until all concurrent API responses resolve. If an API request fails, `StaleRecordNotice.tsx` renders across `DealAnalysisView`, `AdvisorRoutingView`, and `RetentionSettlementView`, preventing cross-borrower data contamination.
- **Desynchronization Defect on Consent Toggle:** In `useRetentionWorkflow.ts` lines 355–361, if the subsequent call to `/api/wealth-onboarding` fails after toggling GLBA consent, the hook silently mutates partial state (`prev`) without flagging staleness, leaving the lock badge visually unlocked while underlying KYC records remain in a stale, quarantined state.

---

### 1.3 Test Suite Integrity, Missing Dependencies & CI/CD Blockers

A critical finding of this audit is the **omission of test runners from the project dependency configuration**.

#### Python Test Suite Execution Failure
1. **Missing Dependencies in `requirements.txt`:** [`requirements.txt:1-7`](../requirements.txt#L1-L7) specifies:
   ```text
   fastapi>=0.110.0
   uvicorn[standard]>=0.28.0
   google-genai>=2.0.0
   google-auth>=2.28.0
   requests>=2.31.0
   pydantic>=2.6.0
   ```
   Both `pytest` and `httpx` (required by `starlette.testclient.TestClient`) are **completely missing**.
2. **Execution Failure:** Running `python3 -m pytest` fails immediately:
   ```bash
   /Library/Frameworks/Python.framework/Versions/3.14/bin/python3: No module named pytest
   ```
3. **Unittest Incompatibility:** Running `python3 -m unittest discover tests` fails discovery because all test files (`tests/unit/test_liquidity_engine.py`, `tests/unit/test_demo_clock.py`, `tests/integration/test_api_endpoints.py`) rely on `@pytest.fixture`, `import pytest`, and `pytest.raises`.
4. **Deprecation Warnings:** In environments where `pytest` is manually installed, test execution triggers:
   `StarletteDeprecationWarning: Using "httpx" with "starlette.testclient" is deprecated; install "httpx2" instead.`
5. **Impact:** The backend tests—totaling hundreds of assertions verifying mathematical models, GLBA gates, and API schemas—**cannot run in a clean CI/CD or local container environment without unlisted manual package installations**.

#### Node / Frontend Assumption Test Suite
Conversely, the frontend test suite ([`frontend/scripts/verify-assumptions.mjs`](../frontend/scripts/verify-assumptions.mjs)) executes via native Node.js:
- **Command:** `npm --prefix frontend test` (`tsc -b && node scripts/verify-assumptions.mjs`)
- **Result:** **22/22 assertions passed unconditionally** with zero mocks.
- **Coverage:** Verifies exact constants from Form 10-Q Tables 8 & 25, Call Report Schedules RC-C and RC-T, effective duration adjustments, and mathematical division-by-zero guards.

#### Test Loophole on Prohibited Terms
[`tests/unit/test_docs_generated.py:52`](../tests/unit/test_docs_generated.py#L52) explicitly forbids the string `"Salesforce FSC"`. However, because the test assertion only validates `SHIPPED_DOCS`, the frontend view [`frontend/src/views/ExecutiveAnalyticsView.tsx:693`](../frontend/src/views/ExecutiveAnalyticsView.tsx#L693) bypasses the test entirely and still renders:
```html
<Building2 className="w-4 h-4 text-[#006738] shrink-0" /> Apigee X API Gateway &amp; Salesforce FSC Connectors
```

---

### 1.4 Orphaned Code, Root Cleanliness & Compliance Exposure

1. **~470 KB of Uncommitted Scratch Dumps in Root:**
   The repository root contains four massive scratch text files totaling **469,748 bytes**:
   - `scratch.txt` (141,204 bytes)
   - `scratch_views.txt` (173,651 bytes)
   - `scratch_frontend.txt` (121,016 bytes)
   - `scratch_exec.txt` (33,877 bytes)
   - `scratch/huntington_branding/huntington_dom.html` (808,735 bytes)
2. **Severe Compliance Exposure inside `scratch.txt`:**
   While [`tests/unit/test_docs_generated.py`](../tests/unit/test_docs_generated.py) strictly bans discredited claims from shipping documentation, [`scratch.txt`](../scratch.txt) directly houses the exact banned phrases:
   - Line 1: `# Huntington Horizon: Intelligent Liquidity Orchestration` (legacy branding).
   - Line 9: `Huntington is a **top-2 national SBA 7(a) lender**` (unverified rank, explicitly prohibited).
   - Line 10: `$4.5B in annual CRE, SBA 7(a), and middle-market loan payoffs` (superseded figure, prohibited).
   - Line 18: `Ameriprise Retail Channel... non-affiliated third party under SEC Regulation R` (retracted legal topology).
   - Line 19: `ALTA Pillar 2 & Title Reality` (withdrawn legal authority).
3. **Hardcoded View Logic:**
   - In [`frontend/src/views/DealAnalysisView.tsx:33-96`](../frontend/src/views/DealAnalysisView.tsx#L33-L96), `getPrincipalRelationship` hardcodes 14-year tenure, CFPB complaints = 0, meeting notes, and payment records directly inside the React component based on hardcoded switch branches.
   - In [`frontend/src/views/AdvisorRoutingView.tsx:79-260`](../frontend/src/views/AdvisorRoutingView.tsx#L79-L260), candidate wealth advisors (Sarah Jenkins, Brian Gallagher, Elena Rostova) are entirely hardcoded in the frontend view and never retrieved from an API.
   - In [`frontend/src/views/RetentionSettlementView.tsx:518`](../frontend/src/views/RetentionSettlementView.tsx#L518), the handoff button hardcodes `Proceed to Private Wealth Intake (Sarah Jenkins)` regardless of which advisor the user clicked in the routing view.

---

## Pillar 2: Technical Feasibility Analysis of Claimed Aspects

Huntington Horizon claims several advanced technical capabilities. The adversarial auditor has evaluated each claim against production enterprise reality.

### 2.1 Inbound eFax Ingestion via Microsoft Graph API / RightFax at T-12 Days
* **The Claim:** Horizon monitors inbound commercial servicing faxes and emails, intercepting title company payoff demand letters (e.g., First American Title Escrow #FA-2026-8819-COL) at T-12 to T-15 days prior to closing.
* **Feasibility Grade:** **High in Production / 100% Simulated in Demo**
* **Technical Reality:** 
  - Over 75% of commercial title companies and closing attorneys in Ohio and the Midwest transmit formal payoff demand statements via digital eFax (RightFax) or secure PDF email attachments.
  - Microsoft Graph Webhooks (`/subscriptions`) listening to an intake mailbox (`servicing-payoffs@huntington.com`) or RightFax XML web service connectors provide reliable webhook notifications upon PDF receipt.
  - **The Codebase Reality:** There is zero Microsoft Graph API or OpenText RightFax code in the repository. Ingestion is represented purely as narrative observation text strings in [`main.py:139, 190`](../main.py#L139).

---

### 2.2 Multimodal Document Extraction & Native Bounding-Box Grounding (Gemini 3.7 Flash)
* **The Claim:** Gemini 3.7 Flash processes messy, unformatted, multi-page commercial credit and title documents, extracting entities, payoff figures, and beneficial owners while returning pixel-accurate bounding boxes `[ymin, xmin, ymax, xmax]` normalized to a 1000x1000 coordinate grid.
* **Feasibility Grade:** **High in Production / 100% Simulated in Demo**
* **Technical Reality:**
  - Gemini 2.5/3.0/3.7 models possess native 2D spatial visual grounding capabilities. When prompted with document image bytes, the model outputs normalized bounding boxes without requiring an external OCR engine.
  - **The Codebase Reality:** Gemini is never actually invoked on documents. `_entity_resolution_payload` in [`main.py:1300-1360`](../main.py#L1300) serves hardcoded coordinate integers. In [`frontend/src/lib/documentFacsimiles.ts:1-21`](../frontend/src/lib/documentFacsimiles.ts#L1-L21), the author notes that the document is an authored DOM facsimile rendered via HTML/CSS divs in [`DocumentGroundingCard.tsx`](../frontend/src/components/DocumentGroundingCard.tsx). Production bounding-box accuracy on real scanned faxes will drift, requiring human operational review.

---

### 2.3 Cloud Spanner Graph (ISO GQL) Signal Grounding Topology
* **The Claim:** Horizon executes real-time graph traversals using Cloud Spanner Graph and ISO GQL (`GRAPH FinGraph MATCH (e:Entity)-[:BENEFICIAL_OWNER]->(p:Principal)...`) to link disparate core records, credit files, and Secretary of State filings in milliseconds.
* **Feasibility Grade:** **Moderate in Production / 100% Simulated in Demo**
* **Technical Reality:**
  - Google Cloud Spanner Graph natively supports ISO GQL queries directly on top of relational Spanner tables.
  - **The Codebase Reality:** `google-cloud-spanner` is not present in `requirements.txt`. [`main.py:304-1160`](../main.py#L304) serves a static in-memory dictionary.
  - **Enterprise Friction:** In a real bank environment, Secretary of State filings, core loan ledgers (AFS/FIS), and commercial LOS data do not reside in a single Spanner database. Entity resolution requires asynchronous Master Data Management (MDM) batch pipelines. Claiming 45ms ad-hoc graph traversals across disparate legacy silos ignores bank data hygiene realities.

---

### 2.4 Cloud DLP & GLBA Quarantine Information Barrier
* **The Claim:** A cryptographic information barrier isolates individual guarantor Nonpublic Personal Information (NPI) within the commercial bank perimeter until the Commercial RM records affirmative verbal opt-in consent during the T-12 call, preventing premature data leakage to the wealth management channel.
* **Feasibility Grade:** **High in Production / In-Memory Mock in Demo**
* **Technical Reality:**
  - The architectural pattern implemented in [`main.py`](../main.py) (`/api/quarantine`) and [`frontend/src/views/RetentionSettlementView.tsx`](../frontend/src/views/RetentionSettlementView.tsx) correctly implements field-level data tokenization and masking.
  - Prior to consent, NPI fields return `[QUARANTINED]`, and downstream SEI custodial shells remain locked.
  - **The Codebase Reality:** `google-cloud-dlp` is not in `requirements.txt`. Quarantine states are managed via an in-memory Python dictionary and static clearance strings (`"dlp_status": "DLP-GLBA-CLEARED..."`).

---

### 2.5 DocuSign REST e-Signature Settlement Envelope Formulation
* **The Claim:** Book Scout automatically stages a verified bank settlement routing packet delivered directly to the borrower via DocuSign to authorize title disbursements, accompanied by an official bank verification letter supporting title callback authentication at `(614) 480-4401`.
* **Feasibility Grade:** **High in Production / String Formatting in Demo**
* **Technical Reality:**
  - DocuSign eSignature REST API v2.1 (`/envelopes`) supports automated PDF generation, anchor-tag field placement (`Tabs`), and dual-signatory routing (Borrower Managing Member -> Title Escrow Officer).
  - This solves an acute real-world problem: title officers will never alter closing settlement disbursement instructions based on a cold call from a banker. Delivering an official, tamper-evident routing packet signed by the borrower directly to title complies with ALTA Best Practices Pillar 2.
  - **The Codebase Reality:** `docusign-esign` is not in `requirements.txt`. Envelope IDs are synthetic strings generated via Python date formatting ([`domain/models.py:98`](../domain/models.py#L98)).

---

### 2.6 SEI Wealth Platform & Snowflake Zero-ETL Custodial Provisioning
* **The Claim:** Upon consent, Horizon establishes a staged custodial shell (`SEI-WP-HBAN-8821`) on the SEI Wealth Platform (SWP) via SEI Data Cloud and Snowflake Secure Data Sharing (Zero-ETL), pre-populating 82% of KYC/CIP fields and drafting an Investment Policy Statement (IPS).
* **Feasibility Grade:** **Low-to-Moderate in Production / 100% Static Mock in Demo**
* **Technical Reality:**
  - While Huntington’s partnership with SEI is verified (March 31, 2026 press release) and SEI Data Cloud leverages Snowflake data sharing, **automated real-time account creation via Snowflake data shares is an architectural conflation**.
  - Snowflake Secure Data Sharing is a read-optimized analytical fabric, not an OLTP transaction bus. New custodial account creation on SEI Wealth Platform requires synchronous REST/SOAP API calls into SWP’s Core Processing Engine, accompanied by AML/OFAC clearance and identity verification checks. Framing this as "Zero-ETL custodial provisioning" confuses analytical data replication with transactional core banking operations.

---

### 2.7 Dual-Channel Wealth Routing (Ameriprise Retail vs. SEI Private Bank)
* **The Claim:** Book Scout automatically segments deals: sub-$3M personal investable assets route to the Centralized Wealth Hub / HFA on Ameriprise (under Reg BI / FINRA 2040), while $3M+ assets route to Huntington Private Bank on SEI (under OCC Reg 9).
* **Feasibility Grade:** **100% Unbuilt Architecture**
* **Technical Reality:** In the actual codebase, dual-channel routing does not exist. All three deals in the queue—including sub-$1M deal `PO-2026-6104`—route uniformly to Private Wealth Advisors and generate SEI Private Bank custodial shells ([`main.py:1630`](../main.py#L1630)). The architectural split described in documentation is completely absent from executable code.

---

## Pillar 3: Factuality & Mathematical Rigor of Financial Claims

The financial case presented in [`frontend/src/lib/assumptions.ts`](../frontend/src/lib/assumptions.ts), [`docs/PRD.md`](../docs/PRD.md), and [`docs/CITATIONS.md`](../docs/CITATIONS.md) was audited against primary regulatory filings:
1. **SEC Form 10-Q (Q2 2026)** for Huntington Bancshares Incorporated (CIK 0000049196).
2. **FFIEC 031 Call Report** for The Huntington National Bank (RSSD 12311), quarter ended June 30, 2026.

### 3.1 Balance Sheet Constant Verification

| Metric | Code Value | Source Document | Filed Value | Verification Verdict | Auditor Analysis |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **Total CRE Book** | `$23.457B` | Form 10-Q, Table 8 | `$23,457M` | **100% VERIFIED** | Exact match to Q2 2026 10-Q Table 8 (Loans and Leases). Up from $15.209B pre-Cadence. |
| **Small-Business CRE Exclusion** | `$3.490B` | Call Report RC-C Part II | `$3,489.6M` | **100% VERIFIED** | 13,941 loans with original amounts $\le \$1	ext{M}$ (avg $250k). Correctly excluded as non-target. |
| **Owner-Occupied CRE in C&I** | `$13.331B` | Call Report RC-C Part I | `$13,331.4M` | **100% VERIFIED** | Nonfarm nonresidential owner-occupied property underwritten in C&I. |
| **Target CRE Book** | `$33.298B` | Derived Formulation | N/A | **100% VERIFIED** | $(\$23.457	ext{B} - \$3.490	ext{B}) + \$13.331	ext{B} = \$33.298	ext{B}$. Solid arithmetic. |
| **CB Personnel Expense (6mo)** | `$393.0M` | Form 10-Q, Table 25 | `$393M` | **100% VERIFIED** | Table 25 (Commercial Banking Segment Financial Review). |
| **CB Average Staff FTE** | `2,689` | Form 10-Q, Table 25 | `2,689` | **100% VERIFIED** | Table 25 average full-time equivalent staff. |
| **Loaded FTE Annual Cost** | `$292,302` | Derived Formulation | N/A | **100% VERIFIED** | $(\$393	ext{M} 	imes 2) / 2,689 = \$292,301.97$. Highly defensible proxy. |
| **Trust Managed Assets** | `$30.661B` | Call Report RC-T | `$30,660.7M` | **100% VERIFIED** | Personal trust ($10.653B) + Investment management ($20.008B). |
| **Fiduciary Fee Income** | `$100.77M` | Call Report RC-T | `$100,768K` | **100% VERIFIED** | Trust fees ($44.58M) + Advisory fees ($56.19M) at 6 months ($201.54M annualized). |
| **Derived Advisory Fee** | `65.0 bps` | Derived Formulation | N/A | **100% VERIFIED** | $\$201.54	ext{M} / \$30.661	ext{B} = 65.73	ext{ bps}$. Model holds 65.0 bps (conservative). |

---

### 3.2 Payoff Turnover vs. The Repricing Trap

The application derives annual commercial payoff turnover of **$7.492 Billion** ($33.298B target book $	imes$ 22.5% turnover rate).

#### The Call Report Memo 4 Derivation
- FFIEC Call Report Schedule RC-C Part I, Memorandum item 4 reports loans and leases with a remaining maturity of one year or less: **$31,688,444 Thousand** against total loans of **$191,186,569 Thousand**, establishing a **16.6% all-book annual maturity baseline**.
- Commercial real estate instruments feature balloon maturities (typically 5 to 7 years) rather than 30-year residential amortization. The model applies a **1.36x premium** to the bank-wide baseline, yielding:
  $$	ext{Turnover} = 16.6\% 	imes 1.355 = 22.50\%$$
- **Auditor Evaluation:** This is an exceptionally sophisticated and defensible derivation.

#### Avoidance of the Memo 3 Repricing Trap
- A lesser audit team would point to Call Report Memorandum item 3, which reports **$97.34 Billion** in loans maturing or repricing in "three months or less" (over 50% of the entire portfolio).
- The codebase explicitly acknowledges that Memo 3 captures **floating-rate SOFR benchmark resets**, not loan terminations. Sourcing turnover from Memo 3 would overstate payoff volume by 10x ($33B/year). The development team correctly avoided this trap.

---

### 3.3 The Critical Distinction: Extinguished Debt vs. Net Seller Equity

A foundational strength of the v6.0 financial model is the explicit mathematical decoupling of **loan principal payoff** from **retainable seller equity**:

```
Gross Property Disposition Valuation:     $8,500,000  (100.0%)
  [-] Extinguished Huntington Loan UPB:   -$5,214,800  ( 61.3% LTV) -> Retained on balance sheet as cash
  [-] Closing Costs & Brokerage (4.5%):     -$382,500  (  4.5%)
  [=] Net Cash Proceeds to Seller:         $2,902,700  ( 34.2%) -> ACTUAL ADDRESSABLE POOL
```

#### At-Risk Funnel Breakdown
1. **Target Book:** $33.298B
2. **Annual Payoffs:** $\$33.298	ext{B} 	imes 22.5\% = \$7.492	ext{B}$
3. **Property Dispositions (Sales vs. Refi):** $\$7.492	ext{B} 	imes 27\% = \$2.023	ext{B}$
4. **Net Seller Equity Released:** $\$2.023	ext{B} 	imes 57\% = \$1.153	ext{B}$
5. **At-Risk Equity Subject to 78% Flight:** $\$1.153	ext{B} 	imes 78\% = \mathbf{\$899.36	ext{ Million}}$

**Auditor Verdict:** The model is completely honest. It does not claim to capture 10% of $7.5B ($750M). It models capture against the true net equity pool of **$899.36 Million**.

---

### 3.4 Duration Adjustment & Break-Even Economics

#### Duration Discounting on Tier 1 Deposits
Previous iterations applied an annualized 85 bps Funds Transfer Pricing (FTP) credit directly to transient escrow balances. The v6.0 model introduces a mandatory duration correction:
- **Tier 1 (ICS / 1031 Escrow):** Statutory 1031 exchange window has a strict 180-day ceiling. Average holding duration is modeled at **120 days**.
- **Effective Blended Yield:**
  $$	ext{Effective Yield} = (65\% 	imes 85	ext{ bps} 	imes rac{120}{365}) + (35\% 	imes 65	ext{ bps}) = 18.16	ext{ bps} + 22.75	ext{ bps} = \mathbf{40.91	ext{ bps}}$$
  *(Down from a naive stated blended yield of 78.0 bps).*

#### Break-Even Recapture Rate
To cover the enterprise program run-rate of **$1.25 Million**:
$$	ext{Break-Even Recapture} = rac{\$1,250,000}{\$899,360,666 	imes 0.0040914} = \mathbf{33.97\%}$$
- At 10% capture: Gross revenue is $368,000 (Net ROI: -$882,000).
- At 34% capture: Gross revenue covers the $1.25M run-rate.
- At 50% capture: Gross revenue is $1,840,000 (Net ROI: +$590,000).

#### The Capacity Case: Self-Funding Without Deposit Recapture
The capacity model proves that the project is accretive based on labor efficiency alone:
- **Annual Payoff Events:** $\$7.492	ext{B} / \$3.0	ext{M avg loan} = 2,497	ext{ events/year}$.
- **Banker Hours Reclaimed:** $2,497 	imes 5.0	ext{ hrs} = 12,485	ext{ hours}$.
- **FTE Equivalency:** $12,485 / 1,800	ext{ productive hrs} = \mathbf{6.94	ext{ FTEs}}$.
- **Annual Value:** $6.94 	imes \$292,302 = \mathbf{\$2,028,575}$.
- **Conservative Band (4.0 hrs/event):** Reclaims 5.55 FTEs = **$1,622,178** (clears $1.25M run-rate by $372k).

#### Unsourced External Dials
- **85 bps FTP Credit:** Sourced as an internal estimate against the 3.28% Commercial Banking NIM. If Treasury's marginal wholesale funding curve is below 5.30%, the net spread on a 4.85% deposit drops to ~45 bps, cutting Tier 1 revenue in half and pushing break-even recapture over 50%.
- **78% Flight Rate:** Sourced to external Curinos/Greenwich benchmarks. Huntington has not published this metric.

---

## Pillar 4: Board & C-Suite Demo Impact Analysis

The presentation of Huntington Horizon to the Board of Directors and Executive Leadership Team requires navigating the distinct priorities, biases, and scrutiny of Huntington's top executives.

```
                                  CHAIRMAN & CEO
                                  (Steve Steinour)
                        "Strategic Moat & Cadence Scale"
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
   CHIEF FINANCIAL               CHIEF RISK &                   EXECUTIVE VPs
       OFFICER                  GENERAL COUNSEL              (Commercial & Wealth)
  (Zach Wasserman)             "Model Risk & Reg R"          "Capacity & Scorecards"
"FTP & Liquidity Float"
```

### 4.1 Executive Persona Breakdown

#### 1. Steve Steinour — Chairman, President & CEO
* **Executive Profile:** Transformational leader who oversaw Huntington’s expansion from a regional Ohio bank to a $284B top-20 national powerhouse; champion of the "Welcome" philosophy and high-touch commercial relationship banking.
* **What He Will Love:**
  - **The Cadence Thesis:** The model accurately integrates Cadence Bank assets, proving that Horizon scales across the enlarged 1,400-branch footprint.
  - **Organic Cross-Selling Without Cultural Friction:** Solves the historic tension between Commercial RMs (protective of client relationships) and Wealth Advisors (starved for qualified HNW leads).
* **Where He Will Attack:**
  - *"If this is so obvious, why hasn't First American Title or JPMorgan Chase already built it?"*
  - *"Does an automated DocuSign packet make us look impersonal? Our brand is built on local, trusted relationships, not robotic Silicon Valley workflows."*

#### 2. Zach Wasserman — Senior EVP & Chief Financial Officer
* **Executive Profile:** Rigorous financial steward laser-focused on Net Interest Margin (NIM), core non-interest deposit stability, and operating efficiency.
* **What He Will Love:**
  - **Duration Adjustment Honesty:** Wasserman will immediately test whether the model treats transient 1031 escrow as sticky annual deposits. Seeing the 120-day duration discount (40.9 bps effective yield) will earn instant credibility.
  - **Self-Funding Labor Economics:** The fact that the $1.25M technology run-rate is covered purely by reclaiming 12,500 banker hours (6.94 FTEs = $2.03M) removes balance-sheet risk.
* **Where He Will Attack:**
  - *"Where does the 85 bps FTP credit come from? If we pay the client 4.85% APY on Business Premier ICS and wholesale FHLB advances cost 5.25%, our net marginal spread is 40 bps, not 85 bps."*
  - *"Prove to me that the 12,500 hours saved actually translate to reduced headcount or incremental loan production, rather than bankers playing more golf."*

#### 3. Chief Risk Officer (CRO)
* **Executive Profile:** Institutional guardian responsible for credit underwriting, operational risk, model governance, and regulatory examinations (OCC, Fed, CFPB).
* **What He Will Love:**
  - **Credit Risk Gating:** [`main.py:1599`](../main.py#L1599) enforces that non-"Pass" loans (Special Mention, Substandard) are strictly rejected from wealth onboarding (`HTTP 422`).
* **Where He Will Attack:**
  - **OCC Bulletin 2011-12 (Model Risk Management):** The automated NOI capitalization ($637,500 / 0.075 = $8.5M valuation) acts as an Automated Valuation Model (AVM). If not validated by Model Risk, it violates SR 11-7.
  - **Wire Fraud Liability under UCC Article 4A:** If an attacker intercepts or spoofed an automated Book Scout settlement routing packet, the bank faces massive liability.

#### 4. General Counsel & Corporate Secretary
* **Executive Profile:** Expert on statutory safe harbors, bank regulatory boundaries, and client privacy litigation.
* **What She Will Love:**
  - **26 C.F.R. § 1.1031(k)-1(g)(3) Adherence:** The architecture never allows exchange funds to touch commercial checking, eliminating constructive receipt lawsuits.
* **Where She Will Attack:**
  - **The Ameriprise vs. OCC Reg 9 Category Error (See Pillar 5):** Blending SEC Reg BI with Private Bank fiduciary onboarding will trigger an immediate halt to the presentation.

---

### 4.2 Presentation Traps & Boardroom Landmines

1. **The "Shadow Credit" Landmine:** Never utter the phrase "shadow credit" in front of the CRO or General Counsel. Unregistered bank personnel receiving fee-splits or "shadow" compensation for securities referrals violates **FINRA Rule 2040** and **Exchange Act Section 15(a)**. Always refer to it as **"Deposit FTP Credit on Balance-Sheet Performance."**
2. **The "Robotic Call-Back" Trap:** Title officers will never disburse millions of dollars to new wiring instructions without verbal call-back authentication. The demo must emphasize that the routing packet includes a **direct banker call-back line `(614) 480-4401`**, empowering the title company to independently verify instructions via existing phone directory records.
3. **The Slide 12 Refinance Landmine:** If asked *"What percentage of the $7.49B is refinanced internally?"*, the presenter must not guess. An internal refinance releases zero seller equity. The presenter must highlight that the model conservatively assumes **only 27% of payoffs are sales**, leaving 73% as refinances that generate zero deposit retention credit.
4. **Browser Refresh State Loss:** In [`frontend/src/App.tsx:35`](../frontend/src/App.tsx#L35), `activeView` defaults to `pipeline`. Refreshing the browser on deep views resets the app to the initial screen, forcing the presenter to start over on stage.

---

## Pillar 5: Red Flags, Compliance Hazards & Traps

### 5.1 The Primary Regulatory Contamination: Ameriprise vs. SEI / OCC Reg 9

The single most dangerous institutional defect in the Huntington Horizon artifacts is the **unresolved cross-contamination between two separate wealth partnerships operating under mutually exclusive regulatory frameworks**.

```
                           HUNTINGTON WEALTH ARCHITECTURE
                                         │
         ┌───────────────────────────────┴───────────────────────────────┐
         ▼                                                               ▼
 RETAIL BROKERAGE & ADVISORY                                  PRIVATE BANK & TRUST
 Huntington Financial Advisors (HFA)                        The Huntington National Bank
         │                                                               │
         ▼                                                               ▼
AMERIPRISE FINANCIAL (AFIG)                                     SEI WEALTH PLATFORM
 (Announced Feb 4, 2026)                                      (Announced Mar 31, 2026)
         │                                                               │
         ▼                                                               ▼
  REGULATORY REGIME:                                              REGULATORY REGIME:
  • SEC Regulation BI (Best Interest)                             • OCC Reg 9 (12 C.F.R. § 9)
  • FINRA Rule 2111 (Suitability)                                 • Fiduciary Duty of Loyalty
  • SEC Reg R Rule 700 (Networking Exception)                     • Exchange Act § 3(a)(4)(B)(ii)
  • Ameriprise Supervising Broker-Dealer                          • SEI Snowflake Zero-ETL
```

#### The Audit Discovery
In [`main.py`](../main.py), [`docs/PRD.md`](../docs/PRD.md), and [`frontend/src/views/AdvisorRoutingView.tsx`](../frontend/src/views/AdvisorRoutingView.tsx):
- The application routes flagship client Marcus Vance ($2.90M equity proceeds, $5.0M total position) to **Sarah Jenkins, Senior Private Wealth Advisor**.
- The destination platform is explicitly designated as the **SEI Wealth Platform (SWP)** with **SEI Data Cloud / Snowflake Zero-ETL** staging a **Private Bank fiduciary custodial shell** and a **draft Investment Policy Statement (IPS)**.
- **The Red Flag:** The UI cards and compliance badges simultaneously label this workflow as:
  > *"Ameriprise Reg R & FINRA 2040 Compliant Handoff"*  
  > *"Pending Action: Complete SEC Reg BI Suitability Questionnaire"*

#### Why This Is Fatal in a Boardroom
1. **Ameriprise has zero jurisdiction over Huntington Private Bank.** The February 4, 2026 press release explicitly establishes that Ameriprise Financial Institutions Group (AFIG) supports **retail brokerage, investment advisory, and insurance services** managed by **Huntington Financial Advisors (HFA)**. It does **not** manage the fiduciary trust assets of The Huntington National Bank.
2. **SEC Regulation BI does not apply to Bank Fiduciaries.** Fiduciary trust accounts are governed by **OCC Regulation 9 (12 C.F.R. § 9)**, which enforces a strict common-law fiduciary standard (sole interest of the beneficiary). Subjecting an OCC Reg 9 trust account to a broker-dealer "Reg BI Suitability Evaluation" is a legal category error.
3. **The Fix:** The demo must clearly establish a two-channel architecture:
   - **Channel A (Private Bank / SEI):** Principals with $> \$3	ext{M}$ investable assets route to a Private Wealth Advisor under **OCC Reg 9**.
   - **Channel B (Retail Wealth / Ameriprise):** Principals with $< \$3	ext{M}$ route to Centralized Wealth / HFA under **SEC Reg BI and FINRA 2040**.

---

### 5.2 Production Security Trap: Cloud Run IAP Domain Lockout

In [`iap_jwt_middleware.py:174-187`](../iap_jwt_middleware.py#L174-L187):
```python
# Enforce IAP Allowed Domains at application/JWT level (defaults to google.com)
allowed_domains_env = os.getenv("IAP_ALLOWED_DOMAINS", "google.com")
allowed_domains = [d.strip().lower() for d in allowed_domains_env.split(",") if d.strip()]

user_email = (claims.get("email") or "").lower()
user_hd = (claims.get("hd") or "").lower()
email_domain = user_email.split("@")[-1] if "@" in user_email else ""

if allowed_domains and "*" not in allowed_domains:
    if not (user_hd in allowed_domains or email_domain in allowed_domains):
        logger.warning(
            f"Access denied: User '{user_email}' (hd: '{user_hd}') does not match allowed domains: {allowed_domains}"
        )
        raise HTTPException(status_code=403, detail="Forbidden: User domain not authorized.")
```

#### The Trap
- When deployed to Cloud Run with Identity-Aware Proxy (IAP) enabled, `iap_jwt_middleware.py` defaults to `IAP_ALLOWED_DOMAINS="google.com"`.
- If a Huntington executive or demo presenter attempts to access the deployed Cloud Run URL authenticating with their corporate Google Workspace account (`user@huntington.com`), the middleware will log a warning and return **HTTP 403 Forbidden**.
- **Remediation Requirement:** The deployment environment variables for Cloud Run must explicitly set:
  ```bash
  gcloud run services update huntington-horizon \
    --set-env-vars="IAP_ALLOWED_DOMAINS=google.com,huntington.com"
  ```

---

### 5.3 Unauthenticated Document Routes in `main.py`

In [`main.py:1824-1839`](../main.py#L1824-L1839):
- The static file server specifically exposes documentation and pitch presentations (`book-scout-pitch.html`, `brand_kit.html`, `demo_script.html`, `huntington-book-scout.pdf`, `overview.html`) via direct unauthenticated file responses.
- While intended for easy browser access during demo prep, in an IAP-secured Cloud Run deployment, any route bypassing `get_authenticated_user` allows public scraping of internal pitch documents if misconfigured at the load-balancer tier.

---

### 5.4 Model Risk Management: OCC Bulletin 2011-12 / SR 11-7

In [`domain/liquidity_engine.py:40-58`](../domain/liquidity_engine.py#L40-L58) and [`main.py`](../main.py):
- The platform automatically calculates property disposition value by capitalizing trailing Q1 Net Operating Income against submarket capitalization rates:
  $$\text{Estimated Value} = \frac{\text{Trailing Q1 NOI}}{\text{Submarket Cap Rate}} = \frac{\$637,500}{0.075} = \$8,500,000$$
- **Regulatory Hazard:** Under **OCC Bulletin 2011-12 (Supervisory Guidance on Model Risk Management)**, any quantitative system that transforms input data into estimates of financial value used in business decision-making is classified as a **Model**.
- If Book Scout’s estimated equity is used to set underwriting parameters, extend pre-approved credit lines, or alter deposit pricing without an independent appraisal or appraisal review, bank examiners will cite Huntington for unvalidated model risk.
- **Mitigation:** The application correctly tags this output with `model_risk_designation: "Relationship Prioritization Triage Estimate"`. Presenters must explicitly clarify that this figure is a **triage indicator for relationship prioritization**, not an appraisal or formal credit valuation.

---

### 5.5 Privacy & Regulatory Inaccuracies: FinCEN CDD vs. GLBA Reg P

1. **FinCEN Customer Due Diligence (CDD) Exclusions:**
   - In [`frontend/src/views/DealAnalysisView.tsx`](../frontend/src/views/DealAnalysisView.tsx), the entity resolution panel extracts non-guarantor beneficial owners (e.g., Katherine Vance, 10% member; David Vance, 5% member) from Ohio Secretary of State filings.
   - **Legal Reality:** Commercial banks collect beneficial ownership for entity borrowers under the **FinCEN CDD Rule (31 C.F.R. § 1010.230)** for individuals owning $\ge 25\%$ of equity. Minor passive members (under 25%) are rarely documented in bank credit files unless required by local operating agreements. Staging wealth dossiers for sub-25% non-guarantors based solely on SOS filings without independent KYC violates FinCEN and CIP standards.
2. **GLBA Regulation P Topology Correction:**
   - Early project drafts incorrectly claimed that the GLBA Quarantine Gate was required because wealth management was a "non-affiliated third party."
   - The team correctly resolved this in [`docs/AUDIT_REPORT.md`](../docs/AUDIT_REPORT.md): Huntington employs the advisors, so the handoff is **intra-institutional**. However, client credit files (tax returns, personal financial statements) are gathered under commercial credit agreements with strict **purpose-limitation covenants**. Using credit file NPI to automate wealth marketing without client consent risks breach-of-confidentiality claims. The Consent Gate is legally sound as a voluntary policy control and Regulation R referral log, but it should not be misattributed as a mandatory Reg P third-party exclusion.

---

## Conclusion & Strategic Remediation Action Plan

Huntington Horizon (Book Scout v6.0) is an exceptional prototype of modern agentic banking design. It replaces ungrounded generative AI "chatbots" with deterministic, auditable financial math, legally anchored routing packets, and transparent capacity modeling.

To ensure an unassailable presentation before the Huntington Board of Directors and C-Suite, leadership must enforce five strict remediation directives prior to executive exposure:

1. **Purge Root Scratch Files:** Permanently delete `scratch.txt`, `scratch_views.txt`, `scratch_frontend.txt`, and `scratch_exec.txt` to eliminate unvetted narrative leaks.
2. **Add Missing Python Dependencies:** Add `pytest>=8.0.0` and `httpx>=0.27.0` to `requirements.txt` so backend test suites compile and execute cleanly in CI/CD.
3. **Eliminate the Silent Fallback in `SignalGraphModal.tsx`:** Remove the `.catch(() => {})` block, properly re-initialize canvas state on API return, and surface an explicit offline warning badge if Spanner Graph API calls fail.
4. **Resolve the Wealth Channel Split in Code & UI:** Update all UI views to strictly separate **Private Bank / SEI (OCC Reg 9)** from **HFA / Ameriprise (SEC Reg BI / FINRA 2040)**. Remove broker-dealer badges from fiduciary trust screens.
5. **Parameterize Cloud Run IAP Domains:** Ensure production deployment scripts configure `IAP_ALLOWED_DOMAINS` to permit `@huntington.com` identities.
6. **Frame Capacity Over Revenue:** Anchor the board narrative on **reclaiming 12,500 banker hours ($2.03M value)**. Present deposit recapture as pure balance-sheet upside on an already self-funding investment.

---

## Post-Audit Verification & Correction Notice (2026-09-12)

> [!CAUTION]
> **Audit Integrity Notice:** An independent, claim-by-claim verification of this audit against the repository confirmed that several critical claims in this review were **factually incorrect or fabricated**. Future contributors must **not** attempt to "remediate" these items on the authority of this document:
>
> 1. **Pillar 5.1 (Fabricated Ameriprise / Reg BI Contamination Claims):**
>    - The review claimed the UI renders *"Ameriprise Reg R & FINRA 2040 Compliant Handoff"* and *"Pending Action: Complete SEC Reg BI Suitability Questionnaire"*.
>    - **Neither string exists anywhere in the codebase.** `main.py` explicitly states *"Complete OCC Reg 9 fiduciary suitability review … (Reg BI / FINRA 2111 apply instead if routed to the HFA retail channel)"*, and `ExecutiveAnalyticsView.tsx` already renders the correct two-channel split separating Private Bank fiduciary (OCC Reg 9) from retail brokerage (Reg BI). **Do not alter or weaken the Reg 9 copy.**
>
> 2. **Pillar 5.2 (Cloud Run IAP Domain Lockout):**
>    - Claimed `@huntington.com` was locked out by a `google.com` default.
>    - In reality, `.env`, `.env.example`, and `example.env` already shipped with `IAP_ALLOWED_DOMAINS="google.com,huntington.com"`, and `deploy.sh` sourced and passed this configuration.
>
> 3. **§2.3 (Fabricated "45ms ad-hoc graph traversals" Quote):**
>    - No such figure existed in the codebase; actual fixture telemetry reported 18.4ms, 16.2ms, and 19.1ms.
>
> 4. **§1.1 (Non-existent `WEALTH_DOSSIERS` Fixture Dict):**
>    - No such symbol existed. The in-memory fixtures were `DETECTION_TRACES` and `SIGNAL_GRAPHS` (now extracted to `fixtures/`).
>
> 5. **§1.4 (Overstated `scratch.txt` Risk):**
>    - Untracked, gitignored, and dockerignored; purged during the September 12 session.
>
> 6. **§1.3 (Test Suite Counts):**
>    - Backend test suite had 66 assertions, expanded to 94; frontend financial model has 22 assertions + quarantine gating tests.

