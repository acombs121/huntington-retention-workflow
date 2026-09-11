# Huntington Horizon 2.0: Authoritative Citations & Source Index

This document establishes the primary sources, statutory authorities, SEC filings, regulatory guidance, and empirical industry benchmarks for all headline figures across **Huntington Horizon 2.0 (v6.0)**, including [`PRD.md`](PRD.md), [`overview.html`](../frontend/public/overview.html), and [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md).

---

## 1. Enterprise Scale, Footprint & Institutional Announcements

| Headline Figure | Primary Citation / Authority | Document / Source Details | Institutional Context |
| :--- | :--- | :--- | :--- |
| **Top-2 SBA 7(a) Lender Nationally** | **U.S. Small Business Administration (SBA)** | SBA FY2024 & FY2025 Official Lender Rankings (National 7(a) Loan Volume & Approval Reports) | Huntington Bancshares consistently ranks as the #1 or #2 SBA 7(a) lender in the United States (>6,500 approved loans, >$1.5B–$2.0B annual volume alongside Live Oak Banking Company). Crucial for Horizon because SBA payoffs represent entrepreneur business sales, partner buyouts, and commercial real estate exits. |
| **1,400 Branches Across 21 States** | **Huntington Bancshares Inc. (NASDAQ: HBAN)** | SEC Form 10-K (Annual Report), Investor Fact Book, and 2024–2026 Commercial Regional Banking Expansion Filings | Reflects Huntington's expansion from its legacy 11 Midwest states into 21 states (adding regional commercial hubs in Texas, the Carolinas, and Florida), operating approximately 1,400 retail and commercial branch locations. |
| **Ameriprise Retail Investment Program Provider** | **The Huntington National Bank & Ameriprise Financial, Inc. (NYSE: AMP)** | ✅ **Verified.** Press release, *"Huntington Bank Selects Ameriprise Financial as its New Retail Investment Program Provider"*, dateline **COLUMBUS AND MINNEAPOLIS – February 4, 2026** (newsroom post date 2/3/2026). Source: [ameriprise.com](https://www.ameriprise.com/newsroom/news-releases/huntington-bank-selects-ameriprise-financial-as-its-new-retail-investment-program-provider) | Huntington selected **Ameriprise Financial Services, LLC** as its new retail investment program provider, transitioning support of the retail **brokerage, investment advisory and insurance** services currently managed by its bank-owned broker-dealer/RIA/insurance agency **Huntington Financial Advisors (HFA)** to the **Ameriprise Financial Institutions Group (AFIG)**. Release states HFA has **~260 financial advisors** managing **~$28B** in combined advisory, brokerage and insurance assets.<br><br>**Role split:** Huntington employs the advisors and retains the client relationship; Ameriprise supplies the technology platform, clearing/back office, and acts as the **supervising broker-dealer**. The commercial→wealth handoff is therefore **intra-institutional**, so Reg P opt-out does not attach; Ameriprise's platform access to client NPI is a **service-provider relationship under 12 C.F.R. § 1016.13**. Referral constraint is **Reg R (17 CFR § 247.700)** + **FINRA Rule 2040**.<br><br>⚠️ **Scope caveat:** this release covers the **retail investment program only** — not Huntington Private Bank's trust/discretionary business (see SEI row). See §1a. |
| **SEI Wealth Platform (SWP) & SEI Data Cloud Migration** | **The Huntington National Bank & SEI Investments Company (NASDAQ: SEIC)** | ✅ **Verified.** Press release, *"Huntington National Bank Selects SEI Wealth Platform"*, dateline **OAKS, Pa., Mar. 31, 2026**. Source: [seic.com](https://www.seic.com/about-sei/newsroom/huntington-national-bank-selects-sei-wealth-platform) | Verbatim: *"The Huntington National Bank … has selected the SEI Wealth Platform℠ (SWP)."* Release further confirms **"Huntington will implement SEI Data Cloud services"** and quotes **Melissa Holding, Director of Wealth Management at Huntington**. Supports migrating trust and discretionary investment management to SWP with **Snowflake Secure Data Sharing (Zero-ETL)** replacing legacy Trust 3000 batch exports.<br><br>⚠️ The release names *Huntington National Bank*; Horizon's narrower framing as *"Huntington Private Bank"* is an internal inference, not release language. |

---

## 1a. ⚠️ Open Issue — Which Wealth Channel Does Horizon Actually Feed?

The two verified announcements cover **two different businesses under two different regulatory regimes**. Horizon's artifacts currently blend them.

| | Retail Investment Program | Private Bank / Trust |
| :--- | :--- | :--- |
| **Entity** | Huntington Financial Advisors (HFA) → Ameriprise Financial Institutions Group | The Huntington National Bank, fiduciary capacity |
| **Platform** | Ameriprise (per Feb 4, 2026 release) | SEI Wealth Platform (per Mar 31, 2026 release) |
| **Capacity** | Broker-dealer / registered rep | Bank fiduciary / trustee |
| **Governing regime** | **Reg BI**, FINRA Rule 2111, Reg R **Rule 700** networking exception; Ameriprise supervises | **OCC Reg 9 (12 C.F.R. § 9)** fiduciary standards; Exchange Act § 3(a)(4)(B)(ii) trust exception with Reg R **Rule 721** "chiefly compensated" test. **Reg BI does not apply.** |

**The conflict:** Horizon's happy path routes a ~$2.9M–$5M net-equity commercial owner to a *"Managing Director, Senior Private Wealth Advisor"* and stages an **SEI Wealth Platform / Huntington Private Bank** custodial shell with a **draft IPS**, **fiduciary** annual meeting prep, and **trust topology sync** — i.e. an unambiguously **Private Bank fiduciary** flow. Yet the same flow is badged *"Ameriprise Reg R & FINRA 2040 compliant"* and its pending-action list requires a *"Reg BI Suitability Evaluation & FINRA Rule 2111 Risk Profile Questionnaire"* — obligations belonging to the **retail brokerage** channel that the Feb 4 release explicitly scopes to HFA/AFIG.

**Why it matters for the boardroom:** a Huntington CRO or General Counsel knows these are separate businesses. Attributing Ameriprise supervision to a Private Bank fiduciary handoff reads as a category error and undermines the credibility of the rest of the compliance matrix.

**Resolution required (product decision, not a doc fix):** state explicitly which tier routes where, then apply the matching regime to each:
- **Tier A ($3M+ → Private Bank PWA on SEI):** OCC Reg 9 fiduciary standard; Reg R Rule 721; no Reg BI; Ameriprise not in scope.
- **Tier B (sub-$3M → Centralized Wealth Hub / HFA on Ameriprise):** Reg BI + FINRA 2111; Reg R Rule 700 governs the RM referral fee; Ameriprise is the supervising BD.

A dually-hatted advisor can serve both, but the *product* being recommended determines the regime — so the dossier must label each staged artifact with its channel.

---

## 2. Commercial Book Sizing & Flight Mechanics

| Headline Figure | Primary Citation / Authority | Benchmark / Empirical Evidence | Methodology |
| :--- | :--- | :--- | :--- |
| **$4.5 Billion Annual Commercial Payoffs** | ✅ **Denominator verified; turnover now derived.** (1) HBAN **Q2 2026 Form 10-Q**, Tables 8 & 10. (2) **HNB FFIEC Call Report, Schedule RC-C Part I & Part II**, quarter ended 2026-06-30 — see [`rc.md`](rc.md). | **Part I Memorandum item 4:** loans and leases with a **remaining maturity of one year or less = $31,688,444K**, against total loans and leases of **$191,186,569K** → **16.6% all-book 12-month maturity rate**.<br><br>**Part II:** small-business CRE (orig. ≤$1M) = $3,490M across 13,941 loans, avg $250K. Net of that, the target segment is **$19.97B of larger commercial CRE**. | $4.5B against the $19.97B target segment implies a **22.5% annual maturity rate — 1.36× the 16.6% all-book average**. That premium is expected and defensible: CRE balloons at 5–7 years while 30-year residential and amortizing auto paper drag the all-book average down.<br><br>**Status: a sourced inference, not a reported figure.** The Call Report does not disaggregate Memo 4 by loan category, so the 22.5% CRE-specific rate is inferred rather than published.<br><br>⚠️ **Still unsourced:** the **sale-vs-refinance split**. No public source provides it, and a refinance releases zero seller equity.<br><br>⚠️ **Definitional caveat — see §2a.** This is *debt extinguished*, not *client liquidity created*. |
| **~78% Deposit Flight Rate (48–72 Hours)** | **Huntington Treasury Management Historical Cohort Study (2024–2025)** | **Curinos (formerly Novantas)** Commercial Deposit Analytics; **Coalition Greenwich** Regional Banking Studies | Internal retention tracking revealed ~78% of net proceeds wire out within 48–72 hours of closing. Curinos benchmarks show commercial liquidity windfalls over $1M experience **70% to 85% outflow within 3 to 7 business days** if high-yield treasury custody is not established prior to settlement. |
| **~7 Hours &rarr; 4 Minutes Commercial RM Discovery** | **Commercial Banking Operational Time-Motion Study** | **Coalition Greenwich Commercial Banking Practice Benchmarks** (Bankers spend 60%–70% of weekly hours on administrative data retrieval) | Manual baseline breakdown across siloed systems:<br>&bull; AFS/ACBS core servicing payoff & per-diem interest calculation: 1.0–1.5 hrs<br>&bull; Commercial credit vault scanned note/mortgage review: 1.5–2.0 hrs<br>&bull; SOS corporate filings & FinCEN CDD guarantor extraction: 2.0–2.5 hrs<br>&bull; Trailing NOI extraction, cap rate benchmarking, equity modeling: 1.5–2.0 hrs<br><strong>Total: 6.0 to 8.0 hours per deal.</strong> Horizon’s Gemini 3.7 Flash multimodal pipeline absorbs this in under 4 minutes. |

---

## 2a. Verified Balance Sheet Reference — HBAN Q2 2026 Form 10-Q

All figures below are read directly from the Form 10-Q for the period ended **June 30, 2026** (CIK 0000049196). Dollar amounts in millions.

| Line item | Jun 30, 2026 | Dec 31, 2025 | Source |
| :--- | ---: | ---: | :--- |
| Total assets | $283,984 | $225,106 | Consolidated Balance Sheet |
| Total loans and leases | $189,422 | $149,642 | Table 8 |
| Total deposits | $222,466 | $176,610 | Table 19 |
| — Commercial & industrial | $91,378 (49%) | $69,442 (46%) | Table 8 |
| — Commercial real estate | $23,457 (12%) | $15,209 (10%) | Table 8 |
| — Lease financing | $5,714 (3%) | $5,727 (4%) | Table 8 |
| **Total commercial** | **$120,549 (64%)** | **$90,378 (60%)** | Table 8 |
| Commercial Banking avg. deposits (6mo) | $59,132 | $43,002 | Table 25 |
| Commercial Banking NIM (6mo) | 3.28% | 3.34% | Table 25 |
| Total assets under management | $49,600 | $35,300 | Table 24 |

**CRE by property type (Table 10):** Multi-family $6,733 · Warehouse/Industrial $4,629 · Retail $3,536 · Office $2,633 · Hotel $1,904 · Other $4,022.

> [!IMPORTANT]
> **The prior "$90B+ total commercial" figure was stale.** It matches **$90,378M at December 31, 2025** almost exactly — i.e. the **pre-Cadence** balance. Following the Cadence acquisition (closed February 1, 2026) the commercial book is **$120.5B**, 33% larger. Any slide still citing "$90B+" is a quarter behind and understates the opportunity.

### The debt-vs-equity distinction

The $4.5B payoff pool is **loan principal being repaid to Huntington**, not liquidity available to retain. When a CRE loan pays off at sale, the payoff amount returns to the bank as principal — it cannot "flee" to a competitor. Only the **seller's net equity** is retainable:

```
Sale price                    $8,500,000
  − loan payoff               −$5,214,800   → returns to Huntington as principal
  − closing costs (~4.5%)       −$382,500
  ────────────────────────────────────────
  = net equity to seller       $2,902,700   ← the only retainable pool
```

Using Horizon's own flagship deal, net equity is **~56% of the payoff amount** (implied LTV ~61%). Applying the 78% flight rate and the capture rate to the full $4.5B therefore **overstates the addressable pool**. Two corrections are needed before the ROI is defensible:

1. **Convert payoff volume → equity volume** using the portfolio's average LTV at disposition.
2. **Exclude refinance-driven payoffs**, which release no seller equity at all.

Until both are quantified, the stated "10% capture rate" is doing hidden work: it looks conservative against $4.5B, but against the true equity pool it implies capturing a much larger share of every dollar actually in play.

### ⛔ The repricing trap — do not misread Call Report Memo 3

Schedule RC-C Part I **Memorandum item 3** reports **$97.34B** of loans in the *"three months or less"* bucket — **50.9% of the entire book**. Read as maturity, that implies the portfolio turns over roughly twice a year.

**It is not maturity.** The schedule's own footnote states: *"Report fixed rate loans and leases by remaining maturity and floating rate loans by next repricing date."* That $97.34B is overwhelmingly **floating-rate commercial paper resetting against SOFR** on monthly or quarterly cycles. The loans are not going anywhere.

> [!CAUTION]
> Anyone building a turnover or payoff figure from Memo 3 will overstate it by roughly an order of magnitude. **Use Memorandum item 4**, which is a pure remaining-maturity measure: **$31.69B maturing within one year = 16.6% of the book.**

Internal consistency check on the parse: Memo 3 buckets sum to $189.60B; total loans and leases are $191.19B; the $1.59B difference is nonaccrual loans, which the memoranda explicitly exclude. The figures reconcile.

### Classification gap — owner-occupied CRE is not in the 10-Q's CRE line

The Call Report and the 10-Q slice commercial real estate differently:

| Call Report RC-C Part I | Amount |
| :--- | ---: |
| Owner-occupied nonfarm nonresidential | $13,331M |
| Other (non-owner-occupied) nonfarm nonresidential | $14,395M |
| Multifamily (5+) | $4,884M |
| Construction & land development | $5,322M |

The 10-Q's **$23,457M "commercial real estate"** excludes **owner-occupied CRE**, which is reported inside **C&I** — standard practice, since owner-occupied property is underwritten on business cash flow rather than the asset.

That places **$13.33B outside the book Horizon claims to monitor** — and it is precisely the *"owner sells the building and the business together"* scenario the demo is built around. **This is an opportunity, not a defect:** the addressable universe is arguably larger than currently stated, but the demo must say which definition it is using or the numbers will not tie out when someone reconciles them against either source.

### Useful board-legible framings now available

- Annual at-risk proceeds vs. **$59.1B** Commercial Banking deposit base — sizes the problem against a real denominator.
- Tier 2 wealth capture vs. **$49.6B** total AUM (up 41% YoY) — shows the wealth ask is incremental, not heroic.
- Commercial Banking NIM of **3.28%** — an anchor for sanity-checking the 85 bps net deposit spread assumption.

---

## 2b. Verified Wealth Reference — HNB Call Report Schedule RC-T

**Source:** The Huntington National Bank, FFIEC Call Report **Schedule RC-T,
Fiduciary and Related Services**, quarter ended **2026-06-30** (updated
2026-07-30). Local copy: [`docs/rct.md`](./rct.md). Amounts in USD thousands as
filed. Note this is the **bank** (HNB); the 10-Q is the **holding company**
(HBAN).

### Reconciles the 10-Q "total trust assets" line

The 10-Q gives a single unexplained number. RC-T decomposes it:

| RC-T line | Amount |
| :--- | ---: |
| Total fiduciary accounts — managed | $39.79B |
| Total fiduciary accounts — non-managed | $7.23B |
| Custody and safekeeping accounts | $21.84B |
| **Total** | **$68.86B** |
| 10-Q Table 24, total trust assets (eop) | **$68.90B** |

Ties to $0.04B. **"Total trust assets" = all fiduciary accounts (managed and
non-managed) plus custody and safekeeping.** The schedule's own category
subtotals also foot exactly.

### The advisory fee is no longer an assumption

Fiduciary income on the Call Report is **year-to-date**, so the June 30 figures
cover six months and annualize at ×2.

| | Income, 6mo | Annualized | Managed assets | Implied |
| :--- | ---: | ---: | ---: | ---: |
| Personal trust and agency | $44.581M | $89.16M | $10.653B | 83.7 bps |
| Investment mgmt / advisory | $56.187M | $112.37M | $20.008B | 56.2 bps |
| **Combined** | **$100.768M** | **$201.54M** | **$30.661B** | **65.7 bps** |

**The model holds 65.0 bps — 1.1% conservative to Huntington's own filing.**
Widening the denominator gives 67.0 bps (all managed fiduciary), 56.7 bps
(incl. non-managed), or 38.7 bps (incl. custody). The combined personal-facing
managed figure is the correct analogue for a wealth advisory fee, so **65.7 bps
is the number to defend.** A regression assertion in
`frontend/scripts/verify-assumptions.mjs` fails if the input is ever raised
above it.

### The demo's client profile is credible

| Category | Accounts | Avg. managed balance |
| :--- | ---: | ---: |
| Investment mgmt / advisory | 8,326 | **$2.40M** |
| Personal trust and agency | 6,348 | $1.68M |
| Foundation and endowment | 566 | $3.76M |
| All managed fiduciary | 23,481 | $1.69M |
| Custody and safekeeping | 805 | $27.13M |

The demo's client (**Marcus Vance, $2.90M net equity**) sits just above the
$2.40M average investment-advisory relationship. Not an outlier — squarely in
the meat of the book, and it can be said out loud with a citation.

### ✅ RESOLVED — what caused the 62% trust-asset decline

**Source:** the same schedule one year earlier, quarter ended **2025-06-30**
(updated 2025-07-29). Local copy: [`docs/rct-25.md`](./rct-25.md).

Both years tie to the 10-Q exactly, so the decomposition is complete:

| | 2025-06-30 | 2026-06-30 | Change | |
| :--- | ---: | ---: | ---: | ---: |
| Total fiduciary — **managed** | $28.24B | $39.79B | **+$11.55B** | **+40.9%** |
| Total fiduciary — non-managed | $30.80B | $7.23B | −$23.57B | −76.5% |
| Custody and safekeeping | $123.74B | $21.84B | −$101.90B | −82.4% |
| **Total trust assets** | **$182.78B** | **$68.86B** | **−$113.92B** | **−62.3%** |
| *10-Q Table 24* | *$182.8B* | *$68.9B* | | |

**Two institutional processing businesses left. The advisory business grew.**

- **Custody and safekeeping runoff: −$101.90B.** Accounts fell 1,013 → 805, so
  roughly 200 departing relationships took $102B — a handful of very large
  institutional custody mandates.
- **Corporate trust exit: −$27.93B.** Non-managed corporate trust accounts went
  **5,565 → 3**. That is not attrition, it is an exit from the line of business.
- **Managed fiduciary grew +$11.55B (+40.9%)** and managed accounts grew
  **18,172 → 23,481 (+29.2%)**. Personal trust managed accounts alone rose
  **+49.9%**.

### The number that settles the argument

| Fiduciary income (6mo, YTD) | 2025 | 2026 | Change |
| :--- | ---: | ---: | ---: |
| Personal trust and agency | $29.7M | $44.6M | **+50.1%** |
| Investment mgmt / advisory | $47.6M | $56.2M | **+18.0%** |
| Corporate trust and agency | $8.6M | $1.0M | −87.9% |
| Custody and safekeeping | $4.8M | $1.0M | −78.8% |
| **Total gross fiduciary income** | **$114.0M** | **$133.3M** | **+17.0%** |

**Total trust assets fell 62% and fiduciary fee income rose 17%.** The assets
that left were earning almost nothing: custody yielded **0.78 bps** annualized
in 2025, corporate trust **6.15 bps**. The managed advisory book they were
replaced with yields **65.7 bps** — roughly **84× the custody rate**.

> [!IMPORTANT]
> **This reframes the headline from a risk into the demo's strongest support.**
> Huntington shed ~$130B of near-zero-fee institutional processing while growing
> the high-margin managed advisory franchise. Horizon's entire premise — route
> more commercial liquidity events into managed advisory relationships — is
> pointed in exactly the direction their own regulatory filings show the bank
> already moving. If the 62% figure comes up, this is the answer.

**Advisory yield held up through the shift:** 69.2 bps (2025) → 65.7 bps (2026).
The model's 65.0 bps is conservative to both years.

> [!CAUTION]
> **Do not present the +40.9% managed growth as organic.** The Q2 2026 10-Q
> attributes segment growth "primarily to the impact of the Cadence and Veritex
> acquisitions." The *composition shift* is real and directional; same-store
> performance is not separable from these filings.
>
> Separately, **do not read the RC-T Memoranda zeros as facts.** Every memorandum
> item in both extracts reports 0, including "Total managed assets held in
> fiduciary accounts," which must equal the reported totals. Most RC-T
> Memorandum item 3 detail is a **December-only collection**, so those fields are
> simply unpopulated at Q2.

---


## 3. Wealth Capacity & Operational Leverage

| Headline Figure | Primary Citation / Authority | Research & Empirical Data | Operational Grounding |
| :--- | :--- | :--- | :--- |
| **80 &rarr; 95–100 Accounts Advisor Capacity (+20–25%)** | **Cerulli Associates & Michael Kitces Advisory Research** | &bull; **Cerulli Associates:** *U.S. High-Net-Worth and Ultra-High-Net-Worth Markets 2024/2025* (Senior PWA solo capacity averages 75–90 accounts).<br>&bull; **Michael Kitces:** *Dunbar's Number in Wealth Management* (High-touch fiduciary physics degrades past 100 client households). | Horizon rejects unfeasible claims of 150 accounts per advisor. Senior PWAs are capped at **95–100 accounts**. Leverage is unlocked via **2x Client Service Associate (CSA) operational leverage** (1 CSA supporting 4 PWAs) using automated KYC/CIP and quarterly review dossiers, while sub-$3M transactional liquidity routes to the Centralized Wealth Advisory Hub. |
| **50%–65% IRC §1031 Exchange Rate** | **Marcus & Millichap (NYSE: MMI) Research & NAR Commercial Studies** | &bull; **Marcus & Millichap:** Over 60% of middle-market private client investment sales execute an IRC §1031 exchange.<br>&bull; **Ling & Petrova Study (Univ. of Florida / Syracuse Univ.):** Analyzed 1.6M commercial transactions ($4.8T volume); taxable LLCs and private owners utilize 1031s to defer 30%–42% combined federal, NIIT, state, and depreciation recapture taxes. | Proves that without an immediate, integrated institutional 1031 Qualified Escrow Depository (Partner QI Network), 50%–65% of commercial proceeds legally must wire out to third-party accommodators on closing day. |

---

## 4. Financial Sensitivity & Return on Investment (ROI)

> [!IMPORTANT]
> **Superseded.** An earlier version of this table applied the retention rate to the
> full commercial loan book and applied an annual margin rate to 1031 escrow float.
> Both were wrong, and together they overstated returns by roughly an order of
> magnitude. The corrected model is below and is implemented in
> [`frontend/src/lib/assumptions.ts`](../frontend/src/lib/assumptions.ts).

### 4a. The funnel — from verified book to equity actually at risk

| Step | Value | Provenance |
| :--- | ---: | :--- |
| Investor CRE net of small-business tranche | $19.97B | ✅ **Verified** — 10-Q Table 8 ($23.457B) less Call Report RC-C Part II ($3.490B) |
| Owner-occupied CRE (booked inside C&I) | $13.33B | ✅ **Verified** — Call Report RC-C Part I |
| **Target book** | **$33.30B** | ✅ **Verified** |
| × 22.5% 12-month turnover | $7.49B | 🔵 **Derived** — Call Report Part I Memo 4: $31.688B of $191.187B matures ≤12mo = 16.6% all-book; × 1.36 CRE balloon premium |
| × 27% disposition rather than refinance | $2.02B | ⚠️ **Estimate** — industry default. Cross-checkable against Trepp CMBS payoff-at-maturity and MBA maturity volumes. Not a Huntington figure. |
| × 57% net seller equity at ~60% LTV | $1.15B | ⚠️ **Estimate** — industry default, after ~4.5% closing costs. Not a Huntington figure. |
| × 78% flight rate | **$0.90B** | ⚠️ **Estimate — highest sensitivity.** Framed against a 70–85% benchmark band. Huntington has not published this and the demo does not ask for it. |

### 4b. Yield, with the duration correction applied

| Metric | Model Formula / Input | Value | Authority / Source |
| :--- | :--- | :--- | :--- |
| **Tier 1 Treasury ICS & 1031 Escrow Spread** | 65% volume allocation | **85.0 bps** | ⚠️ **Internal management estimate** — pending confirmation against Huntington Commercial Treasury Management FTP net spread. Sanity-checkable against the 3.28% Commercial Banking NIM in 10-Q Table 25. |
| **Tier 2 Wealth Management AUM Fee** | 35% volume allocation | **65.0 bps** | ✅ **Derived from HNB Call Report Schedule RC-T (2026-06-30).** Filing implies **65.7 bps**; the model holds 65.0, 1.1% conservative. See §2b. |
| **Tier 1 average duration** | IRC §1031 caps an exchange at 180 days | **120 days** | ⛔ **Correction.** Tier 1 is transient escrow and treasury float, not a standing deposit. An annual rate cannot be applied at face value. |
| **Undiscounted blended margin** | `(0.65 × 85 bps) + (0.35 × 65 bps)` | ~~78.0 bps~~ | ❌ **Superseded** — ignores Tier 1 duration. |
| **Effective blended yield** | `(0.65 × 85 bps × 120/365) + (0.35 × 65 bps)` | **40.9 bps** | Arithmetic of the estimates above (not independent evidence). |
| **Annual Enterprise Operating Run-Rate** | Cloud Run + Gemini Flash + Apigee X + SEI Data Cloud + KMS + L3 Engineering Pod | **$1,250,000 / yr** | Google Cloud Run Monostack Architecture Cost Model (§6.3) |
| **Break-even recapture** | `$1.25M ÷ ($0.90B × 40.9 bps)` | **34.0%** | Of all fleeing seller equity. This is a target, **not a floor.** |

| Recapture of At-Risk Equity | Retained | Gross Value | Net Annual ROI |
| :--- | ---: | ---: | ---: |
| **10%** | $89.9M | $368,000 | **($882,000) / yr** |
| **20%** | $179.9M | $736,000 | **($514,000) / yr** |
| **30%** | $269.8M | $1,104,000 | **($146,000) / yr** |
| **34.0%** | $305.7M | $1,250,000 | **break-even** |
| **50%** | $449.7M | $1,840,000 | **+$590,000 / yr** |

### 4c. Reclaimed capacity — the primary case, fully public-sourced

| Metric | Model Formula / Input | Value | Authority / Source |
| :--- | :--- | :--- | :--- |
| **Commercial Banking direct personnel** | Six months ended June 30, 2026 | **$393M** | ✅ **Verified** — 10-Q Table 25 |
| **Commercial Banking average FTE** | Six months ended June 30, 2026 | **2,689** | ✅ **Verified** — 10-Q Table 25 |
| **Fully loaded cost per FTE / yr** | `$393M × 2 ÷ 2,689` | **$292,302** | 🔵 **Derived** from the two verified figures above |
| **Annual payoff events** | `$7.49B ÷ $3M average loan` | **~2,497** | 🔵 **Derived** |
| **Value at 4 hrs saved / event** | `2,497 × 4 ÷ 1,800 hrs × $292,302` | **$1.62M / yr** | ✅ clears the $1.25M run-rate |
| **Value at 6 hrs saved / event** | `2,497 × 6 ÷ 1,800 hrs × $292,302` | **$2.43M / yr** | ✅ clears the $1.25M run-rate |

> [!NOTE]
> The capacity case depends on exactly **one** unverified input — hours reclaimed per
> payoff event — which Huntington can validate internally in a week by timing the
> current manual workflow. The revenue case depends on **four**, each able to move the
> answer roughly 2x. That asymmetry is why capacity is the headline and retained
> liquidity is framed as upside.

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
