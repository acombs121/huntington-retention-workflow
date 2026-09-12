import React from 'react';
import { EntityResolutionData } from '../types';
import { FileText, ShieldCheck } from 'lucide-react';

/**
 * Document grounding: the extraction regions, drawn where they actually sit.
 *
 * The payload has carried `bounding_box`, `document_name`, `document_vault_id`,
 * `inspected_page`, `total_pages` and `dlp_status` since the first build, and
 * no view has ever rendered any of it -- while the script promised "visual
 * bounding-box highlights" and "clickable source citations". This closes that
 * gap using the data already on the wire.
 *
 * On honesty: this is not a picture of a document, and it is not pretending to
 * be one. It renders the *extracted text* at its *recorded coordinates*. Every
 * region in the fixtures spans x 120-680 with y varying per member -- symmetric
 * 120pt margins on an 800pt-wide page, US Letter proportions -- so the
 * rectangles land at genuinely correct relative positions rather than
 * art-directed ones. Nothing here is drawn that the resolver did not report.
 */

// Inferred from the fixtures, not invented: 120pt margins either side of a
// 680pt right edge give an 800pt page, and Letter ratio sets the height.
const PAGE_W = 800;
const PAGE_H = 1035;

interface DocumentGroundingCardProps {
  entityData: EntityResolutionData;
  /** Name of the member whose region is highlighted. */
  selectedMemberName: string | null;
  onSelectMember: (name: string) => void;
}

export const DocumentGroundingCard: React.FC<DocumentGroundingCardProps> = ({
  entityData,
  selectedMemberName,
  onSelectMember,
}) => {
  const members = entityData.grounded_members ?? [];
  if (members.length === 0) return null;

  const selected =
    members.find((m) => m.name === selectedMemberName) ?? members[0];
  const box = selected.bounding_box;

  // Emphasise the resolved name inside the document language, so the link
  // between the structured row and the source text is visible rather than
  // asserted.
  const snippet = box.text_snippet ?? '';
  const nameAt = snippet.indexOf(selected.name);
  const snippetParts =
    nameAt >= 0
      ? {
          before: snippet.slice(0, nameAt),
          match: selected.name,
          after: snippet.slice(nameAt + selected.name.length),
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

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Page facsimile: every reported region, at its reported position. */}
        <div className="shrink-0 mx-auto sm:mx-0">
          <div
            className="relative bg-slate-50 dark:bg-palette-surface-2 border border-slate-200 dark:border-palette-surface-3 rounded-lg overflow-hidden"
            style={{ width: 232, height: (232 * PAGE_H) / PAGE_W }}
            aria-hidden="true"
          >
            {/* Ruled lines stand in for body copy we are not reproducing. */}
            <div className="absolute inset-0 flex flex-col gap-[7px] px-4 pt-5 opacity-60">
              {Array.from({ length: 26 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[3px] rounded-full bg-slate-200 dark:bg-palette-surface-3"
                  style={{ width: `${68 + ((i * 37) % 30)}%` }}
                />
              ))}
            </div>

            {members.map((member) => {
              const b = member.bounding_box;
              const isActive = member.name === selected.name;
              return (
                <button
                  key={member.name}
                  type="button"
                  onClick={() => onSelectMember(member.name)}
                  title={member.name}
                  className={`absolute rounded-[3px] transition-all duration-200 ${
                    isActive
                      ? 'bg-[#006738]/20 dark:bg-palette-accent/25 border-2 border-[#006738] dark:border-palette-accent'
                      : 'border border-slate-300 dark:border-palette-surface-3 hover:border-[#006738]/60'
                  }`}
                  style={{
                    left: `${(b.xmin / PAGE_W) * 100}%`,
                    top: `${(b.ymin / PAGE_H) * 100}%`,
                    width: `${((b.xmax - b.xmin) / PAGE_W) * 100}%`,
                    height: `${((b.ymax - b.ymin) / PAGE_H) * 100}%`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* The record behind the highlight. */}
        <div className="min-w-0 flex-1 space-y-4">
          <div>
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

          <div>
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
              {snippetParts.before}
              {snippetParts.match && (
                <span className="font-bold text-slate-900 dark:text-palette-ink bg-[#7ECF1C]/25 dark:bg-palette-accent/20 px-0.5 rounded-sm">
                  {snippetParts.match}
                </span>
              )}
              {snippetParts.after}
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
