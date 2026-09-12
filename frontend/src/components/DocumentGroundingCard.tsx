import React, { useMemo } from 'react';
import { EntityResolutionData } from '../types';
import { FileText, ShieldCheck } from 'lucide-react';
import { DOCUMENT_FACSIMILES, FacsimileBlock } from '../lib/documentFacsimiles';

/**
 * Document grounding: the credit document, at readable size, with the
 * extraction regions drawn on the clauses they were read from.
 *
 * The payload has carried `bounding_box`, `document_name`, `document_vault_id`,
 * `inspected_page`, `total_pages` and `dlp_status` since the first build and no
 * view has ever rendered any of it, while the script promised "visual
 * bounding-box highlights". This is that promise, kept.
 *
 * Two decisions worth stating.
 *
 * It is rendered text, not an image. A page scaled down to thumbnail width is
 * illegible at any fidelity, so the viewer shows the document at 1:1 through a
 * window and scrolls to the selected region, the way document review tools
 * actually work. A board member can read the clause. They could not read a
 * 232px-wide picture of it.
 *
 * The page is serif while the application is sans. That is deliberate: it
 * signals "this is an artifact we are looking at", not another panel of our own
 * UI, and it is how every document viewer distinguishes content from chrome.
 * It is the one considered exception to the house sans-only rule and it is a
 * single declaration to revert.
 */

// Page units. Matches the margins the resolver reports: every region spans
// x 120-680, so the page is 800 wide with symmetric 120-unit margins, at US
// Letter proportions. One unit renders as one pixel.
const PAGE_W = 800;
const PAGE_H = 1035;

// The window onto the page. Crops the outer margin so the 560-unit text column
// fills the viewport at full size rather than being shrunk to fit.
const CROP_X = 104;
const VIEW_W = 592;
const VIEW_H = 470;

const MINIMAP_W = 78;
const MINIMAP_H = Math.round((MINIMAP_W * PAGE_H) / PAGE_W);

const VARIANT_CLASS: Record<FacsimileBlock['variant'], string> = {
  article: 'text-[12px] font-bold tracking-[0.22em]',
  title: 'text-[12px] font-bold tracking-[0.08em] leading-[1.5]',
  body: 'text-[11px] leading-[1.62] text-justify',
  clause: 'text-[11px] leading-[1.62] text-justify',
  closing: 'text-[11px] leading-[1.62]',
  signature: 'text-[11px] leading-[1.62]',
  notary: 'text-[10px] leading-[1.6] italic',
};

interface DocumentGroundingCardProps {
  entityData: EntityResolutionData;
  selectedMemberName: string | null;
  onSelectMember: (name: string) => void;
}

export const DocumentGroundingCard: React.FC<DocumentGroundingCardProps> = ({
  entityData,
  selectedMemberName,
  onSelectMember,
}) => {
  const members = entityData.grounded_members ?? [];
  const facsimile = DOCUMENT_FACSIMILES[entityData.payoff_id];

  const selected =
    members.find((m) => m.name === selectedMemberName) ?? members[0];

  // Centre the selected region in the window, clamped to the page.
  const scrollTop = useMemo(() => {
    if (!selected) return 0;
    const b = selected.bounding_box;
    const mid = b.ymin + (b.ymax - b.ymin) / 2;
    return Math.max(0, Math.min(mid - VIEW_H / 2, PAGE_H - VIEW_H));
  }, [selected]);

  if (members.length === 0 || !facsimile) return null;

  const box = selected.bounding_box;
  const boxFor = (name: string) =>
    members.find((m) => m.name === name)?.bounding_box;

  // Emphasise the resolved name inside the document language, so the tie
  // between the structured row and the source text is shown, not asserted.
  const snippet = box.text_snippet ?? '';
  const at = snippet.indexOf(selected.name);
  const quoted =
    at >= 0
      ? {
          before: snippet.slice(0, at),
          match: selected.name,
          after: snippet.slice(at + selected.name.length),
        }
      : { before: snippet, match: '', after: '' };

  return (
    <div className="bg-white dark:bg-palette-surface border border-slate-200/80 dark:border-palette-surface-3 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-palette-surface-3">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-palette-ink-4" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-palette-ink">
            Document Grounding
          </h2>
        </div>
        <span className="text-xs font-semibold text-[#006738] dark:text-palette-accent">
          Page {entityData.inspected_page} of {entityData.total_pages}
        </span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* The document, at full size, through a window. */}
        <div className="shrink-0 mx-auto xl:mx-0">
          <div
            className="relative overflow-hidden rounded-md border border-slate-300/90 dark:border-palette-surface-3 bg-white shadow-[0_1px_3px_rgba(16,33,29,0.10)]"
            style={{ width: VIEW_W, height: VIEW_H }}
          >
            <div
              className="absolute will-change-transform"
              style={{
                width: PAGE_W,
                height: PAGE_H,
                left: -CROP_X,
                top: -scrollTop,
                transition: 'top 420ms cubic-bezier(0.22, 0.61, 0.36, 1)',
              }}
            >
              {/* Running header */}
              <div
                className="absolute text-[9px] tracking-wide text-slate-400 flex justify-between"
                style={{ left: 120, top: 52, width: 560, fontFamily: 'Georgia, serif' }}
              >
                <span>{facsimile.headerLeft}</span>
                <span>{facsimile.headerRight}</span>
              </div>
              <div
                className="absolute border-t border-slate-200"
                style={{ left: 120, top: 76, width: 560 }}
              />

              {facsimile.blocks.map((block, i) => {
                const b = block.member ? boxFor(block.member) : undefined;
                const top = block.member ? b?.ymin ?? 0 : block.y ?? 0;
                const left = block.member ? b?.xmin ?? 120 : 120;
                const width = block.member
                  ? (b ? b.xmax - b.xmin : 560)
                  : 560;

                return (
                  <div
                    key={i}
                    className={`absolute text-slate-800 ${VARIANT_CLASS[block.variant]} ${
                      block.centered ? 'text-center' : ''
                    }`}
                    style={{
                      left,
                      top,
                      width,
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      whiteSpace: block.variant === 'signature' ? 'pre-line' : undefined,
                    }}
                  >
                    {block.variant === 'signature' && (
                      <div
                        className="border-t border-slate-400 mb-1.5"
                        style={{ width: 260 }}
                      />
                    )}
                    {block.text}
                  </div>
                );
              })}

              {/* Extraction regions, drawn where the resolver reported them. */}
              {members.map((member) => {
                const b = member.bounding_box;
                const isActive = member.name === selected.name;
                return (
                  <button
                    key={member.name}
                    type="button"
                    onClick={() => onSelectMember(member.name)}
                    title={`Source region for ${member.name}`}
                    className={`absolute rounded-[2px] transition-all duration-300 ${
                      isActive
                        ? 'bg-[#7ECF1C]/[0.18] border-2 border-[#006738]'
                        : 'border border-dashed border-slate-400/70 hover:border-[#006738] hover:bg-[#7ECF1C]/[0.08]'
                    }`}
                    style={{
                      left: b.xmin - 8,
                      top: b.ymin - 6,
                      width: b.xmax - b.xmin + 16,
                      height: b.ymax - b.ymin + 12,
                    }}
                  >
                    {isActive && (
                      <span className="absolute bottom-[2px] right-[2px] px-1 text-[8px] font-bold uppercase tracking-wider text-white bg-[#006738] rounded-[2px] leading-[13px] whitespace-nowrap">
                        {member.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Edges of the window, so it reads as a page continuing past the frame. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent" />
          </div>
        </div>

        {/* The record behind the highlight. */}
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-palette-ink-4 block">
                Source Document
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-palette-ink break-words">
                {entityData.document_name}
              </p>
              <p className="text-xs text-slate-500 dark:text-palette-ink-3 mt-0.5">
                {entityData.document_vault_id}
              </p>
            </div>

            {/* Page minimap: where on the page we are looking. */}
            <div
              className="relative shrink-0 rounded-sm border border-slate-200 dark:border-palette-surface-3 bg-slate-50 dark:bg-palette-surface-2"
              style={{ width: MINIMAP_W, height: MINIMAP_H }}
              aria-hidden="true"
            >
              {members.map((member) => {
                const b = member.bounding_box;
                const isActive = member.name === selected.name;
                return (
                  <div
                    key={member.name}
                    className={
                      isActive
                        ? 'absolute bg-[#006738] dark:bg-palette-accent'
                        : 'absolute bg-slate-300 dark:bg-palette-surface-3'
                    }
                    style={{
                      left: `${(b.xmin / PAGE_W) * 100}%`,
                      top: `${(b.ymin / PAGE_H) * 100}%`,
                      width: `${((b.xmax - b.xmin) / PAGE_W) * 100}%`,
                      height: `${Math.max((b.ymax - b.ymin) / PAGE_H, 0.02) * 100}%`,
                    }}
                  />
                );
              })}
              <div
                className="absolute border border-[#006738]/60 dark:border-palette-accent/60 bg-[#006738]/[0.07]"
                style={{
                  left: `${(CROP_X / PAGE_W) * 100}%`,
                  top: `${(scrollTop / PAGE_H) * 100}%`,
                  width: `${(VIEW_W / PAGE_W) * 100}%`,
                  height: `${(VIEW_H / PAGE_H) * 100}%`,
                  transition: 'top 420ms cubic-bezier(0.22, 0.61, 0.36, 1)',
                }}
              />
            </div>
          </div>

          {/* The extraction output. It lives inside this band rather than in a
              column of its own so that the list and the page it was read from
              are always on screen together -- the scripted beat is "click a
              name, watch the region move", which does not survive the two
              being a scroll apart. */}
          <div className="pt-3 border-t border-slate-100 dark:border-palette-surface-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-palette-ink-4">
                Beneficial Ownership
              </span>
              <span className="text-[11px] font-semibold text-[#006738] dark:text-palette-accent">
                EIN Verified
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-palette-surface-3">
              {members.map((member) => {
                const isActive = member.name === selected.name;
                const isExcluded =
                  member.exclusion_status &&
                  member.exclusion_status.includes('Excluded');
                return (
                  <button
                    key={member.name}
                    type="button"
                    onClick={() => onSelectMember(member.name)}
                    aria-pressed={isActive}
                    title={`Show the source region for ${member.name}`}
                    className={`w-full text-left py-2 -mx-2 px-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#006738]/[0.06] dark:bg-palette-accent/10'
                        : 'hover:bg-slate-50 dark:hover:bg-palette-surface-2'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900 dark:text-palette-ink truncate">
                        {member.name}
                      </span>
                      {member.ownership_pct > 0 && (
                        <span className="text-xs font-semibold text-slate-500 dark:text-palette-ink-3 shrink-0 tabular-nums">
                          {member.ownership_pct}% Equity
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-0.5 text-xs">
                      <span className="text-slate-400 dark:text-palette-ink-4 truncate">
                        {member.role}
                      </span>
                      {member.known_hban_balance > 0 && (
                        <span className="text-slate-600 dark:text-palette-ink-2 font-medium shrink-0 tabular-nums">
                          ${(member.known_hban_balance / 1000000).toFixed(2)}M on deposit
                        </span>
                      )}
                    </div>
                    {isExcluded && (
                      <div className="mt-1 inline-flex items-center text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        Excluded &bull; Non-guarantor
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-palette-surface-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-palette-ink-4 block mb-1.5">
              Extracted Region
              <span
                className="text-slate-300 dark:text-palette-ink-4 normal-case tracking-normal ml-2"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                x {box.xmin}–{box.xmax} · y {box.ymin}–{box.ymax}
              </span>
            </span>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-palette-ink-2">
              {quoted.before}
              {quoted.match && (
                <span className="font-bold text-slate-900 dark:text-palette-ink bg-[#7ECF1C]/25 dark:bg-palette-accent/20 px-0.5 rounded-sm">
                  {quoted.match}
                </span>
              )}
              {quoted.after}
            </p>
          </div>

          {entityData.dlp_status && (
            <div className="flex items-start gap-2 pt-3 border-t border-slate-100 dark:border-palette-surface-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006738] dark:text-palette-accent shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-palette-ink-3">
                {entityData.dlp_status}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
