# Huntington Book Scout: Intelligent Liquidity Orchestration
## Prototype Specification & Executive Demonstration Blueprint (v5.2)
**Document Version:** 5.2 (Dual-Sided Capacity Leverage & Enterprise GCP Agentic Blueprint)  
**Target Audience:** Executive Committee Review, Huntington Bancshares Incorporated (HBAN)  
**Status:** Working Prototype & Demonstration Specification (Concept Evaluation)  
**Effective Date:** September 2026  
**Classification:** Internal Bank Working Document — For Evaluation Purposes Only  

---
### Document Overview
This document specifies the working software prototype and demonstration narrative for **Huntington Book Scout**. It focuses strictly on what is built and demonstrated in a 10-minute executive briefing, to prove a single core thesis: **can an intelligent agent let Huntington scale its wealth management franchise with existing headcount — by monitoring a book no human team could cover, absorbing the manual discovery across Commercial, eliminating onboarding and ongoing servicing friction across Wealth, and safeguarding both taxable cash-out and IRC §1031 exchange liquidity?**

The secondary proof is financial: that this capacity leverage converts directly into retained deposits, escrow custody, and AUM.

---
## 1. Executive Summary & The Problem
### 1.1 The Core Pain: A Capacity Problem Across the Entire Relationship Lifecycle
Huntington cannot scale wealth management by asking bankers to work harder. The constraint is **human capacity against an un-monitorable book — spanning the entire relationship handoff and lifecycle**:
* **The Book-Scale Visibility Gap:** Huntington's commercial book generates a derived **~$7.49B in annual CRE and middle-market loan payoffs** against a **$33.30B** target book. Each payoff is a potential wealth event — and **no human team can manually monitor thousands of servicing queues, parse credit files, and resolve entities in real time.** This work is not being done today; it physically exceeds human bandwidth.
* **The 48–72 Hour Wire Flight & Title Disbursement Deadline:** When a commercial borrower sells an asset, net equity proceeds ($2M–$10M+) routinely wire out to Wall Street wirehouses or independent wealth platforms within **48–72 hours** of closing. Critically, title companies execute wires based on the **Seller's Closing Settlement Disbursement Instructions**, signed by the borrower days before closing. If Huntington does not engage before those instructions are filed, the liquidity is lost permanently.
* **The Two-Sided Bottleneck + Ongoing Servicing Limit:**
  - *Commercial side:* Commercial RMs focus on loan production and cannot watch for exits at scale. Discovery, entity resolution, and valuation require **6–8 hours across three systems per deal**—un-staffable across a book this size.
  - *Wealth side (Onboarding & Servicing):* Even when a lead is captured, a Private Wealth Advisor (PWA) manages ~80–100 client relationships. Manual onboarding takes **2–3 weeks**, but more importantly, **ongoing fiduciary servicing** (quarterly portfolio reviews, estate planning coordination, tax-loss harvesting) consumes advisor bandwidth. Merely flooding advisors with leads trades a commercial bottleneck for an acute wealth bottleneck, leading to relationship churn.
* **The IRC §1031 Exchange Leakage:** In commercial real estate dispositions ($5M–$20M), **over 50–65% of sellers execute an IRC §1031 Like-Kind Exchange** to defer capital gains and depreciation recapture. Under IRS rules (Treas. Reg. § 1.1031(k)-1(k)), if sale proceeds touch the borrower's commercial operating account, the tax deferral is voided, and commercial banks cannot act directly as the Qualified Intermediary due to disqualified person rules. Unless Huntington provides an immediate **1031 Qualified Escrow Depository (Partner QI Network)** solution under Treas. Reg. § 1.1031(k)-1(g)(3), 1031 proceeds legally must wire away to third-party exchange accommodators.

> **Empirical Premise (Provenance):** The ~78% flight rate cited in §6 is an **industry benchmark, not a Huntington measurement.** No internal Huntington study underlies it and none should be claimed. Published commercial deposit-attrition work places post-payoff flight in the **70–85%** range; 78% is the midpoint. Treat it as a **Phase 1 pilot validation target** whose first job is to be replaced by Huntington's own measured rate.
>
> Sensitivity: across the full 70–85% band the break-even recapture moves only between **31.2% and 37.9%**, and the capacity case does not depend on this input at all.

### 1.2 The Solution: Dual-Sided Agentic Capacity Leverage
Book Scout gives a **fixed team the reach of a much larger one** by having an intelligent agent do the work no human team can do at scale — on *both* sides of the relationship handoff:
1. **Monitors the Entire Book (Human-Impossible Scale):** Continuously monitors all commercial servicing queues for title-company Payoff Statement Requests — coverage no headcount plan could achieve manually.
2. **Absorbs Commercial Discovery via Gemini Multimodal Intelligence:** Uses Google Cloud **Gemini Enterprise Agent Platform** with native multimodal ingestion to inspect raw scanned credit agreements, deeds, and incumbency certificates directly, mapping borrowing LLCs to beneficial owners with pixel-level bounding-box citations—eliminating multi-hour manual discovery.
3. **Reasons Over Messy Reality with Grounded Intelligence:** Detects missing information (e.g., unstated contract sale prices) and calculates indicative net proceeds using in-place trailing Net Operating Income (NOI) capitalized via submarket cap rates **grounded dynamically via Vertex AI Search** against internal commercial appraisal benchmarks.
4. **Detects Tax Strategy & 1031 Routing:** Inspects payoff requests and settlement filings for exchange provisions. If an IRC §1031 exchange is detected, it automatically routes proceeds to a **Huntington 1031 Qualified Escrow Depository (Partner QI Network)** path under Treas. Reg. § 1.1031(k)-1(g)(3), preserving deposits during the 180-day window rather than letting funds leak to external accommodators.
5. **Absorbs Wealth Onboarding & Ongoing Servicing:** Pre-stages the advisor's administrative scaffolding behind a **GLBA-compliant Quarantined Consent Gate**—pre-filling KYC/CIP records, configuring an SEI custodial shell, drafting an Investment Policy Statement (IPS) framework, and assembling ongoing quarterly portfolio review briefs. Onboarding compresses from weeks to days, and ongoing servicing capacity expands from 80 to **95–100 accounts per advisor (+20–25%)** via 2x CSA operational leverage, with sub-$3M transactional accounts routed to the Centralized Wealth Advisory Hub.
6. **Surfaces Only the Qualified Few via Deterministic Sentry:** Applies objective credit risk ratings and FINRA Rule 2040 non-fee splitting checks deterministically, ensuring bankers spend human time only on pre-vetted, ready-to-action relationships.

> **The Scaling Claim (stated plainly):** *No human team could monitor a payoff book this size in real time. Book Scout monitors all of it, absorbs multi-hour discovery on the commercial side, and pre-stages onboarding and ongoing fiduciary servicing on the wealth side. The same headcount—commercial and wealth—now covers a franchise it physically could not have covered before. That is how Huntington scales wealth management without scaling the org chart.*

> **Scope Note:** This prototype proves the **CRE loan payoff** case end-to-end (incorporating both taxable cash-out and IRC §1031 exchange paths). The same detect-resolve-stage pattern extends to middle-market M&A exits and ESOP transitions in a later phase.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│              THE CORE BOOK SCOUT LOOP — DUAL-SIDED CAPACITY LEVERAGE AT BOOK SCALE                 │
├──────────────────────────────┬──────────────────────────────────┬───────────────────────────────┤
│ 1. MONITOR ALL (T-14)        │ 2. AGENT ABSORBS THE WORK        │ 3. SURFACE QUALIFIED FEW      │
│ • Watches entire $33.3B book │ • Gemini Multimodal extracts LLC │ • Exclusion Sentry (Pass)     │
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
* Book Scout continuously monitors **all** commercial servicing queues (core servicing feeds)—coverage a human team cannot provide. Among thousands of events, it ingests a Payoff Statement Request (scanned PDF) from First American Title for *Riverfront Commercial Commons* (Borrower: `Vance Riverfront Properties IV, LLC`).
* Loan debt payoff balance: **$5,214,800**. Scheduled closing date: **14 days out**.

### Step 2: The Agent Absorbs the Commercial Discovery Load (Day T-14)
* **The Work Being Absorbed:** Resolving this opportunity manually requires an RM to pull the credit file, read the incumbency certificate, check the guaranty agreement, cross-reference CRM entities, and inspect tax flags—consuming **6–8 hours across three disconnected systems, per deal.**
* **The Agent at Work:** Powered by the **Gemini Enterprise Agent Platform (fka Vertex AI Platform)** running `gemini-3.7-flash`, Book Scout natively processes the raw scanned documents. Utilizing multimodal visual layout understanding, it extracts:
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
* Book Scout screens deterministically to guarantee compliance and protect banker time:
  - **Credit Risk Rating:** Confirms rating is **Pass (Rating 2)**. (Criticized, Special Mention, Substandard, or SAG/Workout loans are automatically suppressed.)
  - **Objective Prioritization Controls:** Outreach prioritization relies strictly on the objective regulatory credit rating and a minimum liquidity floor ($\ge \$500,000$ net proceeds). Zero demographic inputs, and **no credit decision is made**, so no adverse-action obligation arises and ECOA / Regulation B is not the operative regime. Property geography enters only through market cap-rate benchmarking for valuation, never as an eligibility criterion.
  - **FINRA Rule 2040 Compliance:** Confirms the Commercial RM receives **100% Shadow Deposit Credit** on their cost-of-funds scorecard and collaboration points, with zero securities transaction fee-splitting.

### Step 5: Human-First Banker Call & Wire Routing Form Delivery (Day T-12)
* **Signal Timing:** Ingested at T-14; surfaced to the RM Priority Radar at **T-12** after entity resolution, grounding, and compliance screening complete.
* The system **never** sends automated cold emails or marketing outreach to Marcus Vance. The human touch is reserved for the banker.
* **The High-Value 4-Minute Call:** Greg Miller calls Marcus: *"Marcus, congratulations on getting Riverfront Commons under contract! I saw the payoff calculation come through from First American. Let's make sure that $2.9M net proceeds works immediately for you upon closing. I’d like to bring in Sarah Jenkins from Private Bank to structure our 4.85% Treasury sweep, and send First American our direct settlement wire instructions so the funds land safely on Day 0."*
* Marcus confirms he is cashing out (no 1031) and agrees to the introduction. Greg clicks **[Approve Wealth Introduction & Deliver Wire Form]**.
* Book Scout instantly generates the **Huntington Verified Settlement Wire Instruction Form**, pre-filled for First American Title, ensuring net proceeds are routed directly to Huntington.

### Step 6: Wealth-Side Capacity Leverage — Onboarding & Ongoing Servicing (Day T-8)
* **The Work Being Absorbed (Wealth Side):** Manual onboarding consumes **4–6 hours of advisor time** and stretches over **2–3 weeks**. Ongoing servicing (quarterly reviews, asset allocation tracking) limits an advisor to 80–100 clients. Book Scout absorbs both:
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
  - If Marcus flags 1031 intent, funds cannot touch Business Premier ICS. Book Scout routes the wire instructions to the **Huntington 1031 Qualified Escrow Depository (Partner QI Network)** under Treas. Reg. § 1.1031(k)-1(g)(3).
  - Proceeds are held in a **Huntington Qualified Escrow Depository** yielding 4.75% during the statutory 45-day identification / 180-day closing window, under an **independent, unaffiliated Qualified Intermediary (IPX1031)**—retaining $2.9M in institutional deposits that would otherwise be wired to external exchange accommodators. Huntington's role is strictly limited to the routine banking safe harbor of Treas. Reg. § 1.1031(k)-1(k)(2)(ii); the bank does **not** act as Qualified Intermediary for its own borrower, and in-house DST/securities placement is firewalled for the duration of the exchange window to preserve the client's deferral.

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
│  ▸ 11,099 facilities screened    │                 │ [Doc Citation ⧉]  │  • Debt Payoff: $5,214,800      │
│  ▸ 3 qualified & staged          │                 ▼                   │  • Staged Sale Price: $8,500,000│
│  ▸ ~15 hrs manual discovery      │          [Marcus Vance]             │    [Slider: Adjust Sale Price]  │
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
*\*\* "Known HBAN Position" reflects only Huntington-resolvable balances: resolved deal equity ($2.9M) plus existing commercial operating balances ($2.1M). Book Scout does not compute or assert an aggregate personal net worth; any client-provided net-worth figure originates from the most recent PFS on file in the commercial credit file, not agent inference.*

* **Pane 1 (Priority Radar + Synthetic Capacity Meter):** Demonstrates dual-sided leverage explicitly—thousands of events screened, manual discovery absorbed, ongoing servicing hours unlocked, and live machine inference status. Each queue row exposes a **reasoning trace** whose footer opens the **Spanner Graph Grounding Console** (`[Spanner Graph]`), providing a visual, near-full-page network topology of entity and behavioral signals backed by Cloud Spanner Graph.
* **Pane 2 (Household Topology & Grounding Evidence):** Interactive entity graph mapping commercial LLCs to beneficial owners, equipped with clickable citation pills linking directly to document bounding boxes.
* **Pane 3 (Agent Staging Console):** Command center showing grounded calculations, real-time indicative valuation slider, 1031 tax routing toggle, GLBA consent gate indicator, and wire instruction generation.

---
## 4. Simplified Technical Architecture

Book Scout utilizes a clean **Single Orchestrator + Deterministic Tools** pattern built natively on the **Gemini Enterprise Agent Platform (fka Vertex AI Platform)**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BOOK SCOUT PROTOTYPE STACK                                      │
├───────────────────────────────┬─────────────────────────────────┬───────────────────────────────┤
│ DATA INGESTION & STORAGE      │ REASONING ORCHESTRATOR          │ GOVERNANCE & UI INTEGRATION   │
│ • Core Servicing (core servicing) │ • Gemini Enterprise Agent       │ • Apigee X API Gateway        │
│ • Cloud Pub/Sub (Event Bus)   │   Platform (gemini-3.7-flash)   │ • CRM Embedded Application    │
│ • Cloud Spanner (Entity Graph)│ • Vertex AI Search (Grounding)  │ • DocuSign REST APIs          │
│ • BigQuery (Credit Vault)     │ • Deterministic Cloud Run Tools │ • SEI Wealth Platform Gateway │
│ • Memorystore (Redis Cache)   │   - Payoff Calculator Tool      │ • 1031 QI Custody Gateway     │
│ • VPC Service Controls (VPC-SC│   - Grounded Valuation Tool     │ • Audit Logger (Dual-ID)      │
│ • Cloud KMS (Customer Keys)   │   - 1031 Exchange Detector      │ • Zero-Data Logging Boundary  │
│                               │   - Exclusion Sentry Filter     │                               │
└───────────────────────────────┴─────────────────────────────────┴───────────────────────────────┘
```

### 4.1 Native Multimodal Grounding vs. Document AI Redundancy
Rather than running multi-hop OCR through Document AI and passing text dumps to an LLM, Book Scout leverages **Gemini 3.7 Flash native multimodal document understanding**. It ingests raw scanned PDFs/TIFFs directly, preserving 2D spatial layouts, notary stamps, signature lines, and complex settlement tables, returning structured JSON paired with **pixel bounding-box coordinates** for UI grounding.

### 4.2 Deterministic Tool Boundary
The LLM is strictly confined to unstructured document understanding, contextual planning, and narrative drafting. All financial arithmetic and regulatory filtering are executed by deterministic code:
* `CalculatorTool.compute_payoff()`: Calculates exact UPB per diem interest based on contractual day counts.
* `CalculatorTool.capitalize_noi()`: Computes indicative valuation (NOI ÷ cap rate) and net equity proceeds; inputs are grounded by Vertex AI Search, arithmetic is executed by deterministic code.
* `TenThirtyOneDetectorTool.evaluate()`: Checks bank-held records for a named Qualified Intermediary or a borrower request for exchange coordination, toggling settlement routing between Business Premier ICS and QI Escrow Custody. The bank is not a party to the exchange agreement and does not receive it, so a negative result is a presumption rather than a finding.
* `ExclusionSentryTool.screen()`: Evaluates objective regulatory risk ratings and minimum liquidity hurdles under strict deterministic parameters. It prioritizes retention outreach and makes no credit decision, so ECOA / Reg B is not the operative regime.

### 4.3 High-Fidelity Signal Grounding via Google Cloud Spanner Graph (ISO GQL)
To eliminate hallucination and prove how autonomous detection agents achieve high-fidelity liquidity classifications (e.g., 94% confidence on commercial sale cash-out vs. 96% on 1031 exchange vs. 91% on refinance), Book Scout integrates natively with **Google Cloud Spanner Graph**:
1. **Deterministic Graph Topology:** Organizes enterprise commercial relationships across 5 connected ontological tiers:
   - *Data Ingestion Core:* core servicing feeds, title insurance demands (RightFax eFax), county deed records, and commercial LOS pipelines.
   - *Contract & Entity Layer:* Commercial notes, pass-through borrowing LLCs, and incumbency certificates.
   - *Beneficial Owners & Guarantors:* Natural-person sponsors (e.g. Marcus Vance 85% unconditional guarantor vs. Elena Vance 15% non-guarantor shielded by GLBA).
   - *Behavioral Signal Features:* In-place replacement debt audits (commercial LOS), escrow wire routing destinations (commercial DDA vs. statutory escrow), and Qualified Intermediary (QI) presence.
   - *Verdict Node:* Target liquidity classification with deterministic confidence calibration.
2. **Spanner Graph Grounding Console:** An interactive, near-full-page modal accessible via `[Spanner Graph]` in the footer of each deal's reasoning-trace panel, rendering an SVG network graph with interactive node inspection, real-time Spanner ISO GQL query telemetry, and dynamic multi-deal topology comparison.

### 4.4 Cloud Run Prototype Monostack & Security Implementation
To guarantee zero-cost idle operation, rapid executive iteration, and enterprise-grade security, the Book Scout working demonstration conforms strictly to Google Cloud Run standardized monostack architecture:
1. **Monostack Container Architecture:** 
   - **Frontend:** React 18 + Vite + Tailwind CSS + shadcn/ui primitives.
   - **Backend:** Python 3.11 FastAPI application serving APIs and the compiled SPA bundle.
   - **Multi-Stage Container:** Hardened `Dockerfile` running as non-root `appuser` on `python:3.11-slim`, listening on `0.0.0.0:${PORT:-8080}`.
2. **Cloud Run Native Identity-Aware Proxy (IAP) & DRS Compliance:**
   - Deployed with `--iap --no-invoker-iam-check --no-allow-unauthenticated --ingress=all`.
   - **DRS Org Policy Protection:** Zero GCP project-level IAM bindings for `domain:google.com`; end-user access is granted directly at the Cloud Run IAP resource level (`roles/iap.httpsResourceAccessor`).
   - **Cryptographic JWT Verification:** FastAPI backend cryptographically validates the `X-Goog-IAP-JWT-Assertion` header using cached Google public keys, verifying audience (`/projects/${PROJECT_NUMBER}/locations/${GCP_REGION}/services/${APP_NAME}`) and user email.
3. **Credentials & Resource Governance:**
   - **Zero Service Account Keys:** Zero JSON keys generated or downloaded. Local dev uses Application Default Credentials (ADC) via `gcloud auth application-default login`; Cloud Run uses a dedicated runtime Service Account (`huntington-book-scout-sa`, $\le 30$ chars) with least privilege (`roles/aiplatform.user`).
   - **Scale-to-Zero Idle Defaults:** Deployed with `--min-instances=0` (zero compute cost when idle) and `--max-instances=3` (safety cap).
   - **Local Host Binding Invariant:** Local servers listen strictly on `127.0.0.1:${LOCAL_PORT:-8080}`; local Vite dev server proxies `/api` and `/ws`.
4. **Mandatory Admin Panel & Diagnostic Telemetry:**
   - **Gear Icon:** Positioned on the **far right** of the primary application header (`<Settings className="w-4 h-4" />`), opening a slide-over technical sheet.
   - **Diagnostic Telemetry Badges:** Displays live badges for AI Platform (**Gemini Enterprise Agent Platform (fka Vertex AI Platform)**), Model Baseline (`gemini-3.7-flash`), GCP Project (`hban-wealth-innovation`), Runtime Service Account (`huntington-book-scout-sa`), and IAP Auth status.
   - **Quick Links:** Direct links to interactive `/brand_kit.html` and `/demo_script.html`.

---
## 5. Explicit Operational & Regulatory Boundaries (What We Do NOT Do)

1. **No Core Loan Servicing:** Book Scout does not process interest payments, principal curtailments, or escrow disbursements.
2. **No Payoff Execution:** Book Scout calculates indicative payoff figures for planning; it does not execute wire transfers or extinguish debt.
3. **No Legal Lien Releases:** Book Scout does not generate or record mortgage satisfactions, deed reconveyances, or UCC-3 termination filings. These remain strictly within loan operations and settlement agent controls.
4. **No Replacement of Licensed Advice (Advice Guardrail):** Book Scout absorbs *administrative* discovery and onboarding scaffolding only. It does **not** conduct fiduciary discovery, render suitability determinations, or author investment recommendations. All KYC/CIP entries, SEI allocation models, and draft IPS documents are **draft scaffolding requiring licensed-advisor review and authorship**; the licensed advisor owns every suitability and investment decision. This guardrail is written to satisfy whichever standard governs the destination channel — **OCC Reg 9 (12 C.F.R. § 9)** fiduciary duties for Private Bank trust/discretionary relationships, or **SEC Reg BI** / FINRA 2111 for HFA retail brokerage relationships on the Ameriprise platform. See `CITATIONS.md` §1a.
5. **No Aggregate Net-Worth Inference:** Book Scout surfaces only Huntington-resolvable positions and documented credit application facts; it does not compute or assert total personal net worth.
6. **GLBA & FCRA Quarantined Consent Gate:** Financial information obtained from commercial credit agreements is strictly quarantined. Staged wealth profiles are not injected into SEI Wealth Platform or retail CRM until the commercial RM records the borrower's **affirmative verbal consent** during the T-12 call.
7. **Model Risk Management (OCC Bulletin 2011-12 / Fed SR 11-7):** Property valuations and proceeds estimates produced by Book Scout are designated as **"Indicative Triage Estimates for Relationship Prioritization."** They are never used for credit underwriting, collateral evaluation, or regulatory capital calculations, exempting the workflow from full-scale credit model validation mandates while upholding model governance standards.
8. **Objective Prioritization Controls (no credit decision):** Borrower prioritization by Exclusion Sentry is governed strictly by objective, deterministic parameters (regulatory credit rating Pass Tier 1/2 and $\ge \$500,000$ net liquidity floor). Zero demographic or socioeconomic machine-learning scoring is utilized. Property geography enters only through market cap-rate benchmarking for valuation, never as an eligibility criterion. The Sentry prioritizes retention outreach rather than deciding credit, so ECOA / Regulation B and its adverse-action obligations are not engaged; the controls are held as a conservative internal standard.

---
## 6. Financial Model — Dual-Sided Capacity Leverage & Retained Value

Book Scout's value is presented in two linked layers: **(A) capacity leverage** (the core headcount-scaling thesis across both Commercial and Wealth) and **(B) retained financial value**.

### 6.1 Layer A — Dual-Sided Capacity Leverage (The Core Thesis)

| Metric | Manual Baseline (Today) | With Book Scout |
| :--- | :---: | :---: |
| **Commercial** discovery + staging per qualified deal | ~6–8 hours (RM, 3 systems) | ~4 minutes (agent) + ~4 min (RM call) |
| **Wealth** onboarding effort per new relationship | ~4–6 hours; ~2–3 weeks elapsed | ~80% pre-staged; ~3 days elapsed |
| **Wealth** ongoing fiduciary servicing capacity | ~80 relationships per PWA | **~95–100 relationships per PWA (+20–25%)** (automated review dossiers + 2x CSA leverage) |
| Portion of the payoff book monitorable in real time | Effectively **<5%** (capacity-bound) | **100%** |
| IRC §1031 exchange liquidity captured | **0%** (wires out to 3rd-party accommodators) | **Captured in Huntington Qualified Escrow Depository** (independent QI: IPX1031) |
| Net new RM **or** PWA headcount required to scale | Requires material FTE additions | **Zero net new headcount** |

> **The Headcount Sentence:** *Commercial discovery was un-staffable at book scale, and wealth onboarding and ongoing servicing throttled advisor capacity at 80 accounts. Book Scout absorbs both—surfacing invisible opportunities, accelerating onboarding from weeks to days, and providing automated servicing dossiers and 2x CSA operational leverage that expand advisor capacity to 95–100 accounts (+20–25%). This converts an un-staffable workload into an automated one on both sides of the bank with zero net new headcount.*

### 6.2 Layer B — Retained Financial Value (Interactive Sensitivity)

> [!IMPORTANT]
> **This is the upside case, not the base case.** The primary business case is §6.2a
> (reclaimed capacity), which is derived entirely from Huntington's own published
> filings. The retained-liquidity model below depends on four inputs that no public
> source can settle, each capable of moving the answer by roughly 2x. It is presented
> so the room can set those inputs, not so the presenter can defend them.

**Portfolio baseline — the funnel, not a headline number**

An earlier version of this model multiplied a "$4.5B payoff book" by a capture rate. That headline is **superseded** and must not be reused.
That conflated four distinct steps. The corrected derivation is explicit at each stage:

| Step | Value | Provenance |
| :--- | ---: | :--- |
| Investor CRE, net of the small-business tranche | **$19.97B** | Verified — 10-Q Table 8 less Call Report RC-C Part II |
| Plus owner-occupied CRE (booked inside C&I) | **$13.33B** | Verified — Call Report RC-C Part I |
| **Target book** | **$33.30B** | Verified |
| × 22.5% 12-month turnover | $7.49B | Derived — Call Report Memo 4 (16.6% all-book × 1.36 CRE premium) |
| × 27% disposition rather than refinance | $2.02B | **Estimate** — industry default |
| × 57% net seller equity at ~60% LTV | $1.15B | **Estimate** — industry default |
| × 78% flight rate absent intervention | **$0.90B** | **Estimate** — 70–85% benchmark band |

`$0.90B` is the equity actually in play in a year. The recapture slider acts on *that*
pool, not on the loan book.

**Value levers, with duration applied**

* Tier 1 (Treasury ICS & 1031 Escrow): 65% of recaptured funds @ 85 bps net NIM
* Tier 2 (Wealth AUM): 35% of recaptured funds @ 65 bps advisory fee
* Annual enterprise cloud & operating run-rate: **($1.25M)**

> [!WARNING]
> **Duration correction.** Tier 1 balances are 1031 exchange escrow and treasury
> float. IRC §1031 imposes a statutory 180-day maximum, so these are transient
> balances modeled at **120 days average duration** — not standing deposits. The
> undiscounted blended margin of `(0.65 × 85) + (0.35 × 65)` = **78.0 bps** is
> therefore wrong. The effective blended yield is
> `(0.65 × 85 bps × 120/365) + (0.35 × 65 bps)` = **40.9 bps**.

| Recapture of At-Risk Equity | Retained Liquidity | Gross Annual Value | Cloud & Op Cost | Net Annual ROI |
| :---: | :---: | :---: | :---: | :---: |
| **10%** | $89.9M | $368,000 | ($1,250,000) | **($882,000) / yr** |
| **20%** | $179.9M | $736,000 | ($1,250,000) | **($514,000) / yr** |
| **30%** | $269.8M | $1,104,000 | ($1,250,000) | **($146,000) / yr** |
| **34.0% — break-even** | $305.7M | $1,250,000 | ($1,250,000) | **$0 / yr** |
| **50%** | $449.7M | $1,840,000 | ($1,250,000) | **+$590,000 / yr** |

**Break-even requires recapturing 34% of all fleeing seller equity.** That is a real
target, but it is not a floor, and it must not be presented as one.

* **Assumption provenance:** the **65 bps Tier 2 advisory fee is derived from HNB
  Call Report Schedule RC-T (2026-06-30)**, which implies 65.7 bps — the model holds
  65.0, 1.1% conservative. See [CITATIONS.md §2b](./CITATIONS.md). The **85 bps Tier 1
  net NIM remains an internal management estimate** pending Treasury FTP confirmation.
  The disposition share, equity ratio, and flight rate are **industry defaults**, not
  Huntington figures. All are adjustable live via the Admin Panel; the model lives in
  [`frontend/src/lib/assumptions.ts`](../frontend/src/lib/assumptions.ts).
* **Sensitivity ranking (what to pressure-test first):** flight rate (highest), then
  Tier 1/Tier 2 bps, then disposition share and equity ratio. Turnover is the *least*
  uncertain input — it is derived from Huntington's own Call Report.
* *(Note on "Cost Recovery": that column measures how long gross annual value takes to
  cover the $1.25M annual operating run-rate. It is **not** a capital payback period —
  no build/implementation cost is modeled.)*
* *(Note: preserving at-risk commercial credits from refinancing away represents
  additional preserved loan NIM, treated as upside and excluded from headline figures.)*

### 6.2a Layer C — Reclaimed Capacity (Primary Business Case)

Unlike §6.2, every input here traces to a Huntington disclosure. Nothing in this
section requires the bank to reveal internal performance data.

| Input | Value | Provenance |
| :--- | ---: | :--- |
| Commercial Banking direct personnel costs, 6 months | $393M | Verified — 10-Q Table 25 |
| Commercial Banking average FTE | 2,689 | Verified — 10-Q Table 25 |
| **Fully loaded cost per FTE per year** | **$292,302** | Derived — `$393M × 2 ÷ 2,689` |
| Annual payoff events at $3M average loan | ~2,497 | Derived — `$7.49B ÷ $3M` |
| Productive hours per FTE-year | 1,800 | Standard convention |

| Hours Reclaimed per Event | Hours Saved | FTE Equivalent | Annual Value | vs. $1.25M Run-Rate |
| :---: | :---: | :---: | :---: | :--- |
| **4 hrs (conservative)** | 9,989 | 5.5 | **$1.62M** | ✅ clears |
| **6 hrs (observed baseline)** | 14,984 | 8.3 | **$2.43M** | ✅ clears |

**The capacity case clears the run-rate on time savings alone, at the conservative
end of the band.** It rests on a single assumption — hours reclaimed per event — which
Huntington can validate internally within a week by timing the existing manual payoff
workflow. That is the argument to lead with.

### 6.3 Enterprise Operating Cost Breakdown ($1,250,000 Run-Rate Defense)
To satisfy CFO scrutiny, the $1.25M annual operating run-rate is componentized across cloud infrastructure, security, and dedicated engineering:

| Component | Annual Cost | Scope & Justification |
| :--- | :---: | :--- |
| **Gemini Multimodal Ingestion & Vertex AI Search** | $15,000 | ~12,500 multimodal document inferences/yr (≈2,500 liquidity events × 5 docs), grounding queries, and embeddings |
| **Cloud Spanner (Multi-Region HA Graph) & Pub/Sub** | $65,000 | Real-time commercial-to-personal household topology and event streaming |
| **Apigee X API Gateway & CRM Connectors** | $180,000 | Enterprise API management, mutual TLS, and CRM bidirectional sync |
| **Dedicated Platform Engineering & MLOps Pod** | $650,000 | 2 dedicated platform engineers (maintenance, CI/CD, prompt regression testing) |
| **Model Risk Governance, SOC2 & Security Audits** | $340,000 | Annual OCC Bulletin 2011-12 model validation, penetration testing, and VPC-SC compliance |
| **Total Annual Enterprise Operating Budget** | **$1,250,000** | **Fully-loaded production enterprise run-rate** |

---
## 7. Scripted 10-Minute Executive Demonstration Sequence

| Time | Presenter Actions & Spoken Dialogue | What is Shown in the Demo (UI & Model Feedback) | Production Implementation Blueprint | Executive Impact |
| :--- | :--- | :--- | :--- | :--- |
| **00:00–01:30** | **The Problem (Two-Sided Bottleneck & 1031 Flight):** Frame the goal: scaling wealth with existing headcount. A $33.3B commercial real estate book turning over ~$7.5B in payoffs a year that no human team can monitor; 1031 exchanges leaking to third parties; and wealth advisors capped at 80 clients. This is a capacity crisis end-to-end. | Context slide: $33.3B target book, ~$7.5B annual payoff volume, ~$899M of seller equity at risk of leaving the bank, two-sided bottleneck diagram (Commercial discovery drag vs. Wealth onboarding/servicing wall). | BigQuery analytical telemetry on historical loan payoffs; Cloud Storage historical flight registry. | CEO & CFO align: doing more with existing headcount across both lines of business. |
| **01:30–03:30** | **The Book No Human Can Watch:** Open Book Scout in FSC. Point to the **Synthetic Capacity Meter** (~15 hrs discovery absorbed, 3 active inferences running). Show First American Title's payoff surfacing at T-12. | **Pane 1 (Priority Radar):** Synthetic Capacity Meter (`11,099 facilities screened ▸ 3 qualified & staged`). Dynamic critical queue sorted by close date. Green "Pass Tier 2" credit badge. | Google Cloud Pub/Sub ingesting core servicing events into Cloud Run event-driven microservices. | Head of Commercial sees leverage, not an intrusive time-and-motion audit. |
| **03:30–06:00** | **The Agentic Proof (Multimodal Grounding & Dynamic Slider):** Click Marcus Vance. Watch Gemini 3.7 Flash extract LLC ownership with **visual bounding-box highlights**. Show missing sale price resolved via trailing NOI grounded by Vertex AI Search ($8.5M @ 7.5% cap rate). Adjust the indicative valuation slider live from $8.5M to $9.0M. | **Pane 2 & 3:** Interactive household topology map with clickable source citations (`⧉ Credit Vault #CC-8821`). Live streaming token feedback; interactive slider dynamically re-computing net proceeds to $3.35M. | Gemini Enterprise Agent Platform (`gemini-3.7-flash`) native multimodal document understanding; Vertex AI Search grounding; Cloud Run `CalculatorTool`. | CTO & CIO see state-of-the-art multimodal AI; CFO sees automated analyst judgment. |
| **06:00–08:30** | **The Human Touch + The Wealth Bottleneck Solved:** Step into Greg's 4-minute call. Click **[Approve & Deliver Wire Form]**, generating First American's wire letter. Toggle **Persona Switcher** to Sarah Jenkins (PWA): show pre-staged KYC/CIP, SEI shell, and **Automated Quarterly Review Dossier**. Say: *"We achieve 2x CSA operational leverage, expanding senior PWA capacity to 95–100 relationships (+20–25%) while routing transactional accounts to our Centralized Wealth Hub."* | **Pane 3:** Generated PDF wire instruction letter with First American Title pre-filled. PWA view displays 80% completed KYC/CIP, pre-configured SEI shell, and quarterly relationship review template. | Apigee X API Gateway mTLS routing to SEI Wealth Platform Gateway; DocuSign REST APIs; Cloud Spanner household graph. | Head of Wealth sees onboarding friction solved AND ongoing advisor capacity expanded under Reg BI. |
| **08:30–09:15** | **Institutional Guardrails (CRO Defense):** Open compliance audit drawer: highlight green badges for **FINRA 2040 non-fee splitting**, **GLBA Quarantined Consent Gate**, **OCC Bulletin 2011-12 Triage Designation**, and **1031 QI Escrow routing**. | Slide-out compliance drawer displaying green verification badges, tamper-evident dual-ID hash, and zero-data-logging boundary certifications. | Cloud KMS customer-managed encryption keys (CMEK); VPC Service Controls (VPC-SC perimeter); Cloud Audit Logs immutable trail. | Chief Risk Officer sees airtight compliance, privacy, and model risk boundaries. |
| **09:15–10:00** | **The Bottom Line (Three Layers):** Show Layer A (zero net new headcount) and Layer C (**reclaimed capacity, $1.62M–$2.43M/yr, sourced entirely from 10-Q Table 25**). Then introduce Layer B retained liquidity **as upside**: walk the funnel to ~$0.90B at risk and move the recapture slider around the 34% break-even. Open the Admin Panel and change an assumption live. Show componentized $1.25M budget. Hand floor to CFO. | Capacity case card; at-risk equity funnel with provenance badges; recapture slider anchored on break-even; live assumption dials. | Interactive client-side model (`frontend/src/lib/assumptions.ts`); BigQuery ROI baseline model. | Executive Committee sees a scaling thesis whose primary case they can verify against their own filings, and a revenue case whose assumptions they set themselves. |

---
## 8. Demonstration Setup & Presentation Guardrails

1. **Resolution & Environment:** 1920x1080 full screen, embedded in styled Salesforce Financial Services Cloud.
2. **Realistic Midwest Domain Data:** All names, addresses, and figures reflect realistic Columbus, OH commercial assets. Zero placeholder text.
3. **Live Streaming Reasoning Protocol:** Agentic reasoning over the title letter runs live via Gemini Enterprise Agent Platform (`gemini-3.7-flash`) with streaming token feedback and tool-execution indicators. A backup document (*Apex Logistics Payoff Request.pdf*) is pre-loaded to re-run extraction live on stage if challenged.
4. **Deterministic Fallback Layer:** Background CRM lookups and static UI elements utilize an encrypted local Redis cache to guarantee sub-second UI responsiveness regardless of conference Wi-Fi.
5. **Interactive Controls:** The **Indicative Valuation Slider**, **1031 Tax Strategy Toggle**, **Persona Switcher**, and **ROI Sensitivity Slider** are built natively into the frontend for live audience interaction.
6. **Show-vs-Tell Ledger:** 
   - *Live on Screen:* Multimodal bounding-box extraction, grounded cap-rate calculation, 1031 escrow routing toggle, wire instruction PDF generation, and staged KYC/IPS scaffolding.
   - *Staged Representations:* The final DocuSign signature and automated core wire execution are represented as completed staged states to preserve the 10-minute briefing tempo.

---
### Anticipated Executive Q&A (Presenter Prep)

* **"How does this scale wealth management with existing headcount if advisors are already at capacity?"**  
  → Book Scout eliminates both wealth bottlenecks: it compresses administrative onboarding from ~3 weeks to ~3 days, and provides automated quarterly review dossiers and 2x CSA operational leverage that expand advisor capacity from 80 to 95–100 relationships (+20–25%) without adding staff. We deliberately do **not** claim 150 accounts per advisor — high-touch fiduciary maintenance makes that infeasible; sub-$3M transactional accounts route to the Centralized Wealth Advisory Hub instead (§1.2, §6.1).

* **"What if the borrower is doing a 1031 exchange? Won't the deposit leave anyway?"**  
  → That’s why Book Scout includes native 1031 detection. When an exchange is identified, proceeds are routed into a **Huntington Qualified Escrow Depository** under Treas. Reg. § 1.1031(k)-1(g)(3), administered by an **independent, unaffiliated Qualified Intermediary (IPX1031)**. Huntington cannot serve as QI for its own borrower under the disqualified-person rules of Treas. Reg. § 1.1031(k)-1(k), so the bank's role is confined to the routine banking safe harbor as escrow depository. This preserves institutional deposits during the 180-day exchange window without jeopardizing the client's deferral (§1.1, §2 Step 7).

* **"If commercial RMs never did this work, how can we claim capacity leverage?"**  
  → We don’t claim saved hours on work people were doing; we claim **manual discovery absorbed**—work that was un-staffable at book scale. Book Scout monitors 100% of the book and hands the RM a pre-screened, ready-to-call relationship, converting invisible liquidity into actionable pipeline (§1.1, §2 Step 2).

* **"How do you ensure the agent didn't hallucinate the 7.5% cap rate or property value?"**  
  → Valuations are strictly grounded via Vertex AI Search against internal commercial appraisal benchmarks and regional indices, paired with deterministic arithmetic tools. Every metric in the dossier displays a clickable source citation badge (§2 Step 3, §4.2).

* **"Does using commercial credit files to cross-sell wealth violate GLBA or Fair Lending?"**  
  → No. All wealth staging remains quarantined behind an internal compliance gate until the commercial RM records the borrower's verbal opt-in consent during the T-12 call. Disqualifications by Exclusion Sentry rely solely on objective regulatory credit ratings and liquidity thresholds. No credit decision is made, so ECOA / Reg B and its adverse-action obligations are not engaged; we hold the objective-input discipline as a conservative internal standard anyway (§5.6, §5.8).

* **"Why does it cost $1.25M annually to process 2,000 payoffs?"**  
  → The compute is minimal ($15k/yr); the $1.25M fully-loaded budget funds high-availability Cloud Spanner, Apigee X integration, enterprise compliance audits, and a dedicated 2-person platform engineering and MLOps pod (§6.3).

* **"Does this automate investment advice or violate Reg BI?"**  
  → Absolutely not. Book Scout produces administrative drafting and operational scaffolding only. Every suitability determination, risk tolerance evaluation, and asset allocation decision is authored and signed by the licensed Series 7/66/CFP advisor (§5.4).

---
*Huntington Book Scout v5.2 Specification — Built to prove dual-sided agentic capacity leverage: scaling wealth management with existing headcount across both Commercial and Wealth.*