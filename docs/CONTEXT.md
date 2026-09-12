# Huntington Book Scout: Ubiquitous Domain Language

Intelligent liquidity orchestration and deposit retention workflow bridging Commercial Real Estate and SBA 7(a) loan payoffs with Commercial Treasury Management and Private Wealth Management advisory across Huntington's 1,400 branches in 21 states.

## Domain Vocabulary

**Commercial Liquidity Engine**:
The domain module responsible for commercial property valuation triage, debt netting, statutory depository account selection, and Borrower Settlement Routing Packet formulation.
_Avoid_: Calculator, ValuationService, SettlementHandler

**Liquidity Assessment**:
The consolidated domain evaluation of a commercial payoff event, containing indicative property valuation, net equity proceeds, statutory deposit routing, and generated Borrower Settlement Routing Packet.
_Avoid_: CalculationResult, ValuationResponse, Quote

**Payoff Statement**:
The formal demand document received from a title company or escrow officer indicating the existing unpaid principal balance, per diem interest, and scheduled closing date.
_Avoid_: PayoffDemand, PayoffQuote, LoanPayoff

**Statutory Depository Route**:
The designated institutional deposit destination chosen to preserve client wealth based on tax strategy (IRC §1031 Qualified Escrow Depository under Treas. Reg. § 1.1031(k)-1(g)(3) vs Commercial Business Premier Insured Cash Sweep under 12 U.S.C. § 1831f).
_Avoid_: DepositStrategy, TaxPath, BankAccountType

**Settlement Wire Instruction / Routing Packet**:
The verified bank wire authorization packet delivered directly to the commercial borrower via DocuSign specifying ABA routing, segregated escrow account numbers, and official bank verification letters for ALTA Pillar 2 callback compliance.
_Avoid_: WireLetter, WireData, DirectTitleWire

**Retention Workflow**:
The cross-departmental operational lifecycle connecting commercial loan payoff surveillance, property valuation triage, 1031 escrow routing, and private wealth client onboarding.
_Avoid_: AppState, ClientJourney, WorkflowStore

**SEI Data Cloud**:
The cloud-native Snowflake data-sharing architecture powering Huntington Private Bank's SEI Wealth Platform (SWP, announced March 31, 2026), providing zero-ETL portfolio telemetry and custodial verification.
_Avoid_: Trust 3000, Batch Trust Feed, On-Prem Trust Accounting

**Regulation R Networking Arrangement**:
The formal bank-broker-dealer structure governing referrals from unregistered Huntington commercial bankers into the **Huntington Financial Advisors (HFA)** retail investment program, strictly restricting non-registered bank employee compensation to nominal, fixed-dollar, non-contingent referral fees. Note the topology: **Huntington employs the advisors and retains the client relationship**; Ameriprise Financial supplies the technology platform, clearing and back office, and acts as the **supervising broker-dealer**. The advisor handoff is therefore intra-institutional, while Ameriprise's access to client NPI is a service-provider relationship under Reg P (12 C.F.R. § 1016.13).

⚠️ **Channel caveat:** Reg R **Rule 700** (networking) governs referrals into the *retail brokerage* channel (HFA/Ameriprise). Referrals into **Huntington Private Bank** trust/discretionary relationships (SEI Wealth Platform) are a *bank fiduciary* activity under **OCC Reg 9 (12 C.F.R. § 9)** and the Exchange Act § 3(a)(4)(B)(ii) trust exception (Reg R **Rule 721**) — **Reg BI and FINRA 2111 do not apply there.** Do not badge a Private Bank fiduciary handoff as "Ameriprise-supervised." See `CITATIONS.md` §1a.
_Avoid_: Fee Split, Wealth Commission, AUM Referral Bonus, "non-affiliated retail channel", "Huntington Advisors" (the entity is *Huntington Financial Advisors*)

**SBA 7(a) Liquidity Event**:
A commercial loan payoff arising from Huntington's top-2 national SBA portfolio across 1,400 branches in 21 states, representing an entrepreneur exit, business disposition, or partner buyout requiring SBA SOP 50 10 7 compliance.
_Avoid_: Small Business Loan, Retail Payoff
