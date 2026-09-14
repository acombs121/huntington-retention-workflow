# Huntington Book Scout — Presenter Script

**Audience:** Huntington executive leadership.  **Runtime:** about 10 minutes.

---

## 1. The Value Proposition

### What this is

Book Scout is a software agent for commercial banking. It runs on Google Cloud.

### What problem does this solve?

A commercial borrower sells a property or refinances a loan. The loan pays off.
The owner's equity then leaves the bank in two or three days. Most of it goes to
an outside firm.

The bank learns about these payoffs too late to act. Book Scout tells the bank
early.

### How it works

1. Each night the agent reads the bank's own loan records. It lists the
   commercial loans that will pay off soon.
2. The agent reads the payoff documents that title companies send to the bank.
   It finds the loan, the borrower company, and the owners of that company.
3. The agent prepares the banker's work. This is a call script, a deposit
   option, and a settlement routing form for the client to sign.
4. The banker makes every decision. The agent starts no client work before the
   banker speaks to the client.
5. The system records each action. A person approves each step.

### Why this is valuable

The bank learns about the payoff weeks earlier. Early is the only time the money
can stay.

The bank keeps deposits that it loses today. Wealth management fees can follow
those deposits. Treat both as upside.

Each payoff costs a banker several hours of manual work. The agent does that
work instead. The bankers get those hours back. The bank adds no staff.

Each action has an audit record. The bank can show a regulator who decided what,
and when.

The same machinery works on other events. Examples are loan renewals, covenant
reviews, and SBA 7(a) business sales.

### What this is not

Book Scout gives no investment advice. It sends no instruction to a title
company. It opens no account by itself. A banker does all three, or nobody does.

---

## 2. The Walkthrough

One screen at a time. For each screen: what to show, and why it matters.

---

### Screen 1: Payoff Pipeline (0:00–2:00)

The app opens here.

#### Show
- The queue of three staged liquidity events. Each row carries the borrower
  entity, the property, the unpaid principal, the credit tier, and the closing
  window.
- Scroll to the bottom and expand **Overnight Agent Telemetry & Ingestion
  Audit**. It starts collapsed. Read the four tiles: facilities screened,
  deals classified, documents read, banker hours absorbed.
- Click a **confidence score** to open the reasoning trace. Then click
  **[Spanner Graph]** in its footer.

#### Why it matters

The bank already holds everything needed to predict this event. Nobody reads it
in time. This screen is the thesis: the detection is a data problem, not a
staffing problem.

The graph answers the only question a skeptic has — *how does it know this is a
sale and not a refinance?* The title payoff demand is what carries that
distinction, and the connected nodes show the chain. A 15% member sits
quarantined in the graph, visible but walled off.

---

### Screen 2: Deal Analysis (2:00–4:00)

#### Show
- Click each name under **Beneficial Ownership**. The **Document Grounding**
  panel follows the selection and moves the highlight to the page region the
  claim was read from.
- The **Pre-Ingestion DLP** markers, and the non-guarantor member excluded from
  profiling.
- The internal liquidity band, which sizes the relationship and never reaches
  the client.

#### Why it matters

Every assertion points at a page in a document the bank already owns. An
executive can put a finger on the sentence. That is the difference between an
agent and a chatbot.

The exclusion is the stronger point. The agent refuses data it has no business
purpose to use, even though it holds that data. Restraint is a designed feature
here, not an omission.

---

### Screen 3: Retention & Settlement (4:00–7:00)

The centre of gravity. Do not rush it.

#### Show
- The empty right-hand workspace. No account, no envelope, no signature request.
- Expand **Suggested script & compliance guardrails**. It starts collapsed.
  Read the **Do Not Say** rules aloud — they are the more interesting half.
- Click **[Log Call — Client Directed Proceeds to Huntington]**. The workspace
  unlocks.
- Drag the **Indicative Valuation Slider**. Net seller equity re-indexes live.
  Point out that nothing in the client packet moves with it.
- Inspect the **Borrower Settlement Routing Packet**, still marked **Draft — not
  sent**. Note the blank **Amount to Route** line and the borrower addressee.
- Click **[Send to Marcus Vance for Signature]**. The envelope id appears only
  now, issued by the server.
- Click **[Record Client Opt-In]** to lift the privacy gate.
- If challenged, click **Retract call record**. The account, the envelope and
  the packet all disappear.

#### Why it matters

Detection is an inference. An inference is not permission. Everything downstream
is locked until a banker has actually spoken to the client, and the server
enforces that, not the button.

The packet goes to the borrower, never to the title company. A lender has no
authority to direct a seller's proceeds. The blank amount is deliberate: a
bank-computed figure on a document the client signs would be an estimate
presented as a fact.

The envelope id proves dispatch. It does not claim signature. The system says
only what it can prove.

---

### Screen 4: Advisor Routing (7:00–8:30)

#### Show
- The candidate advisor ranking, and the objective inputs behind the match:
  proximity, capacity, and CRE disposition experience.
- The fourth input, marked **INTERNAL ONLY**, which never reaches client-facing
  text.
- The warm introduction draft. Read what is absent from it.
- Click **[Queue Introduction]**. The banner confirms the message is held until
  thirty days after closing, derived from the deal's own closing date.

#### Why it matters

The match is explainable, so it survives a fair-treatment question.

The hold is the promise being kept. Nobody pitches wealth products to a sponsor
twelve days before a closing. The system enforces the wait rather than trusting
the banker to remember it.

---

### Screen 5: Private Wealth (8:30–9:30)

Switch persona in the header. This is the last screen.

#### Show
- The advisor receives a complete dossier. No retyping, no batch file, no
  overnight wait.
- Close on the loop: a payoff the bank would have learned about at the wire is
  now a funded deposit and a scheduled advisory conversation.
- Hand the floor to the CFO.

#### Why it matters

Advisor capacity is limited by fiduciary maintenance, not by paperwork. Raw
leads make that worse. A finished dossier is the only form of help that adds
capacity instead of consuming it.

Stop here. Executive Analytics and the Admin Panel dials are real and they are
one click away, but they are the wrong depth for ten minutes. The economics
belong on the deck and in the Q&A below. Open them only if the room asks.

---

## 3. Anticipated Executive Q&A (Presenter Defense)

### How it works day to day

* **"You say Book Scout sees the payoff 120 days out. What does it actually see?"**  
  → It sees a maturity date. The loan master holds the scheduled maturity of every commercial loan, so reading it 120 days ahead is easy. Be careful what you claim from that. A maturity date does not tell you the borrower will sell. Most maturities become renewals. The 120-day signal builds a watchlist and starts a conversation. It does not classify the event. The classification needs the title payoff demand, and that arrives about 12 days out.

* **"What if the customer sells in year three of a seven-year loan?"**  
  → Then the maturity screen never fires, and the 120 days does not apply. That is a real limit. Say so plainly. Three earlier signals still reach the bank first. The borrower asks for a payoff quote. The borrower asks the bank to price a prepayment penalty or a defeasance. The borrower asks for consent to sell. Each request lands on a Huntington desk before the title company writes. Book Scout watches those requests. They buy days or weeks, not months.

* **"How does a 1031 exchange work with this?"**  
  → The seller must not touch the money. If the proceeds reach the seller's own account, the tax deferral is destroyed. An independent Qualified Intermediary holds the exchange contract, and the bank cannot be that intermediary for its own borrower. The bank can hold the escrow account. Treas. Reg. § 1.1031(k)-1(g)(3) permits it. The deposit then stays for up to 180 days. Timing decides this one. The intermediary and the escrow bank are named in the exchange agreement **before** closing. If the bank waits for the closing, the money is already promised to someone else. This is the clearest reason to find the event early.

* **"What must we connect on day one?"**  
  → Four things. A read-only copy of the loan master, for maturity dates and balances. The mailbox and fax line that already receive payoff demands. The credit document store. The commercial CRM, to write the call and referral records. Book Scout reads. It does not write to the core.

* **"Does this change what Loan Operations does?"**  
  → No. Loan Operations still receives the payoff demand and still issues the payoff quote. Book Scout reads the same inbound document at the same time. It does not re-price the loan and it does not answer the title company. It gives the banker a head start while operations does its normal work.

* **"Who runs this every day?"**  
  → The commercial banker. There is no new team and no new queue to staff. The banker sees a flagged deal, makes one call, and presses the buttons. Everything else is preparation the banker would otherwise do by hand.

* **"What if the agent reads a document incorrectly?"**  
  → Every extracted fact points to the page and the position it came from. The banker sees the source text beside the claim, so a wrong reading is visible before anyone uses it. Nothing the agent extracts reaches the customer on its own. The internal valuation estimate never appears in client-facing text. The settlement form carries no bank-computed amount.

* **"What happens if the customer says no?"**  
  → The banker records the refusal. Nothing is staged. No account opens, no envelope goes out, and no wealth introduction is queued. The record shows that the bank asked and the customer declined. In an examination that record is worth as much as a yes.

### The money

* **"Why does it cost $1.25 million a year?"**  
  → That figure is deliberately high. Present it that way. It is a standalone, fully loaded budget, and it assumes the bank buys every part new. Technology is about $260,000 of it. People and audits are the other $990,000. The largest single line is a two-person platform team at $650,000. Most banks already run the API gateway, the cloud account and a platform team. On that basis the added cost is far smaller. The high number is the hurdle the benefit must clear, and a conservative hurdle makes the case stronger, not weaker. Ask your own team for the incremental number. If it is lower, the payback improves.

* **"You are paying 4.85% on money that was earning you 4.88%. How is that a win?"**  
  → Those two numbers sit on opposite sides of the balance sheet, and neither one is the bank's cost of funds. The 4.88% is the coupon on a 2018 loan that is being repaid at par. That loan leaves the book on the closing date either way. The deposit is the only thing still in play. A deposit is priced at funds transfer pricing: the wholesale funding it displaces, less what the bank pays the client. On that basis the 85 basis points is a credit against the funding curve, not a spread over a loan. Interrogate the curve, not the spread. 85 bps over 4.85% implies a marginal funding cost near 5.70%, and Treasury owns that input. If Treasury's curve is lower, the Tier 1 contribution falls.

* **"Our trust assets dropped 62% year over year. Why invest in wealth?"**  
  → That number measures the business the bank left, not the business it is in. Total trust assets fell from $182.8B to $68.9B. Call Report Schedule RC-T shows where it went. Custody and safekeeping ran off $101.9B. Corporate trust closed, from 5,565 accounts to 3. Over the same year managed fiduciary assets grew 41%, to $39.8B. The income line settles it. Assets fell 62% and gross fiduciary fee income rose 17%, from $114.0M to $133.3M. The assets that left earned 0.78 basis points. The managed book that replaced them earns about 65.7. One caveat: part of that growth is Cadence and Veritex, not same-store.

### Compliance and risk

* **"Why not send wire instructions straight to the title company?"**  
  → Because a lender has no authority to direct the seller's money. The settlement agent holds escrow for its own principals and disburses seller equity only on instructions the seller signs. That duty comes from the escrow agreement and agency law. Title companies also treat third-party wire instructions as a fraud risk and verify by independent call-back. So Book Scout prepares a routing packet and sends it to the borrower. The borrower signs it and submits it as his own instruction. The bank supplies a verification letter and a call-back line.

* **"How does the Ameriprise arrangement affect client data?"**  
  → Less than people assume. Huntington employs the advisors, and the client stays a Huntington customer. Ameriprise supplies the platform, the clearing and the back office, and supervises the broker-dealer activity. The handoff from banker to advisor is therefore internal. It is not a disclosure to an unaffiliated third party, so Reg P opt-out does not attach to it. Ameriprise does receive client information through the platform. That is a service-provider relationship under 12 C.F.R. § 1016.13, governed by contract rather than by customer opt-out. Two controls do bind the bank. Regulation R caps the banker's referral fee at a nominal, fixed, non-contingent amount. Reg BI supervision sits with Ameriprise. This is why Book Scout prepares administrative work only, and never a recommendation.

* **"What keeps the bank from being disqualified on a 1031 exchange?"**  
  → The bank acts only as escrow depository. An independent, unaffiliated Qualified Intermediary holds the exchange contract. The routine-financial-services carve-out at Treas. Reg. § 1.1031(k)-1(k)(2)(ii) permits the escrow on its face. Separately, Book Scout firewalls that escrow from wealth management and Delaware Statutory Trust desks for the 180 days. That is a conservative control, not a tax requirement. It also removes any argument that the bank's services stop being routine.

* **"Why does Huntington's SBA 7(a) position matter here?"**  
  → SBA payoffs are business sales and owner retirements. They create the same liquidity as a building sale. The seller is usually one person, so the money lands in one place. Many SBA loans are secured by the owner's real estate, and those produce a title payoff demand. The existing sensor already finds that slice today.

  > ⚠️ **Presenter caution.** Say "among the top" rather than a specific rank. The SBA publishes lender rankings, but this repo has not verified a current-year placement, and the Call Report's "small business" schedule is defined by original loan amount rather than SBA program participation — it does **not** substantiate an SBA ranking. See [`rc2.md`](rc2.md).

* **"How does this connect to Private Bank?"**  
  → Through the SEI Wealth Platform and the SEI Data Cloud, using Snowflake secure data sharing. It reads in near real time. It replaces the overnight batch files from the legacy trust system.

---
*Huntington Book Scout Presenter Script (v7.0)*
