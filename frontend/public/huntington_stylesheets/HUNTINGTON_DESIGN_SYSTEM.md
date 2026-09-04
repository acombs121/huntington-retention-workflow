# Huntington Bank Design System & Brand Tokens Specification

Extracted directly from production stylesheets at **huntington.com**, **huntington.com/Commercial**, and **huntington.com/wealth-management** on September 4, 2026.

Corpus files archived in `./huntington_stylesheets/`:
- `toolkit.min.css` (414 KB) - Core Enterprise Presentation Toolkit
- `3e09be4101404dc9.css` (655 KB) - Modern Next.js Design System & Design Tokens
- `2eeceaa732015d8e.css` (24 KB) - Modern Component Library Stylesheet
- `inline_home.css` (137 KB) - Homepage Component CSS
- `inline_Commercial.css` (113 KB) - Commercial Banking Section CSS
- `inline_wealth-management.css` (1 KB) - Wealth Management CSS

---

## 1. Official Color Matrix & Palette Tokens

### 1.1 Brand Greens
| Token Name | Hex Code | Visual Role / Usage |
| :--- | :--- | :--- |
| `--hban-green` / `--green-900-dark` | `#006738` / `#2D822A` | Signature Huntington Corporate Green |
| `--green-midnight` | `#012D2A` / `#1C2025` | Deep Forest / Midnight (Header chrome & dark hero) |
| `--green-800-new` | `#1B5630` / `#58A71B` | Deep Button Hover & Pressed Surfaces |
| `--green-700-abundant` | `#7ECF1C` | Abundant High-Contrast Brand Green |
| `--energy-green` | `#A9D42C` | Energy Accent & Positive Highlights |
| `--green-300-light` | `#CDFA6C` | Active Hover / Interactive Focus Accent |
| `--green-100-pastel` | `#E1FFA0` | Soft Sage Tint (Active Badges, Subtle Tags) |
| `--hban-mint` / `--sage-prosperous` | `#E8F5E9` / `#B8EFE4` | Light Mint Backgrounds & Card Surfaces |

### 1.2 Neutral & Functional Colors
| Token Name | Hex Code | Visual Role / Usage |
| :--- | :--- | :--- |
| `--grey-900` | `#0F172A` / `#212529` | High-Contrast Primary Typography |
| `--grey-800` | `#394048` / `#334155` | Secondary Headlines & Section Titles |
| `--grey-600` | `#4C4E54` / `#64748B` | Subtitles, Captions & Muted Text |
| `--grey-300` | `#D5D5D5` / `#E2E8F0` | Subtle Hairline Borders |
| `--grey-100` | `#F2F2F2` / `#F8FAFC` | Surface & Canvas Backgrounds |
| `--white` | `#FFFFFF` | Card Containers & Crisp Surfaces |
| `--red-300-functional` | `#D32F2F` / `#D60000` | Critical Alerts & Flight Risk Badges |

---

## 2. Typography Hierarchy & Font Stacks

Huntington uses a dual-font brand system: a modern geometric humanist sans-serif (`Muli` and `Apex New`) for clean data readability, paired with `Georgia` / serif typography for institutional brand authority.

### 2.1 Font Stacks
- **Primary Brand Sans**: `'Mulish', 'Muli', 'Apex New', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Tabular Numerals**: Formatted using sans-serif with `tabular-nums` (`font-variant-numeric: tabular-nums`)
- **Zero Monospace Policy**: Code/monospace fonts are strictly removed; all technical figures render in clean sans-serif.

### 2.2 Scale & Weight Standards
| Level | Font Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `H1 Hero` | 32px - 40px | `700` (Bold) | 120% | Page Titles |
| `H2 Section` | 24px - 28px | `700` (Bold) | 120% | Section Headers |
| `H3 Subsection` | 18px - 20px | `600` (Semibold) | 120% | Card Titles |
| `Body Regular` | 14px - 16px | `400` (Regular) | 140% | Main Content Copy |
| `Label / Eyebrow` | 11px - 12px | `600` (Semibold) | 100% | Uppercase Eyebrows & Badges |
| `Financial Metrics` | 16px - 24px | `700` (Bold) | 100% | `tabular-nums` Currency & Yields |

---

## 3. Spacing & Layout Grid (4px Base Token System)

Huntington uses an explicit 4px rem-based spacing system:

```css
:root {
  --space-100: 0.25rem; /* 4px */
  --space-200: 0.5rem;  /* 8px */
  --space-300: 0.75rem; /* 12px */
  --space-400: 1.0rem;  /* 16px */
  --space-600: 1.5rem;  /* 24px */
  --space-800: 2.0rem;  /* 32px */
  --space-1000: 2.5rem; /* 40px */
  --space-1200: 3.0rem; /* 48px */
  --space-1600: 4.0rem; /* 64px */
  --space-2000: 5.0rem; /* 80px */
  --space-2400: 6.0rem; /* 96px */
}
```

---

## 4. Component Geometry & Border Radii

Huntington uses soft container geometry paired with distinctive pill buttons:

```css
:root {
  --radius-s: 0.25rem;              /* 4px - Inputs, small badges */
  --radius-m: 0.5rem;               /* 8px - Small cards, dropdowns */
  --radius-l: 1.0rem;               /* 16px - Primary cards & panels */
  --radius-xl: 1.5rem;              /* 24px - Hero containers & modals */
  --radius-button: var(--radius-full); /* Pill shape for primary CTAs */
  --radius-full: 9999px;
}
```

---

## 5. Official Motion & Animation Tokens

```css
:root {
  --curvea: cubic-bezier(0.6, 0, 0, 1);
  --curveb: cubic-bezier(0.8, 0, 0, 1);
  --curvec: cubic-bezier(1, 0, 0, 1);
  --curved: cubic-bezier(0, 0, 0, 1);
  --durationa: 167ms;
  --durationb: 333ms;
  --durationc: 500ms;
  --durationd: 1000ms;
}
```
