import React, { useState, useEffect } from 'react';
import { PayoffItem, EntityResolutionData } from '../types';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Send,
  RotateCcw,
  Mail,
  Check,
} from 'lucide-react';

export interface AdvisorCandidate {
  id: string;
  name: string;
  title: string;
  certifications: string;
  email: string;
  phone: string;
  location: string;
  geographyProximity: string;
  geographyDetail: string;
  specialty: string;
  specialtyTags: string[];
  capacityLabel: 'Optimal' | 'Available' | 'Selective';
  capacityPct: number;
  capacityDetail: string;
  relationshipToPrincipals: string;
  relationshipEntity: string;
  isRecommended: boolean;
  matchScore: number;
  matchRationale: string;
}

interface AdvisorRoutingViewProps {
  deal: PayoffItem;
  entityData: EntityResolutionData;
  onBackToAnalysis: () => void;
  onProceedToRetention: () => void;
}

export const AdvisorRoutingView: React.FC<AdvisorRoutingViewProps> = ({
  deal,
  entityData,
  onBackToAnalysis,
  onProceedToRetention,
}) => {
  const primaryGrounded =
    entityData.grounded_members?.find((m) => m.is_guarantor) ||
    entityData.grounded_members?.[0];
  const principalName = primaryGrounded?.name || deal.primary_guarantor || 'Marcus Vance';
  const commercialRM = deal.commercial_rm || 'Greg Miller';

  // Candidate Wealth Advisors grounded in geography, specialty, capacity, and entity relationships
  const getCandidatesForDeal = (d: PayoffItem): AdvisorCandidate[] => {
    if (d.id === 'PO-2026-7492') {
      return [
        {
          id: 'adv-jenkins',
          name: 'Sarah Jenkins',
          title: 'Managing Director, Senior Private Wealth Advisor',
          certifications: 'CFP, CPWA',
          email: 'sarah.jenkins@huntington.com',
          phone: '(614) 480-4120',
          location: 'Downtown Columbus, OH',
          geographyProximity: '1.2 miles from facility',
          geographyDetail: 'Huntington Center Flagship, 41 S High St (Downtown Core)',
          specialty: 'Industrial Manufacturing Liquidity & Equipment Line Recapitalization',
          specialtyTags: ['Industrial Asset Disposition', 'SBA 7(a) Exit Proceeds', 'Depository Yield Optimization'],
          capacityLabel: 'Optimal',
          capacityPct: 72,
          capacityDetail: '18 active client families; capacity for 2 new relationships in Q3',
          relationshipToPrincipals: `Advisory relationship with Buckeye Precision vendor network; collaborated with commercial team on equipment lines.`,
          relationshipEntity: 'Buckeye Precision Vendor Network',
          isRecommended: true,
          matchScore: 96,
          matchRationale: 'Direct alignment with industrial manufacturing business owner liquidity and nearby Columbus market coverage.',
        },
        {
          id: 'adv-gallagher',
          name: 'Brian Gallagher',
          title: 'Senior Vice President, Private Wealth Advisor',
          certifications: 'CFA, CFP',
          email: 'brian.gallagher@huntington.com',
          phone: '(614) 480-8840',
          location: 'Easton Financial Center, Columbus, OH',
          geographyProximity: '9.4 miles northeast',
          geographyDetail: 'Easton Town Center Wealth Pavilion',
          specialty: 'Corporate Treasury Reinvestment & Executive Asset Allocation',
          specialtyTags: ['Fixed Income Laddering', 'Concentrated Risk', 'Depository Yield'],
          capacityLabel: 'Available',
          capacityPct: 56,
          capacityDetail: '14 active client families; ample bandwidth for active commercial liquidity management',
          relationshipToPrincipals: 'Secondary advisor on regional industrial supply vendor accounts; no direct family advisory ties.',
          relationshipEntity: 'Industrial Supply Network',
          isRecommended: false,
          matchScore: 88,
          matchRationale: 'Strong treasury fixed income capabilities, but less direct manufacturing principal relationship history.',
        },
        {
          id: 'adv-rostova',
          name: 'Elena Rostova',
          title: 'Managing Director, Family Office & Fiduciary Strategist',
          certifications: 'JD, CFP, ChFC',
          email: 'elena.rostova@huntington.com',
          phone: '(216) 515-6200',
          location: 'Northern Ohio Wealth Hub, Cleveland, OH',
          geographyProximity: 'Statewide Fiduciary Practice',
          geographyDetail: 'Cleveland Regional Trust & Estate Center',
          specialty: 'Multi-Generational Trust Structures & Fiduciary Entity Governance',
          specialtyTags: ['Dynasty Trusts', 'Fiduciary Governance', 'Succession Planning'],
          capacityLabel: 'Selective',
          capacityPct: 86,
          capacityDetail: '12 family office relationships; selective quarterly intake',
          relationshipToPrincipals: 'Consulted on Pendelton Family Trust legal documentation in 2022.',
          relationshipEntity: 'Pendelton Family Trust Liaison',
          isRecommended: false,
          matchScore: 78,
          matchRationale: 'High fiduciary credentials for family business succession, but remote from Columbus core.',
        },
      ];
    }
    if (d.id === 'PO-2026-6104') {
      return [
        {
          id: 'adv-jenkins',
          name: 'Sarah Jenkins',
          title: 'Managing Director, Senior Private Wealth Advisor',
          certifications: 'CFP, CPWA',
          email: 'sarah.jenkins@huntington.com',
          phone: '(614) 480-4120',
          location: 'Downtown Columbus, OH',
          geographyProximity: '2.1 miles from medical center',
          geographyDetail: 'Huntington Center Flagship, 41 S High St (Downtown Core)',
          specialty: 'Healthcare Practice Real Estate & Medical Group Liquidity',
          specialtyTags: ['Medical Arts Buildings', 'Physician Group Liquidity', 'Practice Recapitalization'],
          capacityLabel: 'Optimal',
          capacityPct: 72,
          capacityDetail: '18 active client families; capacity for 2 new relationships in Q3',
          relationshipToPrincipals: 'Advises multi-specialty physician practices across Central Ohio; prior consultation with Scioto Medical partners.',
          relationshipEntity: 'Scioto Medical Partners Network',
          isRecommended: true,
          matchScore: 97,
          matchRationale: 'Proven track record advising Columbus physician practices on clinical real estate disposition proceeds.',
        },
        {
          id: 'adv-gallagher',
          name: 'Brian Gallagher',
          title: 'Senior Vice President, Private Wealth Advisor',
          certifications: 'CFA, CFP',
          email: 'brian.gallagher@huntington.com',
          phone: '(614) 480-8840',
          location: 'Easton Financial Center, Columbus, OH',
          geographyProximity: '8.2 miles northeast',
          geographyDetail: 'Easton Town Center Wealth Pavilion',
          specialty: 'Corporate Treasury Reinvestment & Executive Asset Allocation',
          specialtyTags: ['Healthcare Reserves', 'Fixed Income Laddering', 'Cash Management'],
          capacityLabel: 'Available',
          capacityPct: 56,
          capacityDetail: '14 active client families; ample bandwidth for active commercial liquidity management',
          relationshipToPrincipals: 'Advises regional healthcare vendor credit facilities; no personal physician advisory ties.',
          relationshipEntity: 'Healthcare Vendor Network',
          isRecommended: false,
          matchScore: 85,
          matchRationale: 'Excellent institutional cash management, but less familiar with physician practice partnership structures.',
        },
        {
          id: 'adv-rostova',
          name: 'Elena Rostova',
          title: 'Managing Director, Family Office & Fiduciary Strategist',
          certifications: 'JD, CFP, ChFC',
          email: 'elena.rostova@huntington.com',
          phone: '(216) 515-6200',
          location: 'Northern Ohio Wealth Hub, Cleveland, OH',
          geographyProximity: 'Statewide Fiduciary Practice',
          geographyDetail: 'Cleveland Regional Trust & Estate Center',
          specialty: 'Multi-Generational Trust Structures & Fiduciary Entity Governance',
          specialtyTags: ['Physician Asset Protection', 'Dynasty Trusts', 'Fiduciary Governance'],
          capacityLabel: 'Selective',
          capacityPct: 86,
          capacityDetail: '12 family office relationships; selective quarterly intake',
          relationshipToPrincipals: 'Consulted on physician partnership trust structures with hospital legal counsel.',
          relationshipEntity: 'Medical Partnership Trust Liaison',
          isRecommended: false,
          matchScore: 81,
          matchRationale: 'Strong asset protection credentials for physicians, but geographically outside Columbus core.',
        },
      ];
    }
    return [
      {
        id: 'adv-jenkins',
        name: 'Sarah Jenkins',
        title: 'Managing Director, Senior Private Wealth Advisor',
        certifications: 'CFP, CPWA',
        email: 'sarah.jenkins@huntington.com',
        phone: '(614) 480-4120',
        location: 'Downtown Columbus, OH',
        geographyProximity: '0.4 miles from collateral',
        geographyDetail: 'Huntington Center Flagship, 41 S High St (Downtown Core)',
        specialty: 'Commercial Real Estate Liquidity & 1031 Exchange Reinvestment',
        specialtyTags: ['CRE Disposition Proceeds', 'Pass-Through Entity Wealth', 'Qualified Intermediary Coordination'],
        capacityLabel: 'Optimal',
        capacityPct: 72,
        capacityDetail: '18 active client families; capacity for 2 new UHNW relationships in Q3',
        relationshipToPrincipals: 'Primary wealth advisor for David Cole (Marcus Vance\'s co-investor in Riverfront Phase I); prior estate consultation with Vance 2018 Family Trust.',
        relationshipEntity: 'David Cole (Co-Investor) & Vance 2018 Family Trust',
        isRecommended: true,
        matchScore: 98,
        matchRationale: 'Immediate geographic proximity (0.4 mi), direct advisory relationship with principal co-investor David Cole, and specialized CRE liquidity focus.',
      },
      {
        id: 'adv-gallagher',
        name: 'Brian Gallagher',
        title: 'Senior Vice President, Private Wealth Advisor',
        certifications: 'CFA, CFP',
        email: 'brian.gallagher@huntington.com',
        phone: '(614) 480-8840',
        location: 'Easton Financial Center, Columbus, OH',
        geographyProximity: '11.8 miles north of collateral',
        geographyDetail: 'Easton Town Center Wealth Pavilion',
        specialty: 'Corporate Treasury Reinvestment & Executive Asset Allocation',
        specialtyTags: ['Depository Yield Optimization', 'Fixed Income Laddering', 'Concentrated Equity Risk'],
        capacityLabel: 'Available',
        capacityPct: 56,
        capacityDetail: '14 active client families; ample bandwidth for active commercial liquidity management',
        relationshipToPrincipals: 'Secondary advisor on Vance Holdings regional supply vendor credit facility; no personal advisory relationship with Marcus or Elena Vance.',
        relationshipEntity: 'Vance Holdings Vendor Network',
        isRecommended: false,
        matchScore: 86,
        matchRationale: 'Strong institutional fixed income expertise and high capacity, but lacks direct personal advisory history with entity co-investors.',
      },
      {
        id: 'adv-rostova',
        name: 'Elena Rostova',
        title: 'Managing Director, Family Office & Fiduciary Strategist',
        certifications: 'JD, CFP, ChFC',
        email: 'elena.rostova@huntington.com',
        phone: '(216) 515-6200',
        location: 'Northern Ohio Wealth Hub, Cleveland, OH',
        geographyProximity: 'Statewide Fiduciary Practice',
        geographyDetail: 'Cleveland Regional Trust & Estate Center',
        specialty: 'Multi-Generational Trust Structures & Fiduciary Entity Governance',
        specialtyTags: ['Dynasty Trusts', 'Fiduciary Governance', 'Generation-Skipping Wealth Transfer'],
        capacityLabel: 'Selective',
        capacityPct: 86,
        capacityDetail: '12 family office relationships; selective quarterly intake',
        relationshipToPrincipals: 'Consulted on Vance 2018 Family Trust documentation with legal counsel in 2021; collaborated with First American Title escrow services.',
        relationshipEntity: 'Vance 2018 Family Trust Legal Liaison',
        isRecommended: false,
        matchScore: 79,
        matchRationale: 'Top-tier estate and fiduciary credentials for complex trusts, but geographically remote from Columbus and near portfolio capacity.',
      },
    ];
  };

  const candidates = getCandidatesForDeal(deal);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('adv-jenkins');
  const selectedAdvisor = candidates.find((c) => c.id === selectedAdvisorId) || candidates[0];

  const clientDomain =
    deal.id === 'PO-2026-7492'
      ? 'buckeyetooling.com'
      : deal.id === 'PO-2026-6104'
      ? 'sciotomedical.com'
      : 'vanceproperties.com';
  const clientEmail = `${principalName.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.')}@${clientDomain}`;
  const refId = `INT-${deal.id.replace('PO-2026-', '')}`;

  // Default Email Generator based on Advisor & Deal
  const getEmailTemplate = (advisor: AdvisorCandidate) => {
    const firstName = principalName.split(' ')[0] || 'Marcus';
    const netProceedsM = (deal.estimated_net_equity / 1000000).toFixed(2);
    const closingDate = deal.scheduled_closing_date || 'September 16, 2026';

    const subject = `Introduction: ${advisor.name} & Huntington Private Wealth Planning | ${deal.property_name}`;

    const advisorDetailNote =
      advisor.id === 'adv-jenkins'
        ? deal.id === 'PO-2026-7492'
          ? `Sarah has extensive experience working with Ohio manufacturing principals on liquidity structuring, treasury management, and depository yield optimization.`
          : deal.id === 'PO-2026-6104'
          ? `Sarah has deep experience advising medical practice groups and clinical partners on healthcare facility monetization and liquidity management.`
          : `Sarah already advises your partner David Cole on his commercial real estate portfolio assets, and she has deep experience coordinating with title escrow teams on tax-deferred reinvestment strategies and depository yield optimization.`
        : advisor.id === 'adv-gallagher'
        ? `Brian works closely with commercial business owners across Ohio on institutional fixed income management, liquidity preservation, and cash deployment strategies.`
        : `Elena leads our family office fiduciary group, advising commercial principals on estate holding vehicles and multi-generational wealth preservation.`;

    const body = `Dear ${firstName},

It was a pleasure catching up during our annual review meeting at Huntington Center recently to discuss operations and lease performance at ${deal.property_name}.

With your payoff statement from ${deal.title_company} scheduled for closing on ${closingDate}, you will be resolving approximately $${netProceedsM}M in net equity proceeds. I wanted to personally introduce you to my colleague ${advisor.name} (${advisor.certifications}), ${advisor.title} with Huntington Private Bank.

${advisor.name} specializes in ${advisor.specialty.toLowerCase()}. ${advisorDetailNote}

I have asked ${advisor.name.split(' ')[0]} to connect with you directly for an informal 15-minute introductory conversation prior to your closing date. There is no preparation required on your end, and we will ensure all corporate documentation transfers smoothly between our commercial credit and private wealth desks under our client privacy safeguards.

Please feel free to reply directly to this email, or let me know if you would prefer for my office to coordinate a time for the three of us to meet.

Best regards,

${commercialRM}
Commercial Real Estate Banking
The Huntington National Bank | Columbus, OH
Office: (614) 480-3320 | ${commercialRM.toLowerCase().replace(' ', '.')}@huntington.com`;

    return { subject, body };
  };

  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedTimestamp, setSubmittedTimestamp] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Synchronize email draft when selected advisor changes
  useEffect(() => {
    const template = getEmailTemplate(selectedAdvisor);
    setEmailSubject(template.subject);
    setEmailBody(template.body);
    setIsSubmitted(false);
  }, [selectedAdvisorId, deal.id]);

  const handleResetTemplate = () => {
    const template = getEmailTemplate(selectedAdvisor);
    setEmailSubject(template.subject);
    setEmailBody(template.body);
    setIsSubmitted(false);
  };

  const handleSendEmail = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSubmitted(true);
      const now = new Date();
      setSubmittedTimestamp(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-16 space-y-6">
      {/* Swiss Editorial Breadcrumb & Navigation Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8">
        <button
          onClick={onBackToAnalysis}
          className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-slate-500 hover:text-[#006738] dark:text-slate-400 dark:hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Deal Analysis</span>
        </button>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#006738] dark:text-emerald-400">
          <span>Commercial Relationship Management</span>
          <span>&bull;</span>
          <span>Private Wealth Routing &amp; Intro</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Advisor Routing &amp; Client Introduction
        </h1>
      </div>

      {/* Main 2-Column Inspection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        {/* Left Column: 3 Candidate Advisors (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {candidates.map((advisor) => {
              const isSelected = advisor.id === selectedAdvisorId;

              return (
                <div
                  key={advisor.id}
                  onClick={() => setSelectedAdvisorId(advisor.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer select-none space-y-3.5 ${
                    isSelected
                      ? 'border-[#006738] dark:border-emerald-600 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-[#006738]/30 dark:ring-emerald-600/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Top Row: Name, Match & Recommendation */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-[#006738] dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                        {advisor.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {advisor.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-medium">
                            {advisor.certifications}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {advisor.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {advisor.isRecommended && (
                        <span className="text-[11px] font-bold text-[#006738] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Top Match
                        </span>
                      )}
                      <span className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">
                        {advisor.matchScore}%
                      </span>
                    </div>
                  </div>

                  {/* Scannable Key Factors */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Proximity</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {advisor.geographyProximity}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {advisor.location}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Capacity</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {advisor.capacityLabel} ({advisor.capacityPct}% book)
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        2 new UHNW openings
                      </span>
                    </div>

                    <div className="col-span-2 pt-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Specialty</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 block">
                        {advisor.specialty}
                      </span>
                    </div>

                    <div className="col-span-2 pt-0.5">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Principal Network Tie</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium block leading-relaxed">
                        {advisor.relationshipToPrincipals}
                      </span>
                    </div>
                  </div>

                  {/* Radio Selection Indicator */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      {isSelected ? 'Selected for warm introduction' : 'Click to select'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-xs ${
                        isSelected
                          ? 'text-[#006738] dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{isSelected ? 'Active' : 'Select'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Right Column: Draft Email Intro Composer (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          {/* Composer Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#006738] dark:text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Commercial RM Warm Introduction
              </h2>
            </div>

            <button
              type="button"
              onClick={handleResetTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"
              title="Reset email draft to template"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Submission Success Banner */}
          {isSubmitted && (
            <div className="p-4 bg-[#E8F5E9] dark:bg-emerald-950/50 border-b border-[#A7F3D0] dark:border-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#006738] dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#006738] dark:text-emerald-300">
                  Warm Introduction Dispatched
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                  Sent to <strong>{principalName}</strong> &bull; CC: <strong>{selectedAdvisor.name}</strong> ({selectedAdvisor.email})
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">
                  Logged in Commercial CRM &bull; {submittedTimestamp} &bull; Ref #{refId}
                </span>
              </div>
            </div>
          )}

          {/* Email Form Fields */}
          <div className="p-6 space-y-4 flex-1 flex flex-col">
            {/* Header Metadata Rows */}
            <div className="space-y-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-14 font-semibold uppercase tracking-wider text-slate-400 shrink-0">From:</span>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <span className="font-semibold">{commercialRM}</span>
                  <span className="text-slate-400">
                    &lt;{commercialRM.toLowerCase().replace(' ', '.')}@huntington.com&gt;
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-14 font-semibold uppercase tracking-wider text-slate-400 shrink-0">To:</span>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <span className="font-semibold">{principalName}</span>
                  <span className="text-slate-400">
                    &lt;{clientEmail}&gt;
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-14 font-semibold uppercase tracking-wider text-slate-400 shrink-0">CC:</span>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <span className="font-semibold">{selectedAdvisor.name}</span>
                  <span className="text-slate-400">&lt;{selectedAdvisor.email}&gt;</span>
                </div>
              </div>

              {/* Subject Field */}
              <div className="pt-1 flex items-center gap-3">
                <label
                  htmlFor="email-subject"
                  className="w-14 font-semibold uppercase tracking-wider text-slate-400 shrink-0"
                >
                  Subject:
                </label>
                <input
                  id="email-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => {
                    setEmailSubject(e.target.value);
                    setIsSubmitted(false);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-1 focus:ring-[#006738] transition"
                  placeholder="Subject line..."
                />
              </div>
            </div>

            {/* Email Body Textarea */}
            <div className="flex-1 flex flex-col space-y-1.5 min-h-[360px]">
              <textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => {
                  setEmailBody(e.target.value);
                  setIsSubmitted(false);
                }}
                className="w-full flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 font-sans text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#006738] transition resize-none select-text min-h-[360px]"
                placeholder="Write your email draft here..."
              />
            </div>

            {/* Compliance Note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006738] dark:text-emerald-400 shrink-0" />
              <span>GLBA Reg P Compliant &bull; Personal financials quarantined until verbal opt-in consent.</span>
            </div>

            {/* Bottom Action Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
              <span className="text-xs text-slate-400">
                {isSubmitted ? 'Logged in CRM.' : 'Draft auto-saved.'}
              </span>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSending || !emailSubject.trim() || !emailBody.trim()}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-wide transition active:scale-[0.98] ${
                  isSubmitted
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                    : 'bg-[#006738] hover:bg-[#1B5630] text-white shadow-xs'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSending ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Resend Intro</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Introduction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex items-center justify-end pt-1">
        <button
          type="button"
          onClick={onProceedToRetention}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#006738] hover:bg-[#1B5630] dark:bg-palette-accent-deep dark:hover:bg-[#28845e] text-white shadow-sm transition active:scale-[0.98]"
        >
          <span>Settlement Setup</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
