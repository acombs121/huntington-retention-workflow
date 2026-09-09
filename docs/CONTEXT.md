# Huntington Horizon: Ubiquitous Domain Language

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
The formal bank-broker-dealer contractual structure governing referrals between The Huntington National Bank and Ameriprise Financial (Huntington Advisors platform announced Feb 4, 2026), strictly restricting non-registered bank employee compensation to nominal, fixed-dollar, non-contingent referral fees.
_Avoid_: Fee Split, Wealth Commission, AUM Referral Bonus

**SBA 7(a) Liquidity Event**:
A commercial loan payoff arising from Huntington's top-2 national SBA portfolio across 1,400 branches in 21 states, representing an entrepreneur exit, business disposition, or partner buyout requiring SBA SOP 50 10 7 compliance.
_Avoid_: Small Business Loan, Retail Payoff
