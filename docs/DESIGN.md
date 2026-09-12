# Design Specification & Brand Kit (`DESIGN.md`)

This document codifies the visual identity, design tokens, typography scale, component geometry, and interaction standards for **Huntington Book Scout**, adhering strictly to the Huntington Bancshares corporate brand guidelines and the **Google Cloud Run Demo** architectural specification.

---

## 1. Visual Archetype & Mood

- **Archetype**: **Executive Showcase & Swiss Technical Minimalism**
- **Design Intent**: Authoritative, institutionally credible private banking and commercial lending console. High-contrast tabular data display, disciplined whitespace, and zero decorative noise or AI glow effects.
- **Surface Styling**: Crisp white and slate surfaces, dark charcoal header accents, subtle borders (`var(--slate-200)`), and tactile controls.
- **Zero-Emoji Invariant**: Strictly **zero emojis** in UI copy, buttons, badges, or headers. Visual indicators use clean stroke SVG icons (Lucide/Phosphor) exclusively.

---

## 2. Color Palette & Design Tokens

### 2.1 Official Light Mode Semantic Palette Tokens

| Token | Hex Code | Role / Semantic Function |
| :--- | :--- | :--- |
| `bg` | `#F6F7F4` | Page ground canvas (warm chalk) |
| `surface` | `#FFFFFF` | Card container background |
| `surface-2` | `#EEF1EC` | Raised cards, active rows, hover states |
| `surface-3` | `#E3E8E2` | Control fill, inset panels, card borders |
| `ink` | `#16211D` | Primary text and headings |
| `ink-2` | `#3F4A45` | Secondary text, table subheaders |
| `ink-3` | `#6B7570` | Muted metadata, field labels |
| `ink-4` | `#98A390` | Disabled controls, tertiary borders |
| `accent` | `#1E5A45` | Forest accent UI, badges, focus rings |
| `accent-deep`| `#2E7D5B` | Primary button fill |
| `good` | `#2F6B4F` | Positive status indicator |
| `warn` | `#9A6A12` | Warning status indicator |
| `crit` | `#9C3B2E` | Critical status indicator |

### 2.2 Official Dark Mode Semantic Palette Tokens

| Token | Hex Code | Role / Semantic Function |
| :--- | :--- | :--- |
| `bg` | `#0E1412` | Page ground canvas (pitch pine forest) |
| `surface` | `#151D1A` | Card container background |
| `surface-2` | `#182521` | Raised cards, active rows, hover states |
| `surface-3` | `#22302A` | Control fill, inset panels, card borders |
| `ink` | `#F2F5F1` | Primary text and headings |
| `ink-2` | `#C6D0CA` | Secondary text, table subheaders |
| `ink-3` | `#8F9C95` | Muted metadata, field labels |
| `ink-4` | `#66736C` | Disabled controls, tertiary borders |
| `accent` | `#7FD1A9` | Mint accent UI, badges, focus rings |
| `accent-deep`| `#33A072` | Primary button fill |
| `good` | `#7FD1A9` | Positive status indicator |
| `warn` | `#E38341` | Warning status indicator |
| `crit` | `#E5736A` | Critical status indicator |

### 2.3 Autonomous Agent Type Identity Tokens (Bold & Branded)

All autonomous agent tags in runtime telemetry and orchestration logs are strictly rendered in **bold** (`font-bold`) using designated Huntington branding profile tokens:

| Agent Identifier | Hex Code | Brand Profile Token | Architectural Role |
| :--- | :--- | :--- | :--- |
| **`[INGESTION_AGENT]`** | `#7FD1A9` | HBAN Mint Accent (`palette.accent`) | Core banking pipeline event stream intake (core ledger, Pub/Sub) |
| **`[DETECTION_AGENT]`** | `#7FD1A9` | HBAN Mint Accent (`palette.accent`) | Fedwire clearing telemetry & title demand queue fusion |
| **`[CLASSIFICATION_AGENT]`**| `#E38341` | HBAN Brand Warn (`palette.warn`) | Liquidity event triage & commercial flight risk categorization |
| **`[ENTITY_AGENT]`** | `#B8EFE4` | HBAN Sage Prosperous (`hban.sage-prosperous`) | Gemini 3.7 Flash multimodal OCR & beneficial ownership resolution |
| **`[COMPLIANCE_GATE]`** | `#E5736A` | HBAN Brand Crit (`palette.crit`) | NPI handling standard (voluntary control) non-guarantor firewall sentry |
| **`[ENRICHMENT_AGENT]`** | `#7ECF1C` | HBAN Abundant Green (`hban.green-abundant`)| Executive 1-pager synthesis & unencumbered equity sizing |
| **`[ROUTING_AGENT]`** | `#A7F3D0` | HBAN Mint Border (`hban.mint-border`) | Wealth market advisor matching, capacity, & CSA leverage |
| **`[OUTREACH_AGENT]`** | `#7FD1A9` | HBAN Mint Accent (`palette.accent`) | Warm intro briefing generation for commercial bankers |
| **`[ORCHESTRATION_ENGINE]`**| `#7FD1A9` | HBAN Mint Accent (`palette.accent`) | Batch lifecycle management & Spanner graph synchrony |

---

## 3. Typography Scale & Swiss Editorial Hierarchy

- **Primary Sans-Serif Stack**: `'Mulish', 'Muli', 'Apex New', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`
- **Zero Monospace Policy**: **100% sans-serif** typography across all UI, financial tables, headers, and telemetry labels. Code/monospace fonts are strictly prohibited.
- **Financial Tabular Numbers**: Formatted using `tabular-nums` (`font-variant-numeric: tabular-nums`) with bold sans-serif weight.
- **Typographic Scale & Swiss Hierarchy**:
  - `Section Kicker / Eyebrow`: 11px / Uppercase / Tracking Widest (`text-xs font-bold uppercase tracking-widest text-[#006738]`)
  - `H1 Display`: 36px-42px / Extra Bold / Tight Tracking (`text-3xl md:text-4xl font-extrabold tracking-tight`)
  - `H2 Section`: 20px-24px / Bold / Tight Tracking (`text-xl md:text-2xl font-bold tracking-tight`)
  - `H3 Card Header`: 14px-16px / Bold (`text-sm md:text-base font-bold`)
  - `Body Copy`: 14px-16px / Regular / Leading Relaxed (`text-sm md:text-base text-slate-600 leading-relaxed`)
  - `Telemetry / Metadata Label`: 11px-12px / Uppercase Bold (`text-xs font-bold uppercase tracking-wider`)
  - `Financial Tabular Metrics`: Bold Sans-Serif with `tabular-nums font-bold`

---

## 4. Component Geometry & Elevation

- **Card Radii**: Clean `rounded-xl` (12px) for primary consoles; `rounded-2xl` (16px) for hero containers.
- **Button Radii**: Soft `rounded-lg` (8px).
- **Shadows**:
  - Regular Elevation: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`
  - Hero Elevation: `0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)`

---

## 5. Mandatory Admin Panel & Application Chrome

- **Gear Icon Placement**: Must be placed on the **far right** of the primary top navigation bar.
- **Icon Specifications**: SVG stroke icon (Lucide `Settings`), with `hover:rotate-45` smooth transition (200ms) and `active:scale-[0.98]`.
- **Slide-Out Drawer (`w-full max-w-md`)**:
  - Displays live telemetry badges: AI Platform (**Gemini Enterprise Agent Platform (fka Vertex AI Platform)**), Model Baseline (`gemini-3.7-flash`), Cloud Run Direct IAP Status, and Runtime SA (`huntington-book-scout-sa`).
  - Contains direct links to `/brand_kit.html` and `/demo_script.html`.
  - Dismissable via backdrop click, Escape key, or close button `X`.
