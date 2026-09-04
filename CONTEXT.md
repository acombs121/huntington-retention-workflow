# Huntington Horizon

Intelligent liquidity orchestration and deposit retention workflow bridging Commercial Real Estate loan payoffs with Private Wealth Management advisory.

## Language

**Commercial Liquidity Engine**:
The domain module responsible for commercial property valuation triage, debt netting, statutory depository account selection, and title settlement wire instruction formulation.
_Avoid_: Calculator, ValuationService, SettlementHandler

**Liquidity Assessment**:
The consolidated domain evaluation of a commercial payoff event, containing indicative property valuation, net equity proceeds, statutory deposit routing, and generated title wire instructions.
_Avoid_: CalculationResult, ValuationResponse, Quote

**Payoff Statement**:
The formal demand document received from a title company or escrow officer indicating the existing unpaid principal balance, per diem interest, and scheduled closing date.
_Avoid_: PayoffDemand, PayoffQuote, LoanPayoff

**Statutory Depository Route**:
The designated institutional deposit destination chosen to preserve client wealth based on tax strategy (IRC §1031 Qualified Escrow Depository under Treas. Reg. § 1.1031(k)-1(g)(3) vs Commercial Max$aver Insured Cash Sweep under 12 U.S.C. § 1831f).
_Avoid_: DepositStrategy, TaxPath, BankAccountType

**Settlement Wire Instruction**:
The verified bank wire authorization letter delivered to the title escrow officer specifying ABA routing, segregated escrow account numbers, and statutory protective disbursement covenants.
_Avoid_: WireLetter, WireData, EscrowInstructions

**Retention Workflow**:
The cross-departmental operational lifecycle connecting commercial loan payoff surveillance, property valuation triage, 1031 escrow routing, and private wealth client onboarding.
_Avoid_: AppState, ClientJourney, WorkflowStore
