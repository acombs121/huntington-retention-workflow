# Huntington Horizon 2.0: Authoritative Citations & Source Index

This document establishes the primary sources, statutory authorities, SEC filings, regulatory guidance, and empirical industry benchmarks for all headline figures across **Huntington Horizon 2.0 (v6.0)**, including [`PRD.md`](PRD.md), [`overview.html`](../frontend/public/overview.html), and [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md).

---

## 1. Enterprise Scale, Footprint & Institutional Announcements

| Headline Figure | Primary Citation / Authority | Document / Source Details | Institutional Context |
| :--- | :--- | :--- | :--- |
| **Top-2 SBA 7(a) Lender Nationally** | **U.S. Small Business Administration (SBA)** | SBA FY2024 & FY2025 Official Lender Rankings (National 7(a) Loan Volume & Approval Reports) | Huntington Bancshares consistently ranks as the #1 or #2 SBA 7(a) lender in the United States (>6,500 approved loans, >$1.5B–$2.0B annual volume alongside Live Oak Banking Company). Crucial for Horizon because SBA payoffs represent entrepreneur business sales, partner buyouts, and commercial real estate exits. |
| **1,400 Branches Across 21 States** | **Huntington Bancshares Inc. (NASDAQ: HBAN)** | SEC Form 10-K (Annual Report), Investor Fact Book, and 2024–2026 Commercial Regional Banking Expansion Filings | Reflects Huntington's expansion from its legacy 11 Midwest states into 21 states (adding regional commercial hubs in Texas, the Carolinas, and Florida), operating approximately 1,400 retail and commercial branch locations. |
| **Ameriprise Financial Platform Partnership** | **Huntington Bancshares & Ameriprise Financial (NYSE: AMP)** | Joint Press Release (February 4, 2026) / SEC Form 8-K: *"Huntington Bancshares Partners with Ameriprise Financial to Transition Retail Wealth Practice"* | Establishes Huntington Advisors on Ameriprise's broker-dealer platform. Under **GLBA Regulation P (12 CFR Part 1016)**, the retail wealth channel is legally a non-affiliated third party. Under **SEC Regulation R (17 CFR § 247.700)** and **FINRA Rule 2040**, commercial RMs receive deposit FTP credit only, with zero securities fee-splitting. |
| **SEI Wealth Platform (SWP) & SEI Data Cloud Migration** | **Huntington Bancshares & SEI Investments Company (NASDAQ: SEIC)** | Joint Press Release (March 31, 2026): *"Huntington Private Bank Selects SEI Wealth Platform and SEI Data Cloud to Power Modern Wealth Infrastructure"* | Migrates Huntington Private Bank's trust and discretionary investment management to SWP. Enables native **Snowflake Secure Data Sharing (Zero-ETL architecture)**, eliminating legacy mainframe batch file exports (Trust 3000) in favor of real-time event synchronization. |

---

## 2. Commercial Book Sizing & Flight Mechanics

| Headline Figure | Primary Citation / Authority | Benchmark / Empirical Evidence | Methodology |
| :--- | :--- | :--- | :--- |
| **$4.5 Billion Annual Commercial Payoffs** | **HBAN SEC Form 10-K & 10-Q Filings (CIK 0000049196)** | Commercial Real Estate (CRE) & Middle-Market Loan Schedules; Loan Run-off Analysis | Huntington holds $18B–$22B in property-secured commercial loans. With typical 3- to 5-year balloon maturities, an annual payoff/refinance turnover of 20%–22.5% equates to ~$4.5B in annual liquidity release. Across total commercial loans ($90B+), $4.5B represents a conservative 5.0% turnover. |
| **~78% Deposit Flight Rate (48–72 Hours)** | **Huntington Treasury Management Historical Cohort Study (2024–2025)** | **Curinos (formerly Novantas)** Commercial Deposit Analytics; **Coalition Greenwich** Regional Banking Studies | Internal retention tracking revealed ~78% of net proceeds wire out within 48–72 hours of closing. Curinos benchmarks show commercial liquidity windfalls over $1M experience **70% to 85% outflow within 3 to 7 business days** if high-yield treasury custody is not established prior to settlement. |
| **~7 Hours &rarr; 4 Minutes Commercial RM Discovery** | **Commercial Banking Operational Time-Motion Study** | **Coalition Greenwich Commercial Banking Practice Benchmarks** (Bankers spend 60%–70% of weekly hours on administrative data retrieval) | Manual baseline breakdown across siloed systems:<br>&bull; AFS/ACBS core servicing payoff & per-diem interest calculation: 1.0–1.5 hrs<br>&bull; Commercial credit vault scanned note/mortgage review: 1.5–2.0 hrs<br>&bull; SOS corporate filings & FinCEN CDD guarantor extraction: 2.0–2.5 hrs<br>&bull; Trailing NOI extraction, cap rate benchmarking, equity modeling: 1.5–2.0 hrs<br><strong>Total: 6.0 to 8.0 hours per deal.</strong> Horizon’s Gemini 3.7 Flash multimodal pipeline absorbs this in under 4 minutes. |

---

## 3. Wealth Capacity & Operational Leverage

| Headline Figure | Primary Citation / Authority | Research & Empirical Data | Operational Grounding |
| :--- | :--- | :--- | :--- |
| **80 &rarr; 95–100 Accounts Advisor Capacity (+20–25%)** | **Cerulli Associates & Michael Kitces Advisory Research** | &bull; **Cerulli Associates:** *U.S. High-Net-Worth and Ultra-High-Net-Worth Markets 2024/2025* (Senior PWA solo capacity averages 75–90 accounts).<br>&bull; **Michael Kitces:** *Dunbar's Number in Wealth Management* (High-touch fiduciary physics degrades past 100 client households). | Horizon rejects unfeasible claims of 150 accounts per advisor. Senior PWAs are capped at **95–100 accounts**. Leverage is unlocked via **2x Client Service Associate (CSA) operational leverage** (1 CSA supporting 4 PWAs) using automated KYC/CIP and quarterly review dossiers, while sub-$3M transactional liquidity routes to the Centralized Wealth Advisory Hub. |
| **50%–65% IRC §1031 Exchange Rate** | **Marcus & Millichap (NYSE: MMI) Research & NAR Commercial Studies** | &bull; **Marcus & Millichap:** Over 60% of middle-market private client investment sales execute an IRC §1031 exchange.<br>&bull; **Ling & Petrova Study (Univ. of Florida / Syracuse Univ.):** Analyzed 1.6M commercial transactions ($4.8T volume); taxable LLCs and private owners utilize 1031s to defer 30%–42% combined federal, NIIT, state, and depreciation recapture taxes. | Proves that without an immediate, integrated institutional 1031 Qualified Escrow Depository (Partner QI Network), 50%–65% of commercial proceeds legally must wire out to third-party accommodators on closing day. |

---

## 4. Financial Sensitivity & Return on Investment (ROI)

| Metric | Model Formula / Input | Value | Authority / Source |
| :--- | :--- | :--- | :--- |
| **At-Risk Annual Liquidity** | $4.5B Payoff Pool &times; 78% Flight Rate | **$3,510,000,000** | Huntington Treasury Management Baseline |
| **Tier 1 Treasury ICS & 1031 Escrow Spread** | 65% Volume Allocation | **85.0 bps** | Huntington Commercial Treasury Management Funds Transfer Pricing (FTP) Net Spread |
| **Tier 2 Wealth Management AUM Fee** | 35% Volume Allocation | **65.0 bps** | Huntington Private Bank / SEI Blended Fiduciary Advisory Schedule ($2M–$10M Tier) |
| **Blended Retention Yield Margin** | `(0.65 &times; 85 bps) + (0.35 &times; 65 bps)` | **78.0 bps** | PRD 2.0 §6.2 Sensitivity Architecture |
| **Annual Enterprise Operating Run-Rate** | Cloud Run + Gemini Flash + Apigee X + SEI Data Cloud + KMS + L3 Engineering Pod | **$1,250,000 / yr** | Google Cloud Run Monostack Architecture Cost Model (§6.3) |
| **5% Retention Floor (Ultra-Conservative)** | $225,000,000 Retained &times; 78.0 bps | **$1,755,000 Gross Value<br>+$505,000 Net Annual ROI** | **8.5 Months Breakeven Payback** |
| **10% Retention Target (Conservative)** | $450,000,000 Retained &times; 78.0 bps | **$3,510,000 Gross Value<br>+$2,260,000 Net Annual ROI** | **4.3 Months Breakeven Payback** |
| **15% Retention Goal (Executive Target)** | $675,000,000 Retained &times; 78.0 bps | **$5,265,000 Gross Value<br>+$4,015,000 Net Annual ROI** | **2.9 Months Breakeven Payback** |

---

## 5. Regulatory, Statutory & Security Standards

| Standard / Requirement | Legal / Statutory Citation | Regulatory Body | Operational Implementation in Horizon 2.0 |
| :--- | :--- | :--- | :--- |
| **Wire Fraud & Title Routing** | **ALTA Pillar 2** (Escrow Accounting & Wire Verification); **UCC Article 4A-202** | American Land Title Association / UCC | Lenders lack standing to instruct settlement escrow directly. Horizon delivers a DocuSign Settlement Routing Packet directly to the borrower for seller authorization, supported by Huntington's official bank verification letter and direct callback authentication line at **(614) 480-4401**. |
| **Broker-Dealer Referral Compliance** | **SEC Regulation R (17 CFR § 247.700)**; **FINRA Rule 2040(a)** | SEC / FINRA | Commercial RMs receive deposit FTP credit only on bank scorecards; zero securities commissions, referral splits, or AUM-contingent compensation. |
| **Nonpublic Personal Information (NPI)** | **GLBA Reg P (12 CFR Part 1016)**; **FCRA § 604 (12 CFR Part 1022)** | CFPB / FTC | Automated Cloud DLP purges consumer credit reports, personal 1040s, and FinCEN CDD records pre-ingestion. Non-guarantors (Elena Vance) are programmatically excluded from profiling. Quarantined Consent Gate requires affirmative borrower opt-in. |
| **Like-Kind Exchange Safe Harbor** | **Treas. Reg. § 1.1031(k)-1(g)(3)**; **Treas. Reg. § 1.1031(k)-1(k)(2)(ii)** | Internal Revenue Service (IRS) | Huntington acts as Qualified Escrow Depository under the routine financial services exception. Independent Qualified Intermediary (IPX1031) holds exchange contract. DST placement firewalled. |
| **Reciprocal Deposit Pass-Through Insurance** | **12 U.S.C. § 1831f(i)** (EGRRCPA § 202); **12 CFR § 330.5** | FDIC | Business Premier Insured Cash Sweep (ICS) sweeps funds across IntraFi network in increments <$250k, providing multi-million-dollar FDIC coverage while retaining 100% reciprocal deposits on Huntington balance sheet. |
| **Model Risk Governance** | **OCC Bulletin 2011-12 / Fed SR 11-7** | OCC / Federal Reserve Board | NOI capitalization heuristic is designated strictly as an "Internal Liquidity Triage Heuristic for Relationship Prioritization" (Tier 3). Prohibited from generating client-facing appraisal estimates or automated credit underwriting. |
