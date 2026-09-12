/**
 * Page facsimiles for the credit documents the resolver reads.
 *
 * The API reports where on the page each beneficial owner was found. It does
 * not report what the rest of the page says, so the surrounding document --
 * article headings, recitals, reliance and guaranty clauses, execution and
 * notary blocks -- is authored here. These are fabricated demo documents for
 * fabricated borrowers, consistent with the disclaimer the app carries on
 * every screen.
 *
 * Coordinates are in page units: 800 wide by 1035 tall, which is US Letter
 * proportions and matches the margins the API already reports (every extracted
 * region spans x 120-680, i.e. symmetric 120-unit margins). One page unit is
 * rendered as one CSS pixel, so body text sits at a genuine 11px and stays
 * legible instead of being scaled into mush.
 *
 * Clause blocks carry a `member` name rather than a y coordinate. They are
 * positioned from that member's bounding box at render time, so the highlight
 * can never drift off the text it is supposed to be highlighting -- if the
 * resolver moves a region, the clause moves with it.
 */

export type BlockVariant =
  | 'article'
  | 'title'
  | 'body'
  | 'clause'
  | 'closing'
  | 'signature'
  | 'notary';

export interface FacsimileBlock {
  /** Top edge in page units. Omitted for clause blocks, which use the API box. */
  y?: number;
  /** Set on clause blocks: positioned from this member's reported bounding box. */
  member?: string;
  text: string;
  variant: BlockVariant;
  centered?: boolean;
}

export interface Facsimile {
  headerLeft: string;
  headerRight: string;
  blocks: FacsimileBlock[];
}

export const DOCUMENT_FACSIMILES: Record<string, Facsimile> = {
  'PO-2026-8821': {
    headerLeft: 'Credit Agreement & Incumbency Certificate',
    headerRight: 'Vance Riverfront Properties IV, LLC',
    blocks: [
      { y: 118, variant: 'article', centered: true, text: 'ARTICLE VII' },
      {
        y: 144,
        variant: 'title',
        centered: true,
        text: 'BENEFICIAL OWNERSHIP AND SIGNATORY AUTHORITY',
      },
      {
        y: 182,
        variant: 'body',
        text:
          '7.1  Certification of Membership. The undersigned Managing Member of Vance Riverfront Properties IV, LLC, an Ohio limited liability company (the “Company”), certifies to The Huntington National Bank (the “Lender”) that the following constitute the entire beneficial ownership of the Company:',
      },
      {
        member: 'Marcus Vance',
        variant: 'clause',
        text:
          '(a)  Marcus Vance, holding an undivided 85% Managing Membership Interest and sole operating signatory authority, who is and shall remain a Guarantor of the Obligations.',
      },
      {
        member: 'Elena Vance',
        variant: 'clause',
        text:
          '(b)  Elena Vance, holding a fifteen percent (15%) non-managing Membership Interest, who shall not be required to execute any Guaranty and who holds no signatory authority hereunder.',
      },
      {
        member: 'The Vance 2018 Family Trust',
        variant: 'clause',
        text:
          '(c)  Underlying beneficial succession assigned to The Vance 2018 Family Trust, Marcus & Elena Vance Trustees, solely for estate administration purposes.',
      },
      {
        y: 498,
        variant: 'body',
        text:
          '7.2  Reliance. The Lender may conclusively rely upon the certifications made in this Article VII in extending, maintaining and administering the Obligations, until such time as the Company delivers a superseding certificate executed by its Managing Member.',
      },
      {
        y: 578,
        variant: 'body',
        text:
          '7.3  Guaranty Obligations. Only those Members expressly designated above as Guarantors shall execute the Continuing Guaranty attached hereto as Exhibit A. No Member designated as non-guarantor shall be deemed to have assumed, guaranteed or become liable for any Obligation of the Company by reason of its Membership Interest alone.',
      },
      {
        y: 678,
        variant: 'body',
        text:
          '7.4  Notice of Change. The Company shall notify the Lender in writing within ten (10) Business Days of any transfer, pledge or encumbrance of a Membership Interest representing five percent (5%) or more of the Company.',
      },
      {
        y: 756,
        variant: 'closing',
        text:
          'IN WITNESS WHEREOF, the undersigned has executed this Certificate as of the date first written above.',
      },
      {
        y: 818,
        variant: 'signature',
        text: 'Marcus Vance, Managing Member\nVance Riverfront Properties IV, LLC',
      },
      {
        y: 910,
        variant: 'notary',
        text:
          'State of Ohio, County of Franklin — Subscribed and sworn to before me this ______ day of ____________, 2026.',
      },
    ],
  },

  'PO-2026-7492': {
    headerLeft: 'Credit Agreement & Corporate Resolution',
    headerRight: 'Buckeye Precision Tooling Corp.',
    blocks: [
      { y: 104, variant: 'article', centered: true, text: 'ARTICLE IV' },
      {
        y: 130,
        variant: 'title',
        centered: true,
        text: 'CORPORATE RESOLUTION AND INCUMBENCY OF OFFICERS',
      },
      {
        y: 158,
        variant: 'body',
        text:
          '4.1  Certified Resolutions. The undersigned Secretary of Buckeye Precision Tooling Corp., an Ohio corporation (the “Corporation”), certifies that the Board of Directors duly adopted the following resolutions:',
      },
      {
        member: 'Arthur Pendelton',
        variant: 'clause',
        text:
          '(a)  Arthur Pendelton, holding 70% Voting Common Shares with sole banking and encumbrance authority, is authorized to execute and deliver the Loan Documents on behalf of the Corporation.',
      },
      {
        member: 'Janet Pendelton',
        variant: 'clause',
        text:
          '(b)  Janet Pendelton, Corporate Secretary holding 30% Common Shares and joint personal guarantor, is authorized to attest to the foregoing and to certify the records of the Corporation.',
      },
      {
        y: 374,
        variant: 'body',
        text:
          '4.2  Tax Status and Title to Real Property. The Corporation has elected treatment under Subchapter S of the Internal Revenue Code. Record title to the Premises is held solely in the name of the Corporation; no shareholder holds direct title to, or a divided interest in, the Premises, and no shareholder is a party to the Purchase Agreement in an individual capacity.',
      },
      {
        y: 466,
        variant: 'body',
        text:
          '4.3  Guaranty Obligations. Each shareholder identified above has executed the Continuing Guaranty attached hereto as Exhibit B, jointly and severally, without limitation as to amount.',
      },
      {
        y: 540,
        variant: 'body',
        text:
          '4.4  Reliance. The Lender may conclusively rely upon this Resolution until it receives written notice of revocation executed by the Secretary of the Corporation.',
      },
      {
        y: 620,
        variant: 'closing',
        text:
          'IN WITNESS WHEREOF, the undersigned has executed this Resolution as of the date first written above.',
      },
      {
        y: 682,
        variant: 'signature',
        text: 'Janet Pendelton, Corporate Secretary\nBuckeye Precision Tooling Corp.',
      },
      {
        y: 776,
        variant: 'notary',
        text:
          'State of Ohio, County of Franklin — Subscribed and sworn to before me this ______ day of ____________, 2026.',
      },
    ],
  },

  'PO-2026-6104': {
    headerLeft: 'Credit Agreement & Operating Facility',
    headerRight: 'Columbus Medical Arts Center LLC',
    blocks: [
      { y: 110, variant: 'article', centered: true, text: 'ARTICLE V' },
      {
        y: 136,
        variant: 'title',
        centered: true,
        text: 'OWNERSHIP, MANAGEMENT AUTHORITY AND GUARANTY',
      },
      {
        y: 172,
        variant: 'body',
        text:
          '5.1  Certification of Ownership. The undersigned Managing Partner of Columbus Medical Arts Center LLC (the “Practice”) certifies that the following persons hold its entire equity interest:',
      },
      {
        member: 'Dr. Robert Miller, M.D.',
        variant: 'clause',
        text:
          '(a)  Dr. Robert Miller, holding a 55% majority ownership interest with operating and financing authority, who shall execute the Continuing Guaranty as a Guarantor of the Obligations.',
      },
      {
        member: 'Dr. Sarah Lin, M.D.',
        variant: 'clause',
        text:
          '(b)  Dr. Sarah Lin, holding a 45% non-managing equity interest and joint clinical practice guarantor, whose authority under this Agreement is limited to clinical operations.',
      },
      {
        y: 396,
        variant: 'body',
        text:
          '5.2  Financing Authority. Only the Managing Partner may execute, amend or refinance indebtedness of the Practice. No other Member may bind the Practice to any credit facility, whether with the Lender or any other institution.',
      },
      {
        y: 484,
        variant: 'body',
        text:
          '5.3  Reliance. The Lender may conclusively rely upon this Article V until it receives a superseding certificate executed by the Managing Partner.',
      },
      {
        y: 556,
        variant: 'body',
        text:
          '5.4  Notice of Change. The Practice shall notify the Lender in writing within ten (10) Business Days of any admission or withdrawal of a Member holding five percent (5%) or more of the equity of the Practice.',
      },
      {
        y: 640,
        variant: 'closing',
        text:
          'IN WITNESS WHEREOF, the undersigned has executed this Certificate as of the date first written above.',
      },
      {
        y: 702,
        variant: 'signature',
        text: 'Dr. Robert Miller, M.D., Managing Partner\nColumbus Medical Arts Center LLC',
      },
      {
        y: 796,
        variant: 'notary',
        text:
          'State of Ohio, County of Franklin — Subscribed and sworn to before me this ______ day of ____________, 2026.',
      },
    ],
  },
};
