# Design Specification & Brand Kit (`DESIGN.md`)

This document codifies the visual identity, design tokens, typography scale, component geometry, and interaction standards for **Huntington Horizon**, adhering strictly to the Huntington Bancshares corporate brand guidelines and the **Google Cloud Run Demo** architectural specification.

---

## 1. Visual Archetype & Mood

- **Archetype**: **Executive Showcase & Swiss Technical Minimalism**
- **Design Intent**: Authoritative, institutionally credible private banking and commercial lending console. High-contrast tabular data display, disciplined whitespace, and zero decorative noise or AI glow effects.
- **Surface Styling**: Crisp white and slate surfaces, dark charcoal header accents, subtle borders (`var(--slate-200)`), and tactile controls.
- **Zero-Emoji Invariant**: Strictly **zero emojis** in UI copy, buttons, badges, or headers. Visual indicators use clean stroke SVG icons (Lucide/Phosphor) exclusively.

---

## 2. Color Palette & Design Tokens

### 2.1 CSS Variables / Theme Tokens

| Token Name | Light Mode Value | Dark Mode Value | Usage / Role |
| :--- | :--- | :--- | :--- |
| `--hban-green` | `#006738` | `#00884A` | Huntington Signature Green (Primary Brand Anchor) |
| `--hban-green-dark` | `#004724` | `#003319` | Deep Forest Green (Hero surfaces, primary buttons) |
| `--hban-mint` | `#E8F5E9` | `#064E3B` | Soft Sage Tint (Active pills, positive status tags) |
| `--hban-mint-border` | `#A7F3D0` | `#047857` | Mint Hairline Borders |
| `--bg-canvas` | `#F8FAFC` (Slate-50) | `#0B1320` | Application body background |
| `--bg-surface` | `#FFFFFF` | `#1E293B` (Slate-800) | Card, modal, and panel backgrounds |
| `--border-subtle` | `#E2E8F0` (Slate-200) | `#334155` (Slate-700) | Card and input container borders |
| `--text-primary` | `#0F172A` (Charcoal) | `#F8FAFC` (Slate-50) | Primary headers and high-contrast labels |
| `--text-secondary` | `#64748B` (Slate-500) | `#94A3B8` (Slate-400) | Subtitles, helper text, and secondary tags |
| `--hban-charcoal` | `#0F172A` | `#020617` | Executive hero gradient and header chrome |

### 2.2 Brand Palette Ramp (Tailwind `colors.brand`)

- `brand-50`: `#F0FDF4`
- `brand-100`: `#DCFCE7`
- `brand-200`: `#BBF7D0`
- `brand-300`: `#86EFAC`
- `brand-400`: `#4ADE80`
- `brand-500`: `#22C55E`
- `brand-600`: `#006738` *(Huntington Corporate Green)*
- `brand-700`: `#004724` *(Deep Forest)*
- `brand-800`: `#003319` *(Darker Forest)*
- `brand-900`: `#0B2818`
- `brand-950`: `#041A0E`

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
  - Displays live telemetry badges: AI Platform (**Gemini Enterprise Agent Platform (fka Vertex AI Platform)**), Model Baseline (`gemini-3.7-flash`), Cloud Run Direct IAP Status, and Runtime SA (`huntington-horizon-sa`).
  - Contains direct links to `/brand_kit.html` and `/demo_script.html`.
  - Dismissable via backdrop click, Escape key, or close button `X`.
