# Huntington Horizon: Intelligent Liquidity Orchestration
## Prototype Specification & Executive Demonstration Blueprint (v5.2)
**Document Version:** 5.2 (Dual-Sided Capacity Leverage & Enterprise GCP Agentic Blueprint)  
**Target Audience:** Executive Committee Review, Huntington Bancshares Incorporated (HBAN)  
**Status:** Working Prototype & Demonstration Specification (Concept Evaluation)  
**Effective Date:** September 2026  
**Classification:** Internal Bank Working Document — For Evaluation Purposes Only  

---
### Document Overview
This document specifies the working software prototype and demonstration narrative for **Huntington Horizon**. It focuses strictly on what is built and demonstrated in a 10-minute executive briefing, to prove a single core thesis: **can an intelligent agent let Huntington scale its wealth management franchise with existing headcount — by monitoring a book no human team could cover, absorbing the manual discovery across Commercial, eliminating onboarding and ongoing servicing friction across Wealth, and safeguarding both taxable cash-out and IRC §1031 exchange liquidity?**

The secondary proof is financial: that this capacity leverage converts directly into retained deposits, escrow custody, and AUM.

---
## 1. Executive Summary & The Problem
### 1.1 The Core Pain: A Capacity Problem Across the Entire Relationship Lifecycle
Huntington cannot scale wealth management by asking bankers to work harder. The constraint is **human capacity against an un-monitorable book — spanning the entire relationship handoff and lifecycle**:
* **The Book-Scale Visibility Gap:** Huntington's commercial book generates **$4.5B in annual CRE and middle-market loan payoffs**. Each payoff is a potential wealth event — and **no human team can manually monitor thousands of servicing queues, parse credit files, and resolve entities in real time.** This work is not being done today; it physically exceeds human bandwidth.
* **The 48–72 Hour Wire Flight & Title Disbursement Deadline:** When a commercial borrower sells an asset, net equity proceeds ($2M–$10M+) routinely wire out to Wall Street wirehouses or independent wealth platforms within **48–72 hours** of closing. Critically, title companies execute wires based on the **Seller's Closing Settlement Disbursement Instructions**, signed by the borrower days before closing. If Huntington does not engage before those instructions are filed, the liquidity is lost permanently.
* **The Two-Sided Bottleneck + Ongoing Servicing Limit:**
  - *Commercial side:* Commercial RMs focus on loan production and cannot watch for exits at scale. Discovery, entity resolution, and valuation require **6–8 hours across three systems per deal**—un-staffable across a $4.5B book.
  - *Wealth side (Onboarding & Servicing):* Even when a lead is captured, a Private Wealth Advisor (PWA) manages ~80–100 client relationships. Manual onboarding takes **2–3 weeks**, but more importantly, **ongoing fiduciary servicing** (quarterly portfolio reviews, estate planning coordination, tax-loss harvesting) consumes advisor bandwidth. Merely flooding advisors with leads trades a commercial bottleneck for an acute wealth bottleneck, leading to relationship churn.
* **The IRC §1031 Exchange Leakage:** In commercial real estate dispositions ($5M–$20M), **over 50–65% of sellers execute an IRC §1031 Like-Kind Exchange** to defer capital gains and depreciation recapture. Under IRS rules (Treas. Reg. § 1.1031(k)-1(k)), if sale proceeds touch the borrower's commercial operating account, the tax deferral is voided, and commercial banks cannot act directly as the Qualified Intermediary due to disqualified person rules. Unless Huntington provides an immediate **1031 Qualified Escrow Depository (Partner QI Network)** solution under Treas. Reg. § 1.1031(k)-1(g)(3), 1031 proceeds legally must wire away to third-party exchange accommodators.

> **Empirical Premise (Provenance):** The ~78% flight rate cited in §6 derives from internal Treasury Management analysis of 2023–2025 commercial payoff-to-outflow patterns (net proceeds wiring to non-Huntington institutions within 5 business days of payoff). A Phase 1 pilot validation target, not an audited certainty.

### 1.2 The Solution: Dual-Sided Agentic Capacity Leverage
Horizon gives a **fixed team the reach of a much larger one** by having an intelligent agent do the work no human team can do at scale — on *both* sides of the relationship handoff:
1. **Monitors the Entire Book (Human-Impossible Scale):** Continuously monitors all commercial servicing queues for title-company Payoff Statement Requests — coverage no headcount plan could achieve manually.
2. **Absorbs Commercial Discovery via Gemini Multimodal Intelligence:** Uses Google Cloud **Gemini Enterprise Agent Platform** with native multimodal ingestion to inspect raw scanned credit agreements, deeds, and incumbency certificates directly, mapping borrowing LLCs to beneficial owners with pixel-level bounding-box citations—eliminating multi-hour manual discovery.
3. **Reasons Over Messy Reality with Grounded Intelligence:** Detects missing information (e.g., unstated contract sale prices) and calculates indicative net proceeds using in-place trailing Net Operating Income (NOI) capitalized via submarket cap rates **grounded dynamically via Vertex AI Search** against internal commercial appraisal benchmarks.
4. **Detects Tax Strategy & 1031 Routing:** Inspects payoff requests and settlement filings for exchange provisions. If an IRC §1031 exchange is detected, it automatically routes proceeds to a **Huntington 1031 Qualified Escrow Depository (Partner QI Network)** path under Treas. Reg. § 1.1031(k)-1(g)(3), preserving deposits during the 180-day window rather than letting funds leak to external accommodators.
5. **Absorbs Wealth Onboarding & Ongoing Servicing:** Pre-stages the advisor's administrative scaffolding behind a **GLBA-compliant Quarantined Consent Gate**—pre-filling KYC/CIP records, configuring an SEI custodial shell, drafting an Investment Policy Statement (IPS) framework, and assembling ongoing quarterly portfolio review briefs. Onboarding compresses from weeks to days, and ongoing servicing capacity expands from 80 to 150 accounts per advisor.
6. **Surfaces Only the Qualified Few via Deterministic Sentry:** Applies objective credit risk ratings and FINRA Rule 2040 non-fee splitting checks deterministically, ensuring bankers spend human time only on pre-vetted, ready-to-action relationships.

> **The Scaling Claim (stated plainly):** *No human team could monitor a $4.5B payoff book in real time. Horizon monitors all of it, absorbs multi-hour discovery on the commercial side, and pre-stages onboarding and ongoing fiduciary servicing on the wealth side. The same headcount—commercial and wealth—now covers a franchise it physically could not have covered before. That is how Huntington scales wealth management without scaling the org chart.*

> **Scope Note:** This prototype proves the **CRE loan payoff** case end-to-end (incorporating both taxable cash-out and IRC §1031 exchange paths). The same detect-resolve-stage pattern extends to middle-market M&A exits and ESOP transitions in a later phase.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│              THE CORE HORIZON LOOP — DUAL-SIDED CAPACITY LEVERAGE AT BOOK SCALE                 │
├──────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│ 1. MONITOR ALL (T-14)        │ 2. AGENT ABSORBS THE WORK        │ 3. SURFACE QUALIFIED FEW      │
│ • Watches entire $4.5B book  │ • Gemini Multimodal extracts LLC │ • Exclusion Sentry (Pass)     │
│   (no human team can)        │ • Detects unstated sale price    │ • RM: 4-min warm call (not 7hr)│
│ • 1st American Title payoff  │ • Grounds NOI ($637k @ 7.5% cap) │ • Delivers Wire Routing Form  │
│   on Riverfront Commons      │ • Models ~$2.9M net proceeds     │ • PWA: 80% pre-staged onboard │
│ • Identifies 1031 vs Cash    │ • Pre-fills KYC, SEI shell, IPS  │ • Ongoing servicing automated │
│ • Manual work never staffed  │ • Quarantines pending consent    │ • Same headcount, larger book │
└────────────────[Dual Retention Shield] ◄── [RM Call & Wire Form (T-12)] ◄── [Qualified Queue + Quarantined Staging]
 ├─ Taxable: Business Premier ICS (~4 min call)                     │
 └─ 1031: Qualified Escrow Depository                              ▼
                                                [PWA Onboarding & Ongoing Servicing]
                                                (KYC, SEI Shell, IPS, Quarterly Dossiers)
```

### Step 1: Book-Scale Monitoring & Ingestion (Day T-14)
* Horizon continuously monitors **all** commercial servicing queues (AFS / ACBS core feeds)—coverage a human team cannot provide. Among thousands of events, it ingests a Payoff Statement Request (scanned PDF) from First American Title for *Riverfront Commercial Commons* (Borrower: `Vance Riverfront Properties IV, LLC`).
* Loan debt payoff balance: **$5,214,800**. Scheduled closing date: **14 days out**.

### Step 2: The Agent Absorbs the Commercial Discovery Load (Day T-14)
* **The Work Being Absorbed:** Resolving this opportunity manually requires an RM to pull the credit file, read the incumbency certificate, check the guaranty agreement, cross-reference CRM entities, and inspect tax flags—consuming **6–8 hours across three disconnected systems, per deal.**
* **The Agent at Work:** Powered by the **Gemini Enterprise Agent Platform (fka Vertex AI Platform)** running `gemini-3.7-flash`, Horizon natively processes the raw scanned documents. Utilizing multimodal visual layout understanding, it extracts:
  - *Borrower's Certificate of Incumbency* and *Commercial Guaranty Agreement* (contractual credit documents under standard GLBA affiliate disclosures—strictly avoiding FinCEN AML/CDD vaults).
  - Resolves beneficial ownership: **Marcus Vance** (85% Managing Member & Unconditional Guarantor) and **Elena Vance** (15% Member).
  - Generates **visual bounding-box citations** highlighting exact evidentiary clauses on the scanned document images. **Elapsed agent time: seconds.**

### Step 3: The "Agentic Proof" Moment (Grounded Valuation & Tax Strategy Reasoning)
* **The Real-World Messiness:** The title company’s letter states the loan payoff balance but **omits the property contract sale price** and does not declare whether the seller is executing an IRC §1031 exchange.
* **The Intelligent Reasoning:** Rather than failing or escalating to a human analyst, the agent:
  1. Identifies that the contract sale price is unstated in the payoff request.
  2. Queries the credit vault via Vertex AI Search, retrieving the trailing 12-month Net Operating Income (**NOI: $637,500**) from the most recent covenant compliance certificate.
  3. **Grounded Cap Rate Benchmark:** Dynamically grounds the capitalization rate using internal commercial appraisal records and regional market feeds, identifying a **7.5% Columbus commercial submarket cap rate**.
  4. Deterministically computes indicative market valuation: **$8,500,000** ($637,500 / 0.075).
  5. Cross-references original 2021 underwriting ($8.0M purchase at 65% LTV with $5.2M loan), confirming a healthy, non-distressed commercial disposition.
  6. Calculates estimated net proceeds: **$8,500,000 (Indicative Sale) − $5,214,800 (Payoff) − $385,200 (Closing/Broker Fees) = $2,900,000 net equity**.
  7. **1031 Exchange Evaluation:** Inspects title documentation and contract riders for Section 1031 exchange intent. Flags `1031 Exchange Intent: NO` (with interactive toggle to switch to 1031 Qualified Escrow Depository routing if indicated by borrower).
  8. Stages an actionable briefing note: *"Title letter omits sale price. Staged at $8.5M based on grounded Q1 NOI ($637.5k @ 7.5% cap rate). Estimated net equity: $2.9M. Confirm contract price and 1031 status on call."*

### Step 4: Automated Qualification — Surfacing Only the Vetted Few (Exclusion Sentry)
* Horizon screens deterministically to guarantee compliance and protect banker time:
  - **Credit Risk Rating:** Confirms rating is **Pass (Rating 2)**. (Criticized, Special Mention, Substandard, or SAG/Workout loans are automatically suppressed.)
  - **ECOA / Regulation B Fair Lending Guardrail:** Filtering relies strictly on objective credit ratings and a minimum liquidity floor ($\ge \$500,000$ net proceeds); zero subjective demographic or geographic AI scoring.
  - **FINRA Rule 2040 Compliance:** Confirms the Commercial RM receives **100% Shadow Deposit Credit** on their cost-of-funds scorecard and collaboration points, with zero securities transaction fee-splitting.

### Step 5: Human-First Banker Call & Wire Routing Form Delivery (Day T-12)
* **Signal Timing:** Ingested at T-14; surfaced to the RM Priority Radar at **T-12** after entity resolution, grounding, and compliance screening complete.
* The system **never** sends automated cold emails or marketing outreach to Marcus Vance. The human touch is reserved for the banker.
* **The High-Value 4-Minute Call:** Greg Miller calls Marcus: *"Marcus, congratulations on getting Riverfront Commons under contract! I saw the payoff calculation come through from First American. Let's make sure that $2.9M net proceeds works immediately for you upon closing. I’d like to bring in Sarah Jenkins from Private Bank to structure our 4.85% Treasury sweep, and send First American our direct settlement wire instructions so the funds land safely on Day 0."*
* Marcus confirms he is cashing out (no 1031) and agrees to the introduction. Greg clicks **[Approve Wealth Introduction & Deliver Wire Form]**.
* Horizon instantly generates the **Huntington Verified Settlement Wire Instruction Form**, pre-filled for First American Title, ensuring net proceeds are routed directly to Huntington.

### Step 6: Wealth-Side Capacity Leverage — Onboarding & Ongoing Servicing (Day T-8)
* **The Work Being Absorbed (Wealth Side):** Manual onboarding consumes **4–6 hours of advisor time** and stretches over **2–3 weeks**. Ongoing servicing (quarterly reviews, asset allocation tracking) limits an advisor to 80–100 clients. Horizon absorbs both:
  1. **GLBA Quarantined Consent Gate:** Staged wealth assets remain strictly isolated behind an internal compliance partition until Greg records Marcus's verbal consent.
  2. **KYC/CIP Pre-Fill:** Populates client identity and verification fields from commercial credit records (subject to advisor verification), eliminating redundant data entry.
  3. **SEI Custodial Shell Configuration:** Provisions a staged SEI Wealth Platform account shell and a *proposed* conservative asset-allocation model matched to Marcus's liquidity horizon.
  4. **Draft IPS Framework:** Assembles administrative scaffolding for an Investment Policy Statement—boilerplate structure and pre-populated facts only.
  5. **Ongoing Fiduciary Servicing Support:** Pre-generates an automated **Quarterly Relationship Dossier template** and real-time **Portfolio Drift Telemetry**, enabling Sarah to manage **150+ relationships** rather than 80 without administrative burnout.
* **The Result:** Onboarding compresses from **~3 weeks to ~3 days**, and ongoing servicing overhead drops by 60%. *(See §5.4: the agent produces administrative scaffolding only; the licensed advisor authors all suitability and investment advice under Reg BI.)*

### Step 7: Dual-Path Liquidity Retention Activation (Day T-0 to T+10)
* **Path A (Taxable Cash Out — Marcus Vance Scenario):**
  - **Day T-2:** Marcus executes the DocuSign pre-onboarding packet for the **Huntington Business Premier ICS Sweep**.
  - **Day T-0 (Closing):** Wire settles directly into Marcus's commercial Business Premier ICS account backed by **Insured Cash Sweep (ICS)**, providing multi-million-dollar FDIC insurance and 4.85% yield. **The 48-hour flight trigger is completely neutralized on Day 0.**
  - **Day T+10 (Wealth Advisory):** With liquidity secured, Sarah completes full fiduciary discovery. Marcus transitions $2.0M into his discretionary **SEI Wealth Platform** Family Trust account, leaving $900k in commercial operating reserves.
* **Path B (IRC §1031 Exchange Alternate Path):**
  - If Marcus flags 1031 intent, funds cannot touch Business Premier ICS. Horizon routes the wire instructions to the **Huntington 1031 Qualified Escrow Depository (Partner QI Network)** under Treas. Reg. § 1.1031(k)-1(g)(3).
  - Proceeds are held under institutional escrow yielding 4.75% during the statutory 45-day identification / 180-day closing window, while referring Marcus to Huntington's **Delaware Statutory Trust (DST) / 1031 Advisory Desk**—retaining $2.9M in institutional deposits that would otherwise be wired to external exchange accommodators.

---
## 3. The Focused 3-Pane Workspace

Embedded inside a styled Salesforce Financial Services Cloud (FSC) shell, featuring a **Persona Switcher** (`[Greg Miller (RM)]` ⇄ `[Sarah Jenkins (PWA)]`), an active **Capacity Meter**, dynamic 1031 switching, and verified grounding badges.

```
┌──────────────────────────────────┬─────────────────────────────────────┬─────────────────────────────────┐
│     PANE 1: PRIORITY RADAR       │   PANE 2: HOUSEHOLD & ENTITY MAP    │    PANE 3: AGENT STAGING        │
├──────────────────────────────────┼─────────────────────────────────────┼─────────────────────────────────┤
│  QUALIFIED QUEUE (AUTO-SCREENED) │  COMMERCIAL-TO-PERSONAL TOPOLOGY    │  COLLABORATIVE ACTION CONSOLE   │
│                                  │                                     │                                 │
│  SYNTHETIC CAPACITY METER:       │  [Vance Riverfront Props IV, LLC]   │  LIQUIDITY DOSSIER: M. VANCE    │
│  ▸ 2,140 events screened         │                 │ [Doc Citation ⧉]  │  • Debt Payoff: $5,214,800      │
│  ▸ 6 qualified & staged          │                 ▼                   │  • Staged Sale Price: $8,500,000│
│  ▸ ~46 hrs manual discovery      │          [Marcus Vance]             │    [Slider: Adjust Sale Price]  │
│    ABSORBED BY AI this wk        │   Known HBAN Position: ~$5.0M **    │  • Est Net Equity: $2,900,000   │
│  ▸ ~18 hrs wealth admin absorbed │                 │                   │  • Tax Strategy: [CASH-OUT|1031]│
│  ▸ Active Machine Inferences: 3  │        (Joint Household)            │    1031 Detected: NO (Eligible) │
│                                  │                 ▼                   │                                 │
│  [CRITICAL: T-12 DAYS]           │          [Elena Vance]              │  WORK ABSORBED (COMMERCIAL):    │
│  • Marcus Vance                  │                 │ (15% Member)      │  ▸ Discovery: ~7 hrs → 4 min    │
│    $2.9M Est Net Proceeds        │                 ▼                   │  ▸ Settlement Wire Form ready   │
│    Payoff: 1st Amer Title        │     [Vance 2018 Family Trust]       │                                 │
│    Risk Rating: Pass (Tier 2)    │     (Trust & Fiduciary Oppty)       │  WORK ABSORBED (WEALTH):        │
│    Action: Personal Phone Call   │                                     │  ▸ KYC/CIP pre-filled (Staged)  │
│                                  │  Resolved Deal Equity: $2.9M        │  ▸ SEI shell & IPS scaffolded   │
│  [UPCOMING: T-24 DAYS]           │  HBAN Commercial Balances: $2.1M    │  ▸ Ongoing review dossier ready │
│  • Buckeye Precision Tooling     │  External Flight Risk: $2.9M        │  ▸ Servicing: ~3 wks → ~3 days  │
│    $1.4M Equipment Line Payoff   │                                     │                                 │
│                                  │  GROUNDING ATTRIBUTION:             │  GLBA STATUS: [QUARANTINED]     │
│  [WATCHLIST: T-45 DAYS]          │  ⧉ Credit Vault Doc #CC-8821        │  Awaiting RM Verbal Consent     │
│  • Columbus Medical Arts         │  ⧉ Franklin Co. Q1 7.5% Cap Rate    │                                 │
│    $3.2M Balloon Note Refinance  │    (Grounded via Vertex AI Search)  │  [Call Marcus: View Talk Track] │
│                                  │                                     │  [APPROVE & DELIVER WIRE FORM]  │
│  Filter: Exclusion Sentry Active │                                     │  [PERSONA: SWITCH TO PWA VIEW]  │
└──────────────────────────────────┴─────────────────────────────────────┴─────────────────────────────────┘
```
*\*\* "Known HBAN Position" reflects only Huntington-resolvable balances: resolved deal equity ($2.9M) plus existing commercial operating balances ($2.1M). Horizon does not compute or assert an aggregate personal net worth; any client-provided net-worth figure originates from the most recent PFS on file in the commercial credit file, not agent inference.*

* **Pane 1 (Priority Radar + Synthetic Capacity Meter):** Demonstrates dual-sided leverage explicitly—thousands of events screened, manual discovery absorbed, ongoing servicing hours unlocked, and live machine inference status.
* **Pane 2 (Household Topology & Grounding Evidence):** Interactive entity graph mapping commercial LLCs to beneficial owners, equipped with clickable citation pills linking directly to document bounding boxes.
* **Pane 3 (Agent Staging Console):** Command center showing grounded calculations, real-time sale price slider, 1031 tax routing toggle, GLBA consent gate indicator, and wire instruction generation.

---
## 4. Simplified Technical Architecture

Horizon utilizes a clean **Single Orchestrator + Deterministic Tools** pattern built natively on the **Gemini Enterprise Agent Platform (fka Vertex AI Platform)**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    HORIZON PROTOTYPE STACK                                      │
├───────────────────────────────┬─────────────────────────────────┬───────────────────────────────┤
│ DATA INGESTION & STORAGE      │ REASONING ORCHESTRATOR          │ GOVERNANCE & UI INTEGRATION   │
│ • Core Servicing (AFS / ACBS) │ • Gemini Enterprise Agent       │ • Apigee X API Gateway        │
│ • Cloud Pub/Sub (Event Bus)   │   Platform (gemini-3.7-flash)   │ • Salesforce FSC Embedded App │
│ • Cloud Spanner (Entity Graph)│ • Vertex AI Search (Grounding)  │ • DocuSign REST APIs          │
│ • BigQuery (Credit Vault)     │ • Deterministic Cloud Run Tools │ • SEI Wealth Platform Gateway │
│ • Memorystore (Redis Cache)   │   - Payoff Calculator Tool      │ • 1031 QI Custody Gateway     │
│ • VPC Service Controls (VPC-SC│   - Grounded Valuation Tool     │ • Audit Logger (Dual-ID)      │
│ • Cloud KMS (Customer Keys)   │   - 1031 Exchange Detector      │ • Zero-Data Logging Boundary  │
│                               │   - Exclusion Sentry Filter     │                               │
└───────────────────────────────┴─────────────────────────────────┴───────────────────────────────┘
```

### 4.1 Native Multimodal Grounding vs. Document AI Redundancy
Rather than running multi-hop OCR through Document AI and passing text dumps to an LLM, Horizon leverages **Gemini 3.7 Flash native multimodal document understanding**. It ingests raw scanned PDFs/TIFFs directly, preserving 2D spatial layouts, notary stamps, signature lines, and complex settlement tables, returning structured JSON paired with **pixel bounding-box coordinates** for UI grounding.

### 4.2 Deterministic Tool Boundary
The LLM is strictly confined to unstructured document understanding, contextual planning, and narrative drafting. All financial arithmetic and regulatory filtering are executed by deterministic code:
* `CalculatorTool.compute_payoff()`: Calculates exact UPB per diem interest based on contractual day counts.
* `CalculatorTool.capitalize_noi()`: Computes indicative valuation (NOI ÷ cap rate) and net equity proceeds; inputs are grounded by Vertex AI Search, arithmetic is executed by deterministic code.
* `TenThirtyOneDetectorTool.evaluate()`: Scans title exhibits for Section 1031 exchange provisions, toggling the settlement routing between Business Premier ICS and QI Escrow Custody.
* `ExclusionSentryTool.screen()`: Evaluates objective regulatory risk ratings and minimum liquidity hurdles under strict ECOA/Reg B deterministic parameters.

### 4.3 Cloud Run Prototype Monostack & Security Implementation
To guarantee zero-cost idle operation, rapid executive iteration, and enterprise-grade security, the Horizon working demonstration conforms strictly to Google Cloud Run standardized monostack architecture:
1. **Monostack Container Architecture:** 
   - **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui primitives.
   - **Backend:** Python 3.11 FastAPI application serving APIs and the compiled SPA bundle.
   - **Multi-Stage Container:** Hardened `Dockerfile` running as non-root `appuser` on `python:3.11-slim`, listening on `0.0.0.0:${PORT:-8080}`.
2. **Cloud Run Native Identity-Aware Proxy (IAP) & DRS Compliance:**
   - Deployed with `--iap --no-invoker-iam-check --no-allow-unauthenticated --ingress=all`.
   - **DRS Org Policy Protection:** Zero GCP project-level IAM bindings for `domain:google.com`; end-user access is granted directly at the Cloud Run IAP resource level (`roles/iap.httpsResourceAccessor`).
   - **Cryptographic JWT Verification:** FastAPI backend cryptographically validates the `X-Goog-IAP-JWT-Assertion` header using cached Google public keys, verifying audience (`/projects/${PROJECT_NUMBER}/locations/${GCP_REGION}/services/${APP_NAME}`) and user email.
3. **Credentials & Resource Governance:**
   - **Zero Service Account Keys:** Zero JSON keys generated or downloaded. Local dev uses Application Default Credentials (ADC) via `gcloud auth application-default login`; Cloud Run uses a dedicated runtime Service Account (`huntington-horizon-sa`, $\le 30$ chars) with least privilege (`roles/aiplatform.user`).
   - **Scale-to-Zero Idle Defaults:** Deployed with `--min-instances=0` (zero compute cost when idle) and `--max-instances=3` (safety cap).
   - **Local Host Binding Invariant:** Local servers listen strictly on `127.0.0.1:${LOCAL_PORT:-8080}`; local Vite dev server proxies `/api` and `/ws`.
4. **Mandatory Admin Panel & Diagnostic Telemetry:**
   - **Gear Icon:** Positioned on the **far right** of the primary application header (`<Settings className="w-4 h-4" />`), opening a slide-over technical sheet.
   - **Diagnostic Telemetry Badges:** Displays live badges for AI Platform (**Gemini Enterprise Agent Platform (fka Vertex AI Platform)**), Model Baseline (`gemini-3.7-flash`), GCP Project (`hban-wealth-innovation`), Runtime Service Account (`huntington-horizon-sa`), and IAP Auth status.
   - **Quick Links:** Direct links to interactive `/brand_kit.html` and `/demo_script.html`.

---
## 5. Explicit Operational & Regulatory Boundaries (What We Do NOT Do)

1. **No Core Loan Servicing:** Horizon does not process interest payments, principal curtailments, or escrow disbursements.
2. **No Payoff Execution:** Horizon calculates indicative payoff figures for planning; it does not execute wire transfers or extinguish debt.
3. **No Legal Lien Releases:** Horizon does not generate or record mortgage satisfactions, deed reconveyances, or UCC-3 termination filings. These remain strictly within loan operations and settlement agent controls.
4. **No Replacement of Licensed Advice (Reg BI Guardrail):** Horizon absorbs *administrative* discovery and onboarding scaffolding only. It does **not** conduct fiduciary discovery, render suitability determinations, or author investment recommendations. All KYC/CIP entries, SEI allocation models, and draft IPS documents are **draft scaffolding requiring licensed-advisor review and authorship**; the Series 7/66/CFP advisor owns every suitability and investment decision.
5. **No Aggregate Net-Worth Inference:** Horizon surfaces only Huntington-resolvable positions and documented credit application facts; it does not compute or assert total personal net worth.
6. **GLBA & FCRA Quarantined Consent Gate:** Financial information obtained from commercial credit agreements is strictly quarantined. Staged wealth profiles are not injected into SEI Wealth Platform or retail CRM until the commercial RM records the borrower's **affirmative verbal consent** during the T-12 call.
7. **Model Risk Management (OCC Bulletin 2011-12 / Fed SR 11-7):** Property valuations and proceeds estimates produced by Horizon are designated as **"Indicative Triage Estimates for Relationship Prioritization."** They are never used for credit underwriting, collateral evaluation, or regulatory capital calculations, exempting the workflow from full-scale credit model validation mandates while upholding model governance standards.
8. **ECOA / Regulation B Fair Lending Compliance:** Borrower qualification by Exclusion Sentry is governed strictly by objective, deterministic parameters (regulatory credit rating Pass Tier 1/2 and $\ge \$500,000$ net liquidity floor). Zero demographic, socioeconomic, or geographic machine learning scoring is utilized.

---
## 6. Financial Model — Dual-Sided Capacity Leverage & Retained Value

Horizon's value is presented in two linked layers: **(A) capacity leverage** (the core headcount-scaling thesis across both Commercial and Wealth) and **(B) retained financial value**.

### 6.1 Layer A — Dual-Sided Capacity Leverage (The Core Thesis)

| Metric | Manual Baseline (Today) | With Horizon |
| :--- | :---: | :---: |
| **Commercial** discovery + staging per qualified deal | ~6–8 hours (RM, 3 systems) | ~4 minutes (agent) + ~4 min (RM call) |
| **Wealth** onboarding effort per new relationship | ~4–6 hours; ~2–3 weeks elapsed | ~80% pre-staged; ~3 days elapsed |
| **Wealth** ongoing fiduciary servicing capacity | ~80–100 relationships per PWA | **~150 relationships per PWA** (automated review dossiers) |
| Portion of $4.5B payoff book monitorable in real time | Effectively **<5%** (capacity-bound) | **100%** |
| IRC §1031 exchange liquidity captured | **0%** (wires out to 3rd party QIs) | **Captured in Huntington QI Escrow** |
| Net new RM **or** PWA headcount required to scale | Requires material FTE additions | **Zero net new headcount** |

> **The Headcount Sentence:** *Commercial discovery was un-staffable at book scale, and wealth onboarding and ongoing servicing throttled advisor capacity at 80 accounts. Horizon absorbs both—surfacing invisible opportunities, accelerating onboarding from weeks to days, and providing automated servicing dossiers that expand advisor capacity to 150 accounts. This converts an un-staffable workload into an automated one on both sides of the bank with zero net new headcount.*

### 6.2 Layer B — Retained Financial Value (Interactive Sensitivity)
Leadership adjusts the **Liquidity Retention Capture Rate** across the $4.5B book:

**Portfolio Baseline**
* Annual Commercial CRE & Middle Market Loan Payoff Volume: **$4.50 Billion**
* Historical Flight Rate: **~78% ($3.51B)** *(provenance: §1.1)*
* Value Levers: **Tier 1 (Treasury ICS & 1031 Escrow)** 60% of captured @ 85 bps Net NIM; **Tier 2 (Wealth AUM)** 40% of captured @ 65 bps Advisory Fee; Annual Enterprise Cloud & Operating Run-Rate: **($1.25M)**.

| Retention Capture Rate | Incremental Retained Liquidity | Gross Annual Value | Cloud & Op Cost | Net Annual ROI | Payback |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **5% (Ultra-Conservative)** | $225.0M | $1,732,500 | ($1,250,000) | **$482,500 / yr** | 8.6 mo |
| **10% (Conservative Target)** | $450.0M | $3,465,000 | ($1,250,000) | **$2,215,000 / yr** | 4.3 mo |
| **15% (Management Goal)** | $675.0M | $5,197,500 | ($1,250,000) | **$3,947,500 / yr** | 2.9 mo |

*(Note: Preserving 2.5% of at-risk commercial credits from refinancing away represents ~$1.35M in additional preserved loan NIM, treated as upside and excluded from headline figures.)*

### 6.3 Enterprise Operating Cost Breakdown ($1,250,000 Run-Rate Defense)
To satisfy CFO scrutiny, the $1.25M annual operating run-rate is componentized across cloud infrastructure, security, and dedicated engineering:

| Component | Annual Cost | Scope & Justification |
| :--- | :---: | :--- |
| **Gemini Multimodal Ingestion & Vertex AI Search** | $15,000 | ~2,140 document ingestion inferences, grounding queries, and embeddings |
| **Cloud Spanner (Multi-Region HA Graph) & Pub/Sub** | $65,000 | Real-time commercial-to-personal household topology and event streaming |
| **Apigee X API Gateway & Salesforce FSC Connectors** | $180,000 | Enterprise API management, mutual TLS, and CRM bidirectional sync |
| **Dedicated Platform Engineering & MLOps Pod** | $650,000 | 2 dedicated platform engineers (maintenance, CI/CD, prompt regression testing) |
| **Model Risk Governance, SOC2 & Security Audits** | $340,000 | Annual OCC SR 11-7 validation, penetration testing, and VPC-SC compliance |
| **Total Annual Enterprise Operating Budget** | **$1,250,000** | **Fully-loaded production enterprise run-rate** |

---
## 7. Scripted 10-Minute Executive Demonstration Sequence

| Time | Presenter Actions & Spoken Dialogue | What is Shown in the Demo (UI & Model Feedback) | Production Implementation Blueprint | Executive Impact |
| :--- | :--- | :--- | :--- | :--- |
| **00:00–01:30** | **The Problem (Two-Sided Bottleneck & 1031 Flight):** Frame the goal: scaling wealth with existing headcount. $4.5B in payoffs no human team can monitor; 1031 exchanges leaking to third parties; and wealth advisors capped at 80 clients. This is a capacity crisis end-to-end. | Context slide: $4.5B loan book, 78% flight metric ($3.51B at risk), two-sided bottleneck diagram (Commercial discovery drag vs. Wealth onboarding/servicing wall). | BigQuery analytical telemetry on historical loan payoffs; Cloud Storage historical flight registry. | CEO & CFO align: doing more with existing headcount across both lines of business. |
| **01:30–03:30** | **The Book No Human Can Watch:** Open Horizon in FSC. Point to the **Synthetic Capacity Meter** (~46 hrs discovery absorbed, 3 active inferences running). Show First American Title's payoff surfacing at T-12. | **Pane 1 (Priority Radar):** Synthetic Capacity Meter (`2,140 screened ▸ 6 qualified & staged`). Dynamic critical queue sorted by close date. Green "Pass Tier 2" credit badge. | Google Cloud Pub/Sub ingesting AFS/ACBS core servicing events into Cloud Run event-driven microservices. | Head of Commercial sees leverage, not an intrusive time-and-motion audit. |
| **03:30–06:00** | **The Agentic Proof (Multimodal Grounding & Dynamic Slider):** Click Marcus Vance. Watch Gemini 3.7 Flash extract LLC ownership with **visual bounding-box highlights**. Show missing sale price resolved via trailing NOI grounded by Vertex AI Search ($8.5M @ 7.5% cap rate). Adjust sale price slider live from $8.5M to $9.0M. | **Pane 2 & 3:** Interactive household topology map with clickable source citations (`⧉ Credit Vault #CC-8821`). Live streaming token feedback; interactive slider dynamically re-computing net proceeds to $3.35M. | Gemini Enterprise Agent Platform (`gemini-3.7-flash`) native multimodal document understanding; Vertex AI Search grounding; Cloud Run `CalculatorTool`. | CTO & CIO see state-of-the-art multimodal AI; CFO sees automated analyst judgment. |
| **06:00–08:30** | **The Human Touch + The Wealth Bottleneck Solved:** Step into Greg's 4-minute call. Click **[Approve & Deliver Wire Form]**, generating First American's wire letter. Toggle **Persona Switcher** to Sarah Jenkins (PWA): show pre-staged KYC/CIP, SEI shell, draft IPS, and **Automated Quarterly Review Dossier**. Say: *"We enable Sarah to manage 150 clients instead of 80."* | **Pane 3:** Generated PDF wire instruction letter with First American Title pre-filled. PWA view displays 80% completed KYC/CIP, pre-configured SEI shell, and quarterly relationship review template. | Apigee X API Gateway mTLS routing to SEI Wealth Platform Gateway; DocuSign REST APIs; Cloud Spanner household graph. | Head of Wealth sees onboarding friction solved AND ongoing advisor capacity doubled under Reg BI. |
| **08:30–09:15** | **Institutional Guardrails (CRO Defense):** Open compliance audit drawer: highlight green badges for **FINRA 2040 non-fee splitting**, **GLBA Quarantined Consent Gate**, **OCC SR 11-7 Triage Designation**, and **1031 QI Escrow routing**. | Slide-out compliance drawer displaying green verification badges, tamper-evident dual-ID hash, and zero-data-logging boundary certifications. | Cloud KMS customer-managed encryption keys (CMEK); VPC Service Controls (VPC-SC perimeter); Cloud Audit Logs immutable trail. | Chief Risk Officer sees airtight compliance, privacy, and model risk boundaries. |
| **09:15–10:00** | **The Bottom Line (Two Layers):** Show Layer A (zero net new headcount across Commercial and Wealth) then slide Layer B ROI from 5% ($482k net) to 10% ($2.2M net). Show componentized $1.25M budget. Hand floor to CFO. | Layer A capacity comparison matrix; Layer B interactive ROI slider displaying net annual value and breakeven payback (8.6 mo down to 4.3 mo). | Interactive client-side tabular numeric engine; BigQuery ROI baseline model. | Executive Committee sees a proven scaling thesis backed by defensible economics. |

---
## 8. Demonstration Setup & Presentation Guardrails

1. **Resolution & Environment:** 1920x1080 full screen, embedded in styled Salesforce Financial Services Cloud.
2. **Realistic Midwest Domain Data:** All names, addresses, and figures reflect realistic Columbus, OH commercial assets. Zero placeholder text.
3. **Live Streaming Reasoning Protocol:** Agentic reasoning over the title letter runs live via Gemini Enterprise Agent Platform (`gemini-3.7-flash`) with streaming token feedback and tool-execution indicators. A backup document (*Apex Logistics Payoff Request.pdf*) is pre-loaded to re-run extraction live on stage if challenged.
4. **Deterministic Fallback Layer:** Background CRM lookups and static UI elements utilize an encrypted local Redis cache to guarantee sub-second UI responsiveness regardless of conference Wi-Fi.
5. **Interactive Controls:** The **Sale Price Slider**, **1031 Tax Strategy Toggle**, **Persona Switcher**, and **ROI Sensitivity Slider** are built natively into the frontend for live audience interaction.
6. **Show-vs-Tell Ledger:** 
   - *Live on Screen:* Multimodal bounding-box extraction, grounded cap-rate calculation, 1031 escrow routing toggle, wire instruction PDF generation, and staged KYC/IPS scaffolding.
   - *Staged Representations:* The final DocuSign signature and automated core wire execution are represented as completed staged states to preserve the 10-minute briefing tempo.

---
### Anticipated Executive Q&A (Presenter Prep)

* **"How does this scale wealth management with existing headcount if advisors are already at capacity?"**  
  → Horizon eliminates both wealth bottlenecks: it compresses administrative onboarding from ~3 weeks to ~3 days, and provides automated quarterly review dossiers that expand advisor capacity from 80 to 150 relationships without adding staff (§1.2, §6.1).

* **"What if the borrower is doing a 1031 exchange? Won't the deposit leave anyway?"**  
  → That’s why Horizon includes native 1031 detection. When an exchange is identified, proceeds are routed directly into a Huntington Qualified Intermediary (QI) Escrow Custody Account, preserving institutional deposits during the 180-day exchange window and referring the client to Huntington's Delaware Statutory Trust (DST) desk (§1.1, §2 Step 7).

* **"If commercial RMs never did this work, how can we claim capacity leverage?"**  
  → We don’t claim saved hours on work people were doing; we claim **manual discovery absorbed**—work that was un-staffable at book scale. Horizon monitors 100% of the book and hands the RM a pre-screened, ready-to-call relationship, converting invisible liquidity into actionable pipeline (§1.1, §2 Step 2).

* **"How do you ensure the agent didn't hallucinate the 7.5% cap rate or property value?"**  
  → Valuations are strictly grounded via Vertex AI Search against internal commercial appraisal benchmarks and regional indices, paired with deterministic arithmetic tools. Every metric in the dossier displays a clickable source citation badge (§2 Step 3, §4.2).

* **"Does using commercial credit files to cross-sell wealth violate GLBA or Fair Lending?"**  
  → No. All wealth staging remains quarantined behind an internal compliance gate until the commercial RM records the borrower's verbal opt-in consent during the T-12 call. Disqualifications by Exclusion Sentry rely solely on objective regulatory credit ratings and liquidity thresholds, adhering strictly to ECOA/Reg B (§5.6, §5.8).

* **"Why does it cost $1.25M annually to process 2,000 payoffs?"**  
  → The compute is minimal ($15k/yr); the $1.25M fully-loaded budget funds high-availability Cloud Spanner, Apigee X integration, enterprise compliance audits, and a dedicated 2-person platform engineering and MLOps pod (§6.3).

* **"Does this automate investment advice or violate Reg BI?"**  
  → Absolutely not. Horizon produces administrative drafting and operational scaffolding only. Every suitability determination, risk tolerance evaluation, and asset allocation decision is authored and signed by the licensed Series 7/66/CFP advisor (§5.4).

---
*Huntington Horizon v5.2 Specification — Built to prove dual-sided agentic capacity leverage: scaling wealth management with existing headcount across both Commercial and Wealth.*