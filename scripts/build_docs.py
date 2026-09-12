#!/usr/bin/env python3
"""Generate the Admin Panel HTML documents from their Markdown sources.

WHY THIS EXISTS
---------------
An adversarial audit found that the hand-maintained HTML copies of
CITATIONS.md and DEMO_SCRIPT.md had drifted into being *less honest* than the
Markdown: supersession banners dropped, estimates rendered with the same green
treatment as verified facts, an open regulatory-risk section deleted outright,
and the strongest evidence section omitted entirely.

Patching the individual sites would have left the drift mechanism in place.
Instead the HTML is now DERIVED. The Markdown is the single source of truth and
the provenance signal is mechanical: a cell is styled as an estimate because the
Markdown marked it with a warning glyph, not because someone remembered to.

Run:  python3 scripts/build_docs.py
      python3 scripts/build_docs.py --check    # non-zero if output is stale

Dependency-free by design: this runs in CI and in the Docker build without
adding a Markdown library to requirements.
"""
from __future__ import annotations

import html
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DOCS = REPO / "docs"
PUBLIC = REPO / "frontend" / "public"
TEMPLATES = REPO / "scripts" / "templates"

GENERATED_BANNER = (
    "<!--\n"
    "  GENERATED FILE - DO NOT EDIT BY HAND.\n"
    "  Source: docs/{source}\n"
    "  Regenerate: python3 scripts/build_docs.py\n"
    "  Hand edits will be overwritten and, historically, drifted away from the\n"
    "  Markdown in ways that removed caveats. Edit the Markdown instead.\n"
    "-->\n"
)

# Extra styling for constructs the generator emits that the original
# hand-written pages did not have.
EXTRA_CSS = """
  <style>
    /* ---- generator-emitted constructs ---- */
    .doc-prose { font-size: 0.95rem; line-height: 1.65; margin: 0 0 1rem; }
    .doc-list { font-size: 0.95rem; line-height: 1.7; margin: 0 0 1rem 1.25rem; padding-left: 0.75rem; }
    .doc-list li { margin-bottom: 0.4rem; }
    .doc-list .doc-list { margin-top: 0.4rem; margin-bottom: 0.4rem; }
    .sub-heading { font-size: 1.05rem; font-weight: 700; margin: 1.75rem 0 0.75rem; }
    .callout {
      border-left: 4px solid var(--slate-300, #cbd5e1);
      background: rgba(148, 163, 184, 0.08);
      padding: 0.85rem 1.1rem; margin: 0 0 1.15rem; border-radius: 0 8px 8px 0;
      font-size: 0.92rem; line-height: 1.6;
    }
    .callout p:last-child { margin-bottom: 0; }
    .callout-note      { border-left-color: #3B82F6; background: rgba(59, 130, 246, 0.07); }
    .callout-tip       { border-left-color: #10B981; background: rgba(16, 185, 129, 0.07); }
    .callout-important { border-left-color: #006738; background: rgba(0, 103, 56, 0.07); }
    .callout-warning   { border-left-color: #E38341; background: rgba(227, 131, 65, 0.09); }
    .callout-caution   { border-left-color: #DC2626; background: rgba(220, 38, 38, 0.08); }
    /* Provenance is derived from the source glyph, never assigned by hand. */
    td.cell-verified { box-shadow: inset 3px 0 0 #006738; }
    td.cell-estimate { box-shadow: inset 3px 0 0 #E38341; background: rgba(227, 131, 65, 0.05); }
    td.cell-retracted { box-shadow: inset 3px 0 0 #DC2626; background: rgba(220, 38, 38, 0.05); }
    .doc-table { width: 100%; border-collapse: collapse; margin: 0 0 1.5rem; font-size: 0.88rem; }
    .doc-table th {
      text-align: left; padding: 0.7rem 0.9rem; font-size: 0.7rem;
      text-transform: uppercase; letter-spacing: 0.06em; font-weight: 800;
      border-bottom: 2px solid var(--slate-200, #e2e8f0);
    }
    .doc-table td {
      padding: 0.8rem 0.9rem; vertical-align: top; line-height: 1.55;
      border-bottom: 1px solid var(--slate-200, #e2e8f0);
    }
    .doc-hr { border: 0; border-top: 1px solid var(--slate-200, #e2e8f0); margin: 2rem 0; }
    .mermaid-src {
      font-size: 0.8rem; line-height: 1.5; padding: 1rem; overflow-x: auto;
      background: rgba(148, 163, 184, 0.08); border-radius: 8px; margin: 0 0 1.25rem;
    }

    /* ---- overflow containment ----
       Grid and flex items default to min-width:auto, so a long unbreakable
       label can push its track wider than its 1fr share and scroll the whole
       page sideways. These rules let the tracks actually shrink. */
    .timeline-nav { max-width: 100%; }
    .timeline-step { min-width: 0; overflow: hidden; }
    .timeline-step .step-num,
    .timeline-step .step-name,
    .timeline-step .step-time { display: block; min-width: 0; }
    .timeline-step .step-name {
      /* Wrapping beats a mid-word ellipsis in a nav strip. Three lines fits the
         longest label at the ~161px each track gets on a 1200px container. */
      white-space: normal;
      overflow-wrap: anywhere;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0.15rem 0;
    }
    .dim-col, .step-card, .qa-card, .problem-callout, .section-block { min-width: 0; }
    .dim-desc, .qa-a, .doc-prose, .doc-list li { overflow-wrap: anywhere; }
    .doc-table, .citation-table { max-width: 100%; }
    .doc-table td, .citation-table td,
    .doc-table th, .citation-table th { overflow-wrap: anywhere; }
    code { overflow-wrap: anywhere; }
  </style>
"""

ALERT_KINDS = {
    "NOTE": "note",
    "TIP": "tip",
    "IMPORTANT": "important",
    "WARNING": "warning",
    "CAUTION": "caution",
}

VERIFIED_GLYPH = "\u2705"          # white heavy check mark
WARN_GLYPHS = ("\u26a0", "\u2757")  # warning sign, exclamation
RETRACT_GLYPHS = ("\u26d4", "\u274c")  # no entry, cross mark


# --------------------------------------------------------------------------
# Inline rendering
# --------------------------------------------------------------------------

_CODE_TOKEN = "\x00CODE{}\x00"


def inline(text: str) -> str:
    """Convert Markdown inline syntax to HTML.

    Raw HTML and entities in the source are passed through untouched: the
    Markdown deliberately contains <br>, <strong> and &bull; for table cells.
    """
    codes: list[str] = []

    def stash(m: re.Match[str]) -> str:
        codes.append(m.group(1))
        return _CODE_TOKEN.format(len(codes) - 1)

    text = re.sub(r"`([^`]+)`", stash, text)
    text = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda m: _link(m.group(1), m.group(2)),
        text,
    )
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", text)
    text = re.sub(r"~~([^~]+)~~", r"<del>\1</del>", text)

    for i, c in enumerate(codes):
        text = text.replace(_CODE_TOKEN.format(i), f"<code>{html.escape(c)}</code>")
    return text


def _link(label: str, url: str) -> str:
    if url.startswith(("http://", "https://")):
        return (
            f'<a href="{html.escape(url, quote=True)}" target="_blank" '
            f'rel="noopener noreferrer">{label}</a>'
        )
    # Relative doc links point at repo Markdown that is not served; keep the
    # text, drop the dead href rather than shipping a 404.
    return label


# --------------------------------------------------------------------------
# Block parsing
# --------------------------------------------------------------------------

@dataclass
class Block:
    kind: str                    # heading|para|table|alert|list|hr|fence|checklist
    level: int = 0
    text: str = ""
    rows: list[list[str]] = field(default_factory=list)
    items: list[tuple[int, str, bool]] = field(default_factory=list)  # indent, text, ordered
    lang: str = ""


def parse(md: str) -> list[Block]:
    lines = md.split("\n")
    blocks: list[Block] = []
    i = 0
    para: list[str] = []

    def flush_para() -> None:
        nonlocal para
        if para:
            blocks.append(Block("para", text=" ".join(s.strip() for s in para)))
            para = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            flush_para()
            i += 1
            continue

        # fenced code
        if stripped.startswith("```"):
            flush_para()
            lang = stripped[3:].strip()
            body: list[str] = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                body.append(lines[i])
                i += 1
            i += 1
            blocks.append(Block("fence", text="\n".join(body), lang=lang))
            continue

        # heading
        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            flush_para()
            blocks.append(Block("heading", level=len(m.group(1)), text=m.group(2)))
            i += 1
            continue

        # horizontal rule
        if re.fullmatch(r"-{3,}|\*{3,}|_{3,}", stripped):
            flush_para()
            blocks.append(Block("hr"))
            i += 1
            continue

        # table
        if stripped.startswith("|"):
            flush_para()
            rows: list[list[str]] = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                rows.append(cells)
                i += 1
            # drop the |---|---| separator row
            rows = [r for r in rows if not all(re.fullmatch(r":?-{2,}:?", c) for c in r)]
            blocks.append(Block("table", rows=rows))
            continue

        # blockquote / alert
        if stripped.startswith(">"):
            flush_para()
            quoted: list[str] = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quoted.append(lines[i].strip().lstrip(">").strip())
                i += 1
            kind = "note"
            if quoted and (am := re.match(r"^\[!(\w+)\]$", quoted[0])):
                kind = ALERT_KINDS.get(am.group(1).upper(), "note")
                quoted = quoted[1:]
            elif quoted and any(g in quoted[0] for g in WARN_GLYPHS):
                kind = "warning"
            blocks.append(Block("alert", text=" ".join(quoted), lang=kind))
            continue

        # checklist
        if re.match(r"^-\s+\[[ xX]\]\s+", stripped):
            flush_para()
            items: list[tuple[int, str, bool]] = []
            while i < len(lines) and re.match(r"^-\s+\[[ xX]\]\s+", lines[i].strip()):
                t = re.sub(r"^-\s+\[[ xX]\]\s+", "", lines[i].strip())
                items.append((0, t, False))
                i += 1
            blocks.append(Block("checklist", items=items))
            continue

        # list
        if re.match(r"^([-*]|\d+\.)\s+", stripped):
            flush_para()
            items = []
            while i < len(lines):
                raw = lines[i]
                s = raw.strip()
                if not s:
                    # a blank line ends the list unless the next line is indented
                    if i + 1 < len(lines) and re.match(r"^\s{2,}\S", lines[i + 1]):
                        i += 1
                        continue
                    break
                lm = re.match(r"^([-*]|\d+\.)\s+(.*)$", s)
                if not lm:
                    # continuation of the previous item
                    if items:
                        ind, prev, ordered = items[-1]
                        items[-1] = (ind, prev + " " + s, ordered)
                        i += 1
                        continue
                    break
                indent = (len(raw) - len(raw.lstrip())) // 2
                ordered = bool(re.match(r"^\d+\.", lm.group(1)))
                items.append((indent, lm.group(2), ordered))
                i += 1
            blocks.append(Block("list", items=items))
            continue

        para.append(line)
        i += 1

    flush_para()
    return blocks


# --------------------------------------------------------------------------
# Shared renderers
# --------------------------------------------------------------------------

def provenance_class(cell: str) -> str:
    """Derive the provenance style from the glyph the AUTHOR wrote.

    This is the whole point of the generator: an estimate cannot be silently
    promoted to a verified badge, because nobody chooses the badge.
    """
    if any(g in cell for g in RETRACT_GLYPHS):
        return " class=\"cell-retracted\""
    if any(g in cell for g in WARN_GLYPHS):
        return " class=\"cell-estimate\""
    if VERIFIED_GLYPH in cell:
        return " class=\"cell-verified\""
    return ""


def render_table(b: Block, css_class: str = "doc-table") -> str:
    if not b.rows:
        return ""
    head, *body = b.rows
    out = [f'<table class="{css_class}">', "<thead><tr>"]
    out += [f"<th>{inline(c)}</th>" for c in head]
    out.append("</tr></thead><tbody>")
    for row in body:
        out.append("<tr>")
        for cell in row:
            out.append(f"<td{provenance_class(cell)}>{inline(cell)}</td>")
        out.append("</tr>")
    out.append("</tbody></table>")
    return "\n".join(out)


def render_list(items: list[tuple[int, str, bool]]) -> str:
    """Render a (possibly nested) list. Handles one level of nesting."""
    if not items:
        return ""
    out: list[str] = []
    stack: list[int] = []
    for indent, text, ordered in items:
        while stack and stack[-1] > indent:
            out.append("</ul>")
            stack.pop()
        if not stack or stack[-1] < indent:
            out.append('<ul class="doc-list">')
            stack.append(indent)
        out.append(f"<li>{inline(text)}</li>")
    out += ["</ul>"] * len(stack)
    return "\n".join(out)


def render_alert(b: Block) -> str:
    return f'<div class="callout callout-{b.lang}">{inline(b.text)}</div>'


def render_generic(b: Block) -> str:
    if b.kind == "para":
        return f'<p class="doc-prose">{inline(b.text)}</p>'
    if b.kind == "table":
        return render_table(b)
    if b.kind == "alert":
        return render_alert(b)
    if b.kind == "list":
        return render_list(b.items)
    if b.kind == "hr":
        return '<hr class="doc-hr">'
    if b.kind == "fence":
        return f'<pre class="mermaid-src">{html.escape(b.text)}</pre>'
    if b.kind == "heading":
        return f'<div class="sub-heading">{inline(b.text)}</div>'
    return ""


# --------------------------------------------------------------------------
# citations.html
# --------------------------------------------------------------------------

def build_citations() -> str:
    md = (DOCS / "CITATIONS.md").read_text(encoding="utf-8")
    blocks = parse(md)
    head = (TEMPLATES / "citations.head.html").read_text(encoding="utf-8")
    head = head.replace("</head>", EXTRA_CSS + "</head>")

    body: list[str] = [
        "<body>",
        "",
        '  <div class="header-bar">',
        "    <div>",
        '      <div class="header-title">Authoritative Citations &amp; Evidence Registry</div>',
        '      <div class="header-subtitle">Huntington Book Scout 2.0 (v6.0) &bull; '
        "Generated from docs/CITATIONS.md</div>",
        "    </div>",
        "  </div>",
        "",
    ]

    open_section = False
    for b in blocks:
        if b.kind == "heading" and b.level == 1:
            continue  # title lives in the header bar
        if b.kind == "heading" and b.level == 2:
            if open_section:
                body.append("  </div>")
            body.append('  <div class="section-block">')
            body.append(f'    <div class="section-heading">{inline(b.text)}</div>')
            open_section = True
            continue
        if b.kind == "hr":
            continue  # section blocks already separate the content
        if not open_section:
            body.append('  <div class="section-block">')
            open_section = True
        rendered = render_table(b, "citation-table") if b.kind == "table" else render_generic(b)
        if rendered:
            body.append("    " + rendered.replace("\n", "\n    "))

    if open_section:
        body.append("  </div>")

    body += [
        "",
        '  <div style="font-size: 0.85rem; color: var(--slate-500); text-align: center;'
        ' margin-top: 2rem; border-top: 1px solid var(--slate-200); padding-top: 1rem;">',
        "    Huntington Bancshares Incorporated &bull; Huntington Book Scout Project &bull;"
        " Generated from docs/CITATIONS.md",
        "  </div>",
        "",
        "</body>",
        "</html>",
        "",
    ]

    return GENERATED_BANNER.format(source="CITATIONS.md") + head + "\n".join(body)


# --------------------------------------------------------------------------
# demo_script.html
# --------------------------------------------------------------------------

STEP_RE = re.compile(r"^Step\s+(\d+):\s+(.*?)\s*\(([\d:]+)\s*[\u2013-]\s*([\d:]+)\)\s*$")


def _seconds(clock: str) -> int:
    mm, ss = clock.split(":")
    return int(mm) * 60 + int(ss)


def build_demo_script() -> str:
    md = (DOCS / "DEMO_SCRIPT.md").read_text(encoding="utf-8")
    blocks = parse(md)
    head = (TEMPLATES / "demo_script.head.html").read_text(encoding="utf-8")
    head = head.replace("</head>", EXTRA_CSS + "</head>")
    foot = (TEMPLATES / "demo_script.foot.html").read_text(encoding="utf-8")

    # Split into top-level sections keyed by their "## n." heading.
    sections: list[tuple[str, list[Block]]] = []
    current: tuple[str, list[Block]] | None = None
    for b in blocks:
        if b.kind == "heading" and b.level == 2:
            if current:
                sections.append(current)
            current = (b.text, [])
        elif current:
            current[1].append(b)
        # blocks before the first ## (title, intro) are intentionally dropped:
        # the template header already carries the title and subtitle.
    if current:
        sections.append(current)

    out: list[str] = ["<body>", '  <div class="container">']
    out.append(_demo_header())

    steps: list[tuple[int, str, str, str, list[Block]]] = []
    seen_numbered = False

    for title, content in sections:
        low = title.lower()
        if not re.match(r"^\d+\.", low):
            # Prologue (the document subtitle) precedes section 1; the template
            # header already carries it. Anything unnumbered AFTER section 1 is
            # real content and still gets rendered.
            if not seen_numbered:
                continue
            out.append(
                '    <section class="step-card">'
                f'<div class="step-name">{inline(title)}</div>'
                + "".join(render_generic(b) for b in content)
                + "</section>"
            )
            continue
        seen_numbered = True
        if low.startswith("1."):
            out.append(_demo_callout(title, content))
        elif low.startswith("2."):
            out.append(_demo_checklist(title, content))
        elif low.startswith("3."):
            steps = _collect_steps(content)
            out.append(_demo_timeline(steps))
            for s in steps:
                out.append(_demo_step_card(*s))
        elif low.startswith("4."):
            out.append(_demo_qa(title, content))
        else:
            out.append(
                '    <section class="step-card">'
                f'<div class="step-name">{inline(title)}</div>'
                + "".join(render_generic(b) for b in content)
                + "</section>"
            )

    out += [
        '    <div class="doc-prose" style="text-align:center; margin-top:2rem;'
        ' opacity:0.7; font-size:0.85rem;">',
        "      Generated from docs/DEMO_SCRIPT.md &bull; do not edit this file directly.",
        "    </div>",
        "  </div>",
    ]
    return (
        GENERATED_BANNER.format(source="DEMO_SCRIPT.md")
        + head
        + "\n".join(out)
        + "\n"
        + foot
    )


def _demo_header() -> str:
    return """    <header class="header-bar">
      <div class="title-area">
        <div class="brand-eyebrow">Institutional Executive Presentation &bull; C-Level Blueprint</div>
        <h1>Huntington Book Scout 2.0 <span class="green-mark">Customer Demo Script</span></h1>
        <p>Executive Presentation Walkthrough, Spanner Graph Grounding Defense, &amp; OCC/GLBA Regulatory Safe Harbors (v6.0)</p>
      </div>
      <div class="header-actions">
        <span class="version-tag">Production v6.0</span>
        <button type="button" class="theme-btn" onclick="toggleTheme()">
          <span id="theme-icon">&#9681;</span>
          <span id="theme-text">Toggle Dark / Light</span>
        </button>
      </div>
    </header>
"""


def _demo_callout(title: str, content: list[Block]) -> str:
    inner = "\n".join(render_generic(b) for b in content if render_generic(b))
    return (
        '    <section class="problem-callout">\n'
        f'      <div class="section-heading">{inline(title)}</div>\n'
        f"      {inner}\n"
        "    </section>\n"
    )


def _demo_checklist(title: str, content: list[Block]) -> str:
    parts = [
        '    <section class="checklist-card">',
        f'      <div class="section-heading">{inline(title)}</div>',
        '      <div class="checklist-grid">',
    ]
    for b in content:
        if b.kind == "checklist":
            for _, text, _ in b.items:
                # Deliberately UNCHECKED. A pre-flight list that ships complete
                # asserts a verification nobody performed.
                parts.append(
                    '        <label class="check-item">'
                    '<input type="checkbox"> '
                    f"<span>{inline(text)}</span></label>"
                )
        else:
            r = render_generic(b)
            if r:
                parts.append("      " + r)
    parts += ["      </div>", "    </section>", ""]
    return "\n".join(parts)


def _collect_steps(content: list[Block]) -> list[tuple[int, str, str, str, list[Block]]]:
    steps: list[tuple[int, str, str, str, list[Block]]] = []
    cur: list | None = None
    for b in content:
        if b.kind == "heading" and b.level == 3:
            m = STEP_RE.match(b.text)
            if m:
                if cur:
                    steps.append(tuple(cur))  # type: ignore[arg-type]
                cur = [int(m.group(1)), m.group(2), m.group(3), m.group(4), []]
                continue
        if cur:
            cur[4].append(b)
    if cur:
        steps.append(tuple(cur))  # type: ignore[arg-type]
    return steps


def _demo_timeline(steps: list[tuple[int, str, str, str, list[Block]]]) -> str:
    parts = ['    <nav class="timeline-nav">']
    for num, name, start, _end, _ in steps:
        # Block-level children: inline spans ignore overflow/text-overflow, which
        # is why these labels used to run together and bleed past the container.
        parts.append(
            '      <div class="timeline-step">'
            f'<div class="step-num">{num}</div>'
            f'<div class="step-name">{inline(name)}</div>'
            f'<div class="step-time">{start}</div></div>'
        )
    parts += ["    </nav>", ""]
    return "\n".join(parts)


DIM_TITLES = {
    "presenter action": "Presenter Action",
    "what is shown in the demo": "What is Shown in the Demo",
    "production implementation blueprint": "Production Implementation Blueprint",
}


def _demo_step_card(
    num: int, name: str, start: str, end: str, content: list[Block]
) -> str:
    duration = _seconds(end) - _seconds(start)
    summary = ""
    dims: list[tuple[str, list[tuple[int, str, bool]]]] = []
    extras: list[str] = []

    for b in content:
        if b.kind == "para" and not summary:
            summary = b.text.strip().strip("*")
            continue
        if b.kind == "list":
            # A step's list is "- **Dim Title**:" with nested detail items.
            buf: list[tuple[int, str, bool]] = []
            title = ""
            for indent, text, ordered in b.items:
                key = re.sub(r"[*:`]", "", text).strip().lower()
                if indent == 0 and key in DIM_TITLES:
                    if title:
                        dims.append((title, buf))
                        buf = []
                    title = DIM_TITLES[key]
                else:
                    buf.append((max(indent - 1, 0), text, ordered))
            if title:
                dims.append((title, buf))
            continue
        if b.kind == "hr":
            continue  # the card border already separates steps
        r = render_generic(b)
        if r:
            extras.append(r)

    parts = [
        '    <section class="step-card">',
        '      <div class="step-header">',
        f'        <div class="step-num">{num}</div>',
        "        <div>",
        f'          <div class="step-name">{inline(name)}</div>',
        f'          <div class="step-time">{start} &ndash; {end}</div>',
        "        </div>",
        f'        <div class="step-badge">{duration}s</div>',
        "      </div>",
    ]
    if summary:
        parts.append(f'      <div class="step-summary">{inline(summary)}</div>')
    parts += extras
    if dims:
        parts.append('      <div class="dim-row">')
        for title, items in dims:
            parts.append('        <div class="dim-col">')
            parts.append(f'          <div class="dim-title">{title}</div>')
            parts.append(f'          <div class="dim-desc">{_step_items(items)}</div>')
            parts.append("        </div>")
        parts.append("      </div>")
    parts += ["    </section>", ""]
    return "\n".join(parts)


def _step_items(items: list[tuple[int, str, bool]]) -> str:
    """Render step detail items, promoting spoken quotes to .script-quote."""
    out: list[str] = []
    open_list = False
    for _indent, text, _ordered in items:
        t = text.strip()
        if t.startswith('*"') and t.endswith('"*'):
            if open_list:
                out.append("</ul>")
                open_list = False
            out.append(f'<div class="script-quote">{inline(t)}</div>')
        else:
            if not open_list:
                out.append('<ul class="doc-list">')
                open_list = True
            out.append(f"<li>{inline(t)}</li>")
    if open_list:
        out.append("</ul>")
    return "\n".join(out)


def _demo_qa(title: str, content: list[Block]) -> str:
    parts = [
        '    <section class="qa-card">',
        f'      <div class="qa-title">{inline(title)}</div>',
    ]
    n = 0
    for b in content:
        if b.kind == "list":
            for indent, text, _ in b.items:
                if indent > 0:
                    continue
                # "**Question**  → Answer"
                m = re.match(r'^\*\*[\u201c"](.+?)[\u201d"]\*\*\s*(?:\u2192|->)?\s*(.*)$',
                             text, re.S)
                if not m:
                    m2 = re.match(r"^(.*?)\s*(?:\u2192|->)\s*(.*)$", text, re.S)
                    if not m2:
                        continue
                    q, a = m2.group(1), m2.group(2)
                else:
                    q, a = m.group(1), m.group(2)
                n += 1
                parts += [
                    '      <div class="qa-item">',
                    f'        <div class="qa-q"><span class="q-badge">Q{n}</span>'
                    f"{inline(q.strip())}</div>",
                    f'        <div class="qa-a">{inline(a.strip())}</div>',
                    "      </div>",
                ]
        elif b.kind == "alert":
            parts.append("      " + render_alert(b))
        else:
            r = render_generic(b)
            if r:
                parts.append("      " + r)
    parts += ["    </section>", ""]
    return "\n".join(parts)


# --------------------------------------------------------------------------

OUTPUTS = {
    PUBLIC / "citations.html": build_citations,
    PUBLIC / "demo_script.html": build_demo_script,
}


def main() -> int:
    check = "--check" in sys.argv
    stale = 0
    for path, builder in OUTPUTS.items():
        generated = builder()
        existing = path.read_text(encoding="utf-8") if path.exists() else ""
        if generated == existing:
            print(f"  up to date  {path.relative_to(REPO)}")
            continue
        if check:
            stale += 1
            print(f"  STALE       {path.relative_to(REPO)}")
        else:
            path.write_text(generated, encoding="utf-8")
            print(f"  wrote       {path.relative_to(REPO)}  ({len(generated):,} bytes)")
    if check and stale:
        print(f"\n{stale} file(s) out of date. Run: python3 scripts/build_docs.py")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
