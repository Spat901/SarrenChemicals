# SarrenChemicals.com Redesign — Design Document
**Date:** 2026-02-26

---

## Overview

Full redesign of sarrenchemicals.com. Clean, modern industrial aesthetic — light, minimal, not dark or heavy. Replaces the current dated site with a credibility-first B2B experience focused on two primary conversion actions: Submit RFQ and Sell Your Surplus.

---

## Brand Inputs

- **Industry:** Chemical distribution / surplus trading (B2B)
- **Tone:** Light, minimal, modern industrial
- **Existing colors:** White, Navy, Steel Gray (retained and refined)
- **Target audience:** Paint manufacturers, adhesive blenders, drymix producers, resin users, companies with surplus inventory
- **Logo:** Keep existing logo. Light cleanup OK.

---

## Page Structure — Classic (Option A)

Audience is already familiar with chemical distribution. No education required before conviction.

### Homepage Flow
1. Hero — Strong headline + subhead, single CTA (Submit RFQ)
2. What We Supply — Product category grid
3. How It Works — 3-step process (Browse → Inquire → Receive)
4. Sell Your Surplus — Secondary audience CTA block
5. Trust Signals — Years in business, volume, confidentiality promise
6. Footer — Nav, contact, PDF downloads

---

## Color Palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary | Deep Navy | `#1B3A6B` | CTAs, nav, headings, buttons |
| Secondary | Off-White | `#F5F6F7` | Page background, card fills |
| Accent | Steel Gray | `#8A9BAE` | Borders, dividers, muted text |
| Text | Dark Charcoal | `#1C2530` | All body copy and labels |

**Rules:**
- 80% of any page: Off-White + Charcoal text
- Navy for structural elements only (nav, headings, primary buttons)
- Steel Gray for borders, dividers, secondary text — never as a background
- No gradients. No heavy shadows.

---

## Typography

System font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

| Role | Size | Weight |
|---|---|---|
| H1 Display | 52px | 700 |
| H2 Section | 36px | 600 |
| H3 Subheading | 22px | 600 |
| Body | 17px | 400 |
| Label/Caption | 13px | 500, uppercase, letter-spacing: 0.08em |

- Line height: 1.6× body, 1.2× headings
- Max line length: 68 characters
- All-caps for category tags, nav labels, form field labels only

---

## Spacing & Layout

- Max content width: 1200px centered
- Section vertical padding: 96px
- Grid: 12-column, 24px gutters
- Card inner padding: 28px
- Border radius: 4px (no pill shapes)
- Button height: 48px standard, 40px compact

---

## Design Principles

1. White space is the primary design element — avoid density
2. Navy is authority, not decoration — structural use only
3. Every product card leads to one action: Request a Quote
4. Photography (real industrial) used full-bleed in hero only
5. No supplier names displayed anywhere — ever
6. Forms are first-class UI — full-width, zero friction

---

## Site Map

| Page | Primary Action |
|---|---|
| Home | Submit RFQ / Explore Products |
| Products | Browse categories → Request Quote |
| Sell Us Your Surplus | Surplus intake form |
| Logistics & Packaging | Informational |
| About | Trust building + secondary contact CTA |
| Contact | Simple contact form |

---

## Functional Requirements

- **No public eCommerce** — inquiry-only pricing
- **RFQ forms** on product pages
- **"Sell Us Your Surplus" form** — dedicated page
- **Simple contact form**
- **Downloadable PDFs:** Line card, Capability statement, sample COA
- **No supplier names displayed**
- **CRM integration** if straightforward (email fallback acceptable)
- **No booking/scheduling**

---

## Tech Stack

- Semantic HTML5
- Embedded CSS (no frameworks, no external dependencies)
- No JavaScript frameworks — vanilla JS for form handling only
- Form submissions: mailto fallback or simple backend email
- No CMS required for initial build

---

## Pages to Build

1. `index.html` — Home
2. `products.html` — Products
3. `sell-surplus.html` — Sell Us Your Surplus
4. `logistics.html` — Logistics & Packaging
5. `about.html` — About
6. `contact.html` — Contact
7. `css/style.css` — Global stylesheet
8. `pdfs/` — Placeholder directory for downloadable PDFs
