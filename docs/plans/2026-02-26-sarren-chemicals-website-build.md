# SarrenChemicals Website Build — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 6-page static HTML/CSS website for SarrenChemicals — clean, modern industrial aesthetic, inquiry-only, no eCommerce.

**Architecture:** Pure semantic HTML5 + embedded CSS in a single global stylesheet. Vanilla JS only for form behavior. No frameworks, no CDN dependencies, no external fonts. All pages share one nav and one footer via copy-paste (no SSI/JS includes — static only). Forms use mailto fallback.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (form validation only), no build tools required.

**Design Reference:** `docs/plans/2026-02-26-sarren-chemicals-website-design.md`

---

## Project Structure (Target)

```
SarrenChemicals/
├── index.html
├── products.html
├── sell-surplus.html
├── logistics.html
├── about.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
│   └── (placeholder slots — filenames documented per page)
├── pdfs/
│   └── README.md   (placeholder, list expected PDFs)
└── docs/
    └── plans/
```

---

## Design Token Reference (use throughout)

```css
/* Colors */
--navy:      #1B3A6B;
--offwhite:  #F5F6F7;
--steel:     #8A9BAE;
--charcoal:  #1C2530;
--white:     #FFFFFF;
--border:    #D8DDE3;

/* Typography */
--font: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--h1: 52px / 700;
--h2: 36px / 600;
--h3: 22px / 600;
--body: 17px / 400;
--label: 13px / 500 uppercase letter-spacing 0.08em;

/* Spacing */
--section-pad: 96px;
--card-pad: 28px;
--max-width: 1200px;
--radius: 4px;
--btn-height: 48px;
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `css/style.css`
- Create: `js/main.js`
- Create: `images/` (empty dir with `.gitkeep`)
- Create: `pdfs/README.md`

**Step 1: Create directory structure**

```bash
mkdir -p css js images pdfs
touch images/.gitkeep
```

**Step 2: Create `pdfs/README.md`**

```markdown
# PDF Downloads

Place the following files in this directory:

- `sarren-line-card.pdf` — Product line card
- `sarren-capability-statement.pdf` — Capability statement
- `sarren-sample-coa.pdf` — Sample Certificate of Analysis

These are linked from the footer of all pages.
```

**Step 3: Create `js/main.js` (stub)**

```js
// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form[data-form]');
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
});

function handleFormSubmit(e) {
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;
  // Form submits normally via action="mailto:..." or server endpoint
}
```

**Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold project structure"
```

---

## Task 2: Global Stylesheet (`css/style.css`)

**Files:**
- Create: `css/style.css`

**Step 1: Write CSS reset + custom properties**

```css
/* ==========================================
   SARREN CHEMICALS — Global Stylesheet
   Design ref: docs/plans/2026-02-26-sarren-chemicals-website-design.md
   ========================================== */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy:     #1B3A6B;
  --offwhite: #F5F6F7;
  --steel:    #8A9BAE;
  --charcoal: #1C2530;
  --white:    #FFFFFF;
  --border:   #D8DDE3;
  --font:     -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --max-w:    1200px;
  --section:  96px;
  --card-pad: 28px;
  --radius:   4px;
}

html { font-size: 17px; }
body {
  font-family: var(--font);
  color: var(--charcoal);
  background: var(--white);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
```

**Step 2: Write typography styles**

```css
/* --- Typography --- */
h1 { font-size: 52px; font-weight: 700; line-height: 1.15; color: var(--navy); }
h2 { font-size: 36px; font-weight: 600; line-height: 1.2;  color: var(--navy); }
h3 { font-size: 22px; font-weight: 600; line-height: 1.3;  color: var(--navy); }
p  { font-size: 17px; line-height: 1.6; color: var(--charcoal); max-width: 68ch; }
a  { color: var(--navy); text-decoration: none; }
a:hover { text-decoration: underline; }

.label {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--steel);
}
```

**Step 3: Write layout utilities**

```css
/* --- Layout --- */
.container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 32px;
}

section {
  padding: var(--section) 0;
}

.section-alt {
  background: var(--offwhite);
}

.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }

@media (max-width: 900px) {
  .grid-3, .grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  h1 { font-size: 36px; }
  h2 { font-size: 28px; }
  .container { padding: 0 20px; }
  section { padding: 64px 0; }
}
```

**Step 4: Write button styles**

```css
/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  height: 48px;
  padding: 0 28px;
  border-radius: var(--radius);
  font-family: var(--font);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  border: 2px solid transparent;
  text-decoration: none;
}

.btn-primary {
  background: var(--navy);
  color: var(--white);
  border-color: var(--navy);
}
.btn-primary:hover {
  background: #152f59;
  border-color: #152f59;
  text-decoration: none;
}

.btn-outline {
  background: transparent;
  color: var(--navy);
  border-color: var(--navy);
}
.btn-outline:hover {
  background: var(--navy);
  color: var(--white);
  text-decoration: none;
}

.btn-white {
  background: var(--white);
  color: var(--navy);
  border-color: var(--white);
}
.btn-white:hover {
  background: var(--offwhite);
  text-decoration: none;
}
```

**Step 5: Write nav styles**

```css
/* --- Navigation --- */
.site-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--white);
  border-bottom: 1px solid var(--border);
}

.nav-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 32px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo img { height: 40px; width: auto; display: block; }
.nav-logo span {
  font-size: 20px;
  font-weight: 700;
  color: var(--navy);
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 36px;
  list-style: none;
  align-items: center;
}
.nav-links a {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--charcoal);
  text-transform: uppercase;
}
.nav-links a:hover { color: var(--navy); text-decoration: none; }
.nav-links a.active { color: var(--navy); font-weight: 600; }

.nav-cta { margin-left: 16px; }

.nav-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  flex-direction: column;
  gap: 5px;
}
.nav-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--charcoal);
  transition: transform 0.2s;
}

@media (max-width: 768px) {
  .nav-toggle { display: flex; }
  .nav-links {
    display: none;
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    flex-direction: column;
    padding: 24px 32px;
    gap: 20px;
    align-items: flex-start;
  }
  .nav-links.open { display: flex; }
  .nav-cta { width: 100%; }
  .nav-cta .btn { width: 100%; justify-content: center; }
}
```

**Step 6: Write footer styles**

```css
/* --- Footer --- */
.site-footer {
  background: var(--navy);
  color: var(--white);
  padding: 64px 0 32px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 48px;
}

.footer-brand p {
  color: rgba(255,255,255,0.7);
  font-size: 15px;
  margin-top: 16px;
  max-width: 280px;
}

.footer-col h4 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.5);
  margin-bottom: 16px;
}

.footer-col ul { list-style: none; }
.footer-col li { margin-bottom: 10px; }
.footer-col a {
  color: rgba(255,255,255,0.8);
  font-size: 15px;
}
.footer-col a:hover { color: var(--white); text-decoration: none; }

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: rgba(255,255,255,0.4);
}

@media (max-width: 900px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .footer-grid { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
}
```

**Step 7: Write card, form, and hero shared styles**

```css
/* --- Cards --- */
.card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--card-pad);
}
.card:hover { border-color: var(--steel); }

/* --- Hero --- */
.hero {
  position: relative;
  background: var(--navy);
  color: var(--white);
  padding: 120px 0;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.18;
}
.hero-content { position: relative; z-index: 1; max-width: 680px; }
.hero h1 { color: var(--white); margin-bottom: 24px; }
.hero p  { color: rgba(255,255,255,0.85); font-size: 19px; margin-bottom: 40px; max-width: 60ch; }
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }

/* --- Page hero (interior pages) --- */
.page-hero {
  background: var(--offwhite);
  border-bottom: 1px solid var(--border);
  padding: 64px 0;
}
.page-hero .label { margin-bottom: 12px; }
.page-hero h1 { font-size: 40px; margin-bottom: 16px; }
.page-hero p { color: var(--steel); font-size: 18px; }

/* --- Forms --- */
.form-group { margin-bottom: 24px; }
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--steel);
  margin-bottom: 8px;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: var(--font);
  font-size: 16px;
  color: var(--charcoal);
  background: var(--white);
  transition: border-color 0.15s;
}
.form-group textarea {
  height: 140px;
  padding: 16px;
  resize: vertical;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--navy);
}
.form-note {
  font-size: 13px;
  color: var(--steel);
  margin-top: 12px;
}

/* --- Section headings --- */
.section-header { margin-bottom: 56px; }
.section-header .label { margin-bottom: 12px; }
.section-header h2 { margin-bottom: 16px; }
.section-header p { color: var(--steel); font-size: 18px; }

/* --- Trust bar --- */
.trust-bar {
  background: var(--offwhite);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 48px 0;
}
.trust-stats {
  display: flex;
  justify-content: center;
  gap: 80px;
  flex-wrap: wrap;
}
.trust-stat { text-align: center; }
.trust-stat .stat-number {
  font-size: 42px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1;
  margin-bottom: 8px;
}
.trust-stat .stat-label {
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--steel);
}

/* --- Step process --- */
.steps { display: flex; gap: 0; }
.step {
  flex: 1;
  padding: var(--card-pad);
  position: relative;
}
.step:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 28px;
  width: 1px;
  height: 48px;
  background: var(--border);
}
.step-number {
  font-size: 13px;
  font-weight: 700;
  color: var(--steel);
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}
.step h3 { font-size: 20px; margin-bottom: 8px; }
.step p { font-size: 15px; color: var(--steel); max-width: none; }
```

**Step 8: Commit**

```bash
git add css/style.css js/main.js pdfs/README.md images/.gitkeep
git commit -m "feat: add global stylesheet and JS stub"
```

---

## Task 3: Nav & Footer HTML Partials (Reference Snippets)

These are copy-pasted into every page. Keep them identical across all pages.

**Nav HTML (paste inside `<body>`, before `<main>`):**

```html
<nav class="site-nav">
  <div class="nav-inner">
    <a class="nav-logo" href="index.html">
      <!-- Replace img with actual logo file when available -->
      <span>Sarren Chemicals</span>
    </a>
    <button class="nav-toggle" aria-label="Toggle menu" onclick="document.querySelector('.nav-links').classList.toggle('open')">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="products.html">Products</a></li>
      <li><a href="sell-surplus.html">Sell Your Surplus</a></li>
      <li><a href="logistics.html">Logistics</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="contact.html">Contact</a></li>
      <li class="nav-cta"><a href="contact.html#rfq" class="btn btn-primary">Request a Quote</a></li>
    </ul>
  </div>
</nav>
```

**Footer HTML (paste before `</body>`):**

```html
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <span style="font-size:20px;font-weight:700;color:#fff;">Sarren Chemicals</span>
        <p>Buying and selling surplus, aged, and off-spec chemicals since 1997. Confidential. Reliable. Experienced.</p>
      </div>
      <div class="footer-col">
        <h4>Pages</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="products.html">Products</a></li>
          <li><a href="sell-surplus.html">Sell Your Surplus</a></li>
          <li><a href="logistics.html">Logistics</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Resources</h4>
        <ul>
          <li><a href="pdfs/sarren-line-card.pdf" target="_blank">Line Card (PDF)</a></li>
          <li><a href="pdfs/sarren-capability-statement.pdf" target="_blank">Capability Statement (PDF)</a></li>
          <li><a href="pdfs/sarren-sample-coa.pdf" target="_blank">Sample COA (PDF)</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:info@sarrenchemicals.com">info@sarrenchemicals.com</a></li>
          <li><a href="tel:+1-XXX-XXX-XXXX">(XXX) XXX-XXXX</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 Sarren Chemicals. All rights reserved.</span>
      <span>No supplier names are displayed on this site.</span>
    </div>
  </div>
</footer>
<script src="js/main.js"></script>
```

**No commit needed — these are reference snippets, not standalone files.**

---

## Task 4: Home Page (`index.html`)

**File:** Create `index.html`

**Sections:**
1. `<head>` with meta, title, stylesheet link
2. Nav (copy from Task 3)
3. Hero — headline, subhead, two CTAs
4. What We Supply — 4-category grid (Resins, Solvents, Pigments, Additives)
5. How It Works — 3 steps
6. Sell Your Surplus — CTA block
7. Trust Bar — 25+ years, X products, confidential
8. Footer (copy from Task 3)

**Step 1: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sarren Chemicals — Surplus chemical buying and selling since 1997. Submit an RFQ or sell us your surplus inventory.">
  <title>Sarren Chemicals — Industrial Chemical Distribution</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- NAV: paste from Task 3 -->

  <main>

    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg" style="background-image: url('images/hero-industrial.jpg');"></div>
      <div class="container">
        <div class="hero-content">
          <p class="label" style="color:rgba(255,255,255,0.6);margin-bottom:16px;">Chemical Distribution Since 1997</p>
          <h1>Reliable Supply.<br>Competitive Pricing.<br>Complete Confidentiality.</h1>
          <p>We buy and sell surplus, aged, and off-spec industrial chemicals. Inquiry-only pricing. No supplier names disclosed.</p>
          <div class="hero-actions">
            <a href="products.html" class="btn btn-white">Browse Products</a>
            <a href="contact.html#rfq" class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.5);">Request a Quote</a>
          </div>
        </div>
      </div>
    </section>

    <!-- WHAT WE SUPPLY -->
    <section>
      <div class="container">
        <div class="section-header">
          <p class="label">Product Categories</p>
          <h2>What We Supply</h2>
          <p>We carry a broad range of industrial chemicals across key categories. All pricing is inquiry-only.</p>
        </div>
        <div class="grid-4">
          <div class="card">
            <p class="label" style="margin-bottom:12px;">Category</p>
            <h3>Resins &amp; Polymers</h3>
            <p style="font-size:15px;color:var(--steel);margin-top:8px;">Alkyd, acrylic, epoxy, and polyurethane resins for coatings and adhesives.</p>
            <a href="products.html#resins" class="btn btn-outline" style="margin-top:24px;height:40px;font-size:14px;">View Products</a>
          </div>
          <div class="card">
            <p class="label" style="margin-bottom:12px;">Category</p>
            <h3>Solvents</h3>
            <p style="font-size:15px;color:var(--steel);margin-top:8px;">Ketones, esters, glycol ethers, and aromatic solvents in bulk and drum quantities.</p>
            <a href="products.html#solvents" class="btn btn-outline" style="margin-top:24px;height:40px;font-size:14px;">View Products</a>
          </div>
          <div class="card">
            <p class="label" style="margin-bottom:12px;">Category</p>
            <h3>Pigments &amp; Extenders</h3>
            <p style="font-size:15px;color:var(--steel);margin-top:8px;">TiO₂, calcium carbonate, talc, and specialty pigments for paint and coatings.</p>
            <a href="products.html#pigments" class="btn btn-outline" style="margin-top:24px;height:40px;font-size:14px;">View Products</a>
          </div>
          <div class="card">
            <p class="label" style="margin-bottom:12px;">Category</p>
            <h3>Additives</h3>
            <p style="font-size:15px;color:var(--steel);margin-top:8px;">Defoamers, rheology modifiers, dispersants, and coalescents for formulations.</p>
            <a href="products.html#additives" class="btn btn-outline" style="margin-top:24px;height:40px;font-size:14px;">View Products</a>
          </div>
        </div>
        <div style="text-align:center;margin-top:48px;">
          <a href="products.html" class="btn btn-primary">View Full Product List</a>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section-alt">
      <div class="container">
        <div class="section-header">
          <p class="label">Process</p>
          <h2>How It Works</h2>
        </div>
        <div class="steps" style="border:1px solid var(--border);border-radius:var(--radius);background:var(--white);">
          <div class="step">
            <p class="step-number">01</p>
            <h3>Browse &amp; Inquire</h3>
            <p>Find what you need in our product categories and submit a Request for Quote. No account required.</p>
          </div>
          <div class="step">
            <p class="step-number">02</p>
            <h3>We Respond Promptly</h3>
            <p>Our team reviews your inquiry and follows up with availability, pricing, and packaging options.</p>
          </div>
          <div class="step">
            <p class="step-number">03</p>
            <h3>Receive Your Order</h3>
            <p>We arrange freight and deliver to your facility. Packaging options include drums, totes, and bulk.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SELL YOUR SURPLUS -->
    <section style="background:var(--navy);color:var(--white);">
      <div class="container">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:48px;flex-wrap:wrap;">
          <div style="max-width:560px;">
            <p class="label" style="color:rgba(255,255,255,0.5);margin-bottom:12px;">For Sellers</p>
            <h2 style="color:var(--white);margin-bottom:16px;">Have Surplus Inventory?</h2>
            <p style="color:rgba(255,255,255,0.8);">We purchase surplus, aged, and off-spec chemicals confidentially. Quick turnaround, fair pricing, and complete discretion.</p>
          </div>
          <a href="sell-surplus.html" class="btn btn-white">Tell Us What You Have</a>
        </div>
      </div>
    </section>

    <!-- TRUST BAR -->
    <section class="trust-bar">
      <div class="container">
        <div class="trust-stats">
          <div class="trust-stat">
            <div class="stat-number">25+</div>
            <div class="stat-label">Years in Business</div>
          </div>
          <div class="trust-stat">
            <div class="stat-number">100%</div>
            <div class="stat-label">Supplier Confidentiality</div>
          </div>
          <div class="trust-stat">
            <div class="stat-number">Bulk</div>
            <div class="stat-label">Drums · Totes · Tankers</div>
          </div>
          <div class="trust-stat">
            <div class="stat-number">USA</div>
            <div class="stat-label">Nationwide Distribution</div>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- FOOTER: paste from Task 3 -->

</body>
</html>
```

**Step 2: Add active class to nav Home link**

In the nav `<ul>`, set: `<a href="index.html" class="active">Home</a>`

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add home page"
```

---

## Task 5: Products Page (`products.html`)

**File:** Create `products.html`

**Sections:**
1. Page hero
2. Category filter tabs (Resins, Solvents, Pigments, Additives — anchor links)
3. Product grid per category — each card has name, brief description, RFQ button
4. Inline RFQ form (full-width, below grid)

**Step 1: Write `products.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Browse Sarren Chemicals' industrial chemical inventory. Submit an RFQ for pricing.">
  <title>Products — Sarren Chemicals</title>
  <link rel="stylesheet" href="css/style.css">
  <style>
    .category-nav {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 56px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0;
    }
    .category-nav a {
      display: inline-block;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 500;
      color: var(--steel);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      text-decoration: none;
    }
    .category-nav a:hover,
    .category-nav a.active {
      color: var(--navy);
      border-bottom-color: var(--navy);
    }
    .category-section { margin-bottom: 72px; }
    .category-section h2 { margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    .product-card { display: flex; flex-direction: column; }
    .product-card h3 { font-size: 18px; margin-bottom: 8px; }
    .product-card p { font-size: 15px; color: var(--steel); flex: 1; }
    .product-card .btn { margin-top: 20px; align-self: flex-start; height: 40px; font-size: 14px; }
  </style>
</head>
<body>

  <!-- NAV (active: Products) -->

  <main>

    <div class="page-hero">
      <div class="container">
        <p class="label">Inventory</p>
        <h1>Products</h1>
        <p>Browse available inventory by category. All pricing is inquiry-only — submit an RFQ for quotes.</p>
      </div>
    </div>

    <section>
      <div class="container">

        <nav class="category-nav">
          <a href="#resins" class="active">Resins &amp; Polymers</a>
          <a href="#solvents">Solvents</a>
          <a href="#pigments">Pigments &amp; Extenders</a>
          <a href="#additives">Additives</a>
        </nav>

        <!-- RESINS -->
        <div class="category-section" id="resins">
          <h2>Resins &amp; Polymers</h2>
          <div class="grid-3">
            <div class="card product-card">
              <p class="label">Resin</p>
              <h3>Alkyd Resin</h3>
              <p>Short, medium, and long oil alkyds for architectural and industrial coatings. Available in drums and totes.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Resin</p>
              <h3>Acrylic Emulsion</h3>
              <p>Waterborne acrylic dispersions for interior and exterior paint formulations.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Resin</p>
              <h3>Epoxy Resin</h3>
              <p>Liquid epoxy resins for flooring, industrial coatings, and adhesive applications.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Resin</p>
              <h3>Polyurethane Resin</h3>
              <p>Moisture-cure and two-component polyurethane resins for protective coatings.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Resin</p>
              <h3>Vinyl Acetate Polymer</h3>
              <p>PVA dispersions and copolymers for adhesives, construction, and drymix applications.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
          </div>
        </div>

        <!-- SOLVENTS -->
        <div class="category-section" id="solvents">
          <h2>Solvents</h2>
          <div class="grid-3">
            <div class="card product-card">
              <p class="label">Solvent</p>
              <h3>Methyl Ethyl Ketone (MEK)</h3>
              <p>High-purity MEK for coatings, adhesives, and cleaning applications. Drum and bulk available.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Solvent</p>
              <h3>Butyl Acetate</h3>
              <p>Industrial grade n-butyl acetate for lacquers, varnishes, and coatings formulations.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Solvent</p>
              <h3>Propylene Glycol Methyl Ether (PM)</h3>
              <p>Glycol ether solvent for waterborne and solventborne coating systems.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Solvent</p>
              <h3>Mineral Spirits</h3>
              <p>Aliphatic hydrocarbon solvent for alkyd-based paints and industrial cleaning.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
          </div>
        </div>

        <!-- PIGMENTS -->
        <div class="category-section" id="pigments">
          <h2>Pigments &amp; Extenders</h2>
          <div class="grid-3">
            <div class="card product-card">
              <p class="label">Pigment</p>
              <h3>Titanium Dioxide (TiO₂)</h3>
              <p>Rutile and anatase grades for architectural paint, industrial coatings, and plastics.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Extender</p>
              <h3>Calcium Carbonate</h3>
              <p>Coated and uncoated calcium carbonate for drymix, paint, and sealant applications.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Extender</p>
              <h3>Talc</h3>
              <p>Platy talc grades for barrier properties and sag resistance in coatings and sealants.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Pigment</p>
              <h3>Iron Oxide Pigments</h3>
              <p>Red, yellow, and black synthetic iron oxides for concrete, coatings, and construction.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
          </div>
        </div>

        <!-- ADDITIVES -->
        <div class="category-section" id="additives">
          <h2>Additives</h2>
          <div class="grid-3">
            <div class="card product-card">
              <p class="label">Additive</p>
              <h3>Defoamers</h3>
              <p>Mineral oil and silicone-based defoamers for waterborne and solventborne systems.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Additive</p>
              <h3>Rheology Modifiers</h3>
              <p>HEUR, HMHEC, and clay-based thickeners for paints, adhesives, and sealants.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Additive</p>
              <h3>Dispersants &amp; Wetting Agents</h3>
              <p>Polymeric dispersants for pigment grinding and stabilization in waterborne systems.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
            <div class="card product-card">
              <p class="label">Additive</p>
              <h3>Coalescents</h3>
              <p>Texanol and alternative coalescents to aid film formation in latex paints.</p>
              <a href="#rfq" class="btn btn-outline">Request a Quote</a>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- RFQ FORM -->
    <section class="section-alt" id="rfq">
      <div class="container" style="max-width:720px;">
        <div class="section-header">
          <p class="label">Pricing Inquiry</p>
          <h2>Request a Quote</h2>
          <p>All pricing is by inquiry only. Fill out the form below and we'll respond within one business day.</p>
        </div>
        <form data-form="rfq" action="mailto:info@sarrenchemicals.com" method="POST" enctype="text/plain">
          <div class="grid-2">
            <div class="form-group">
              <label for="rfq-name">Full Name</label>
              <input type="text" id="rfq-name" name="name" required placeholder="Jane Smith">
            </div>
            <div class="form-group">
              <label for="rfq-company">Company</label>
              <input type="text" id="rfq-company" name="company" required placeholder="Acme Coatings Co.">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label for="rfq-email">Email</label>
              <input type="email" id="rfq-email" name="email" required placeholder="jane@company.com">
            </div>
            <div class="form-group">
              <label for="rfq-phone">Phone</label>
              <input type="tel" id="rfq-phone" name="phone" placeholder="(555) 000-0000">
            </div>
          </div>
          <div class="form-group">
            <label for="rfq-product">Product(s) of Interest</label>
            <input type="text" id="rfq-product" name="product" required placeholder="e.g. Alkyd Resin, TiO₂">
          </div>
          <div class="form-group">
            <label for="rfq-qty">Estimated Quantity &amp; Packaging</label>
            <input type="text" id="rfq-qty" name="quantity" placeholder="e.g. 5 drums, 1 tote, bulk">
          </div>
          <div class="form-group">
            <label for="rfq-notes">Additional Notes</label>
            <textarea id="rfq-notes" name="notes" placeholder="Spec requirements, timeline, application details..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">Submit Request for Quote</button>
          <p class="form-note">No supplier names are shared. All inquiries are handled confidentially.</p>
        </form>
      </div>
    </section>

  </main>

  <!-- FOOTER -->

</body>
</html>
```

**Step 2: Commit**

```bash
git add products.html
git commit -m "feat: add products page with RFQ form"
```

---

## Task 6: Sell Your Surplus Page (`sell-surplus.html`)

**File:** Create `sell-surplus.html`

**Sections:**
1. Page hero
2. Why sell to us — 3 key points
3. Surplus intake form

**Step 1: Write `sell-surplus.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sell your surplus chemicals to Sarren Chemicals. Fast, confidential, fair pricing.">
  <title>Sell Your Surplus — Sarren Chemicals</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- NAV (active: Sell Your Surplus) -->

  <main>

    <div class="page-hero">
      <div class="container">
        <p class="label">For Sellers</p>
        <h1>Sell Us Your Surplus</h1>
        <p>We purchase surplus, aged, and off-spec chemicals quickly and confidentially. Tell us what you have.</p>
      </div>
    </div>

    <!-- WHY SELL TO US -->
    <section class="section-alt">
      <div class="container">
        <div class="section-header" style="text-align:center;max-width:600px;margin:0 auto 56px;">
          <p class="label">Why Sarren</p>
          <h2>Quick. Confidential. Fair.</h2>
        </div>
        <div class="grid-3">
          <div class="card" style="text-align:center;">
            <div style="font-size:32px;margin-bottom:16px;">🔒</div>
            <h3>Complete Confidentiality</h3>
            <p style="font-size:15px;margin-top:8px;">Your company name and supplier information are never disclosed. We operate with full discretion.</p>
          </div>
          <div class="card" style="text-align:center;">
            <div style="font-size:32px;margin-bottom:16px;">⚡</div>
            <h3>Fast Turnaround</h3>
            <p style="font-size:15px;margin-top:8px;">We respond to surplus inquiries promptly. Most transactions are completed within days, not weeks.</p>
          </div>
          <div class="card" style="text-align:center;">
            <div style="font-size:32px;margin-bottom:16px;">💰</div>
            <h3>Fair Market Pricing</h3>
            <p style="font-size:15px;margin-top:8px;">We offer competitive pricing for aged, off-spec, and surplus inventory. No lowball offers.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SURPLUS FORM -->
    <section>
      <div class="container" style="max-width:720px;">
        <div class="section-header">
          <p class="label">Surplus Intake</p>
          <h2>Tell Us What You Have</h2>
          <p>Fill out the form below. We'll review and follow up within one business day.</p>
        </div>
        <form data-form="surplus" action="mailto:surplus@sarrenchemicals.com" method="POST" enctype="text/plain">
          <div class="grid-2">
            <div class="form-group">
              <label for="s-name">Full Name</label>
              <input type="text" id="s-name" name="name" required placeholder="John Smith">
            </div>
            <div class="form-group">
              <label for="s-company">Company</label>
              <input type="text" id="s-company" name="company" required placeholder="Your Company">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label for="s-email">Email</label>
              <input type="email" id="s-email" name="email" required placeholder="john@company.com">
            </div>
            <div class="form-group">
              <label for="s-phone">Phone</label>
              <input type="tel" id="s-phone" name="phone" placeholder="(555) 000-0000">
            </div>
          </div>
          <div class="form-group">
            <label for="s-material">Material Description</label>
            <input type="text" id="s-material" name="material" required placeholder="e.g. Alkyd Resin, Off-spec TiO₂">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label for="s-qty">Quantity &amp; Packaging</label>
              <input type="text" id="s-qty" name="quantity" placeholder="e.g. 20 drums, 2 totes">
            </div>
            <div class="form-group">
              <label for="s-location">Material Location</label>
              <input type="text" id="s-location" name="location" placeholder="City, State">
            </div>
          </div>
          <div class="form-group">
            <label for="s-condition">Material Condition</label>
            <select id="s-condition" name="condition">
              <option value="">Select condition...</option>
              <option>Surplus / Excess Stock</option>
              <option>Aged / Near Expiry</option>
              <option>Off-Spec</option>
              <option>Unknown / Mixed</option>
            </select>
          </div>
          <div class="form-group">
            <label for="s-notes">Additional Details</label>
            <textarea id="s-notes" name="notes" placeholder="Lot numbers, test data, reason for sale, urgency..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">Submit Surplus Inquiry</button>
          <p class="form-note">All submissions are handled in strict confidence. No information is shared without your consent.</p>
        </form>
      </div>
    </section>

  </main>

  <!-- FOOTER -->

</body>
</html>
```

**Step 2: Commit**

```bash
git add sell-surplus.html
git commit -m "feat: add sell your surplus page with intake form"
```

---

## Task 7: Logistics & Packaging Page (`logistics.html`)

**File:** Create `logistics.html`

**Sections:** Page hero, packaging options grid, freight info, safety/compliance note

**Step 1: Write `logistics.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sarren Chemicals logistics and packaging — drums, totes, bulk, and freight options.">
  <title>Logistics &amp; Packaging — Sarren Chemicals</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- NAV (active: Logistics) -->

  <main>

    <div class="page-hero">
      <div class="container">
        <p class="label">Shipping &amp; Packaging</p>
        <h1>Logistics &amp; Packaging</h1>
        <p>We ship nationwide in a variety of packaging configurations to meet your volume and handling requirements.</p>
      </div>
    </div>

    <!-- PACKAGING OPTIONS -->
    <section>
      <div class="container">
        <div class="section-header">
          <p class="label">Packaging</p>
          <h2>Available Packaging Formats</h2>
        </div>
        <div class="grid-4">
          <div class="card" style="text-align:center;">
            <div style="font-size:40px;margin-bottom:16px;">🛢</div>
            <h3>Drums</h3>
            <p style="font-size:15px;margin-top:8px;">55-gallon steel and poly drums. Closed-head and open-head available. UN-rated where required.</p>
          </div>
          <div class="card" style="text-align:center;">
            <div style="font-size:40px;margin-bottom:16px;">📦</div>
            <h3>Totes (IBCs)</h3>
            <p style="font-size:15px;margin-top:8px;">275 and 330-gallon intermediate bulk containers. Ideal for larger volumes without bulk tanker logistics.</p>
          </div>
          <div class="card" style="text-align:center;">
            <div style="font-size:40px;margin-bottom:16px;">🚛</div>
            <h3>Bulk Tanker</h3>
            <p style="font-size:15px;margin-top:8px;">Full and partial tanker loads for high-volume liquid materials. Inquire for scheduling and minimums.</p>
          </div>
          <div class="card" style="text-align:center;">
            <div style="font-size:40px;margin-bottom:16px;">🎒</div>
            <h3>Bags &amp; Super Sacks</h3>
            <p style="font-size:15px;margin-top:8px;">50 lb bags and 1-ton supersacks for dry materials including pigments, fillers, and drymix components.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FREIGHT -->
    <section class="section-alt">
      <div class="container">
        <div class="grid-2" style="align-items:center;gap:64px;">
          <div>
            <p class="label">Shipping</p>
            <h2>Nationwide Freight</h2>
            <p style="margin-top:16px;">We arrange freight to your facility across the contiguous United States. LTL, FTL, and tanker shipments coordinated through our carrier network.</p>
            <ul style="margin-top:24px;list-style:none;display:flex;flex-direction:column;gap:12px;">
              <li style="display:flex;gap:12px;align-items:flex-start;">
                <span style="color:var(--navy);font-weight:700;margin-top:2px;">✓</span>
                <span>LTL and full truckload arrangements</span>
              </li>
              <li style="display:flex;gap:12px;align-items:flex-start;">
                <span style="color:var(--navy);font-weight:700;margin-top:2px;">✓</span>
                <span>Hazmat-compliant shipping documentation</span>
              </li>
              <li style="display:flex;gap:12px;align-items:flex-start;">
                <span style="color:var(--navy);font-weight:700;margin-top:2px;">✓</span>
                <span>SDS provided with every shipment</span>
              </li>
              <li style="display:flex;gap:12px;align-items:flex-start;">
                <span style="color:var(--navy);font-weight:700;margin-top:2px;">✓</span>
                <span>COA available on request</span>
              </li>
            </ul>
          </div>
          <div class="card" style="background:var(--white);">
            <p class="label" style="margin-bottom:16px;">Documentation</p>
            <h3 style="margin-bottom:16px;">What We Provide</h3>
            <p style="font-size:15px;">Every shipment comes with complete documentation including Safety Data Sheet (SDS), bill of lading, and Certificate of Analysis upon request. Hazmat manifests provided where applicable.</p>
            <a href="contact.html" class="btn btn-outline" style="margin-top:24px;height:40px;font-size:14px;">Contact for Logistics Questions</a>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- FOOTER -->

</body>
</html>
```

**Step 2: Commit**

```bash
git add logistics.html
git commit -m "feat: add logistics and packaging page"
```

---

## Task 8: About Page (`about.html`)

**File:** Create `about.html`

**Sections:** Page hero, company story, values/differentiators, secondary CTA

**Step 1: Write `about.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="About Sarren Chemicals — surplus chemical trading since 1997.">
  <title>About — Sarren Chemicals</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- NAV (active: About) -->

  <main>

    <div class="page-hero">
      <div class="container">
        <p class="label">Our Story</p>
        <h1>About Sarren Chemicals</h1>
        <p>Buying and selling surplus, aged, and off-spec chemicals since 1997.</p>
      </div>
    </div>

    <!-- STORY -->
    <section>
      <div class="container">
        <div class="grid-2" style="align-items:start;gap:80px;">
          <div>
            <p class="label" style="margin-bottom:16px;">Who We Are</p>
            <h2>A Trusted Partner in the Chemical Supply Chain</h2>
            <p style="margin-top:24px;">Sarren Chemicals has operated as a specialized chemical trading company for over 25 years. We connect buyers who need quality surplus material with sellers looking to recover value from off-spec or excess inventory.</p>
            <p style="margin-top:16px;">Our expertise spans resins, solvents, pigments, and additives — the building blocks used by paint manufacturers, adhesive blenders, drymix producers, and resin formulators across the United States.</p>
            <p style="margin-top:16px;">We operate with complete supplier confidentiality. The names of our sources are never disclosed — to anyone.</p>
          </div>
          <div>
            <div class="card" style="margin-bottom:24px;">
              <h3 style="margin-bottom:8px;">Established 1997</h3>
              <p style="font-size:15px;">Over two decades of experience navigating the surplus chemical market, building relationships, and delivering value on both sides of every transaction.</p>
            </div>
            <div class="card" style="margin-bottom:24px;">
              <h3 style="margin-bottom:8px;">Confidentiality First</h3>
              <p style="font-size:15px;">No supplier names. No disclosed sources. We handle every transaction with discretion — it's not a policy, it's the foundation of how we operate.</p>
            </div>
            <div class="card">
              <h3 style="margin-bottom:8px;">Nationwide Reach</h3>
              <p style="font-size:15px;">We source and deliver across the contiguous United States, coordinating freight for drums, totes, and bulk tanker shipments.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHO WE SERVE -->
    <section class="section-alt">
      <div class="container">
        <div class="section-header" style="text-align:center;max-width:560px;margin:0 auto 56px;">
          <p class="label">Industries Served</p>
          <h2>Who We Work With</h2>
        </div>
        <div class="grid-3">
          <div class="card">
            <h3>Paint Manufacturers</h3>
            <p style="font-size:15px;margin-top:8px;">Architectural and industrial paint producers sourcing resins, solvents, pigments, and additives.</p>
          </div>
          <div class="card">
            <h3>Adhesive Blenders</h3>
            <p style="font-size:15px;margin-top:8px;">Formulators of pressure-sensitive, structural, and reactive adhesive systems.</p>
          </div>
          <div class="card">
            <h3>Drymix Producers</h3>
            <p style="font-size:15px;margin-top:8px;">Construction product manufacturers using fillers, polymers, and additives in drymix formulations.</p>
          </div>
          <div class="card">
            <h3>Resin Users</h3>
            <p style="font-size:15px;margin-top:8px;">Industrial formulators requiring alkyd, acrylic, epoxy, or polyurethane resins in bulk.</p>
          </div>
          <div class="card">
            <h3>Surplus Holders</h3>
            <p style="font-size:15px;margin-top:8px;">Manufacturers and distributors with excess, aged, or off-spec inventory looking to recover value.</p>
          </div>
          <div class="card">
            <a href="contact.html" style="text-decoration:none;">
              <h3>Not Sure?</h3>
              <p style="font-size:15px;margin-top:8px;">Get in touch. If we can help, we will. If we can't, we'll say so.</p>
              <p style="margin-top:16px;font-weight:600;color:var(--navy);font-size:15px;">Contact us →</p>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section style="background:var(--navy);color:var(--white);">
      <div class="container" style="text-align:center;max-width:560px;">
        <p class="label" style="color:rgba(255,255,255,0.5);margin-bottom:16px;">Ready to Work Together?</p>
        <h2 style="color:var(--white);margin-bottom:16px;">Let's Talk</h2>
        <p style="color:rgba(255,255,255,0.8);margin:0 auto 40px;">Whether you're buying or selling, we're straightforward to work with. Reach out and we'll respond promptly.</p>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
          <a href="products.html#rfq" class="btn btn-white">Request a Quote</a>
          <a href="sell-surplus.html" class="btn btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.4);">Sell Your Surplus</a>
        </div>
      </div>
    </section>

  </main>

  <!-- FOOTER -->

</body>
</html>
```

**Step 2: Commit**

```bash
git add about.html
git commit -m "feat: add about page"
```

---

## Task 9: Contact Page (`contact.html`)

**File:** Create `contact.html`

**Sections:** Page hero, simple contact form, contact info sidebar

**Step 1: Write `contact.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Contact Sarren Chemicals — get in touch for inquiries, quotes, and surplus.">
  <title>Contact — Sarren Chemicals</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- NAV (active: Contact) -->

  <main>

    <div class="page-hero">
      <div class="container">
        <p class="label">Get In Touch</p>
        <h1>Contact Us</h1>
        <p>Reach out for product inquiries, surplus purchases, logistics questions, or anything else.</p>
      </div>
    </div>

    <section>
      <div class="container">
        <div class="grid-2" style="gap:80px;align-items:start;">

          <!-- FORM -->
          <div>
            <h2 style="margin-bottom:32px;" id="rfq">Send a Message</h2>
            <form data-form="contact" action="mailto:info@sarrenchemicals.com" method="POST" enctype="text/plain">
              <div class="grid-2">
                <div class="form-group">
                  <label for="c-name">Full Name</label>
                  <input type="text" id="c-name" name="name" required placeholder="Jane Smith">
                </div>
                <div class="form-group">
                  <label for="c-company">Company</label>
                  <input type="text" id="c-company" name="company" placeholder="Acme Co.">
                </div>
              </div>
              <div class="form-group">
                <label for="c-email">Email</label>
                <input type="email" id="c-email" name="email" required placeholder="jane@company.com">
              </div>
              <div class="form-group">
                <label for="c-subject">Subject</label>
                <select id="c-subject" name="subject">
                  <option value="">Select a topic...</option>
                  <option>Product Inquiry / RFQ</option>
                  <option>Sell My Surplus</option>
                  <option>Logistics Question</option>
                  <option>General Inquiry</option>
                </select>
              </div>
              <div class="form-group">
                <label for="c-message">Message</label>
                <textarea id="c-message" name="message" required placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">Send Message</button>
            </form>
          </div>

          <!-- CONTACT INFO -->
          <div>
            <h2 style="margin-bottom:32px;">Contact Information</h2>
            <div style="display:flex;flex-direction:column;gap:24px;">
              <div class="card">
                <p class="label" style="margin-bottom:8px;">Email</p>
                <a href="mailto:info@sarrenchemicals.com" style="font-size:17px;font-weight:500;">info@sarrenchemicals.com</a>
              </div>
              <div class="card">
                <p class="label" style="margin-bottom:8px;">Phone</p>
                <a href="tel:+1-XXX-XXX-XXXX" style="font-size:17px;font-weight:500;">(XXX) XXX-XXXX</a>
              </div>
              <div class="card">
                <p class="label" style="margin-bottom:8px;">Resources</p>
                <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">
                  <li><a href="pdfs/sarren-line-card.pdf" target="_blank" style="font-size:15px;">↓ Download Line Card (PDF)</a></li>
                  <li><a href="pdfs/sarren-capability-statement.pdf" target="_blank" style="font-size:15px;">↓ Capability Statement (PDF)</a></li>
                  <li><a href="pdfs/sarren-sample-coa.pdf" target="_blank" style="font-size:15px;">↓ Sample COA (PDF)</a></li>
                </ul>
              </div>
              <div class="card">
                <p class="label" style="margin-bottom:8px;">Looking to Sell?</p>
                <p style="font-size:15px;margin-bottom:16px;">Have surplus or off-spec inventory? Use our dedicated form for faster processing.</p>
                <a href="sell-surplus.html" class="btn btn-outline" style="height:40px;font-size:14px;">Sell Your Surplus →</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

  </main>

  <!-- FOOTER -->

</body>
</html>
```

**Step 2: Commit**

```bash
git add contact.html
git commit -m "feat: add contact page with form and info"
```

---

## Task 10: Final Polish & Cross-Page Review

**Step 1: Verify all nav links have correct `active` class per page**

Each page's nav should have the correct link marked `class="active"`:
- `index.html` → Home
- `products.html` → Products
- `sell-surplus.html` → Sell Your Surplus
- `logistics.html` → Logistics
- `about.html` → About
- `contact.html` → Contact

**Step 2: Add mobile nav JS to `js/main.js`**

```js
document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Form submission UX
  const forms = document.querySelectorAll('form[data-form]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = 'Sending...';
        btn.disabled = true;
      }
    });
  });
});
```

**Step 3: Add `<img>` placeholder comments in `images/` directory**

Create `images/README.md`:

```markdown
# Required Images

Place the following images in this directory:

- `hero-industrial.jpg` — Homepage hero background (industrial facility/equipment, landscape, min 1600×900)
- `about-facility.jpg` — About page interior image (optional, for future use)

Guidelines:
- Real industrial photography only (no lab/stock imagery)
- Neutral tones preferred (grays, whites, metallics)
- Avoid people-focused shots — equipment and facility preferred
- Min resolution: 1600px wide for hero images
```

**Step 4: Final commit**

```bash
git add js/main.js images/README.md
git commit -m "feat: add mobile nav JS and image asset guide"
```

---

## Task 11: Memory Update

Save key project facts to memory:

```bash
mkdir -p /Users/jonlarkin/.claude/projects/-Users-jonlarkin-SarrenChemicals/memory/
```

Create `MEMORY.md` with:
- Project type, tech stack, design tokens
- File list and page roles
- Client constraints (no eCommerce, no supplier names, inquiry-only)

---

## Completion

When all tasks are done, open `index.html` in a browser and verify:
- [ ] Nav is sticky and mobile hamburger works
- [ ] All 6 pages link to each other correctly
- [ ] Active nav state is set per page
- [ ] All 3 forms render correctly and have correct mailto actions
- [ ] PDF download links exist in footer
- [ ] No external dependencies loaded (no Google Fonts, no CDN)
- [ ] Page looks correct on mobile (< 600px)
