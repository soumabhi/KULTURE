# Kultur (Kulture) — Project Status & Technical Architecture Overview

> **Last Updated:** September 2026  
> **Repository:** `d:\KULTUR`  
> **Current Status:** Phase 1 (Hero Stage Prototype & Cinematic Experience) ~25% Complete  
> **Live Dev URL:** `http://localhost:3000`

---

## 1. Executive Summary & Brand Concept

**Kultur** (*"PURE. SAFE. ESSENTIAL. Purity in every drop, balance in every sip."*) is an innovative digital-first consumer packaged goods (CPG) startup combining **premium packaged drinking water** with an **interactive offline-to-online (O2O) advertising medium ("Media on Bottles")**, deeply rooted in **Odisha's rich cultural heritage**.

### Dual Value Proposition

```
                             ┌────────────────────────────────────────┐
                             │             KULTUR PLATFORM            │
                             └──────────────────┬─────────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
  ┌───────────────────────────────┐                             ┌───────────────────────────────┐
  │   CULTURAL HERITAGE BEVERAGE  │                             │   SMART MEDIA / AD NETWORK    │
  ├───────────────────────────────┤                             ├───────────────────────────────┤
  │ • Konark Sun Temple & Chakra  │                             │ • High-retention ad surface   │
  │ • Odissi Dance & Music        │                             │ • Scannable dynamic QR codes  │
  │ • Sambalpuri Ikat Textiles    │                             │ • Exclusive partner discounts │
  │ • Purity: RO + UV + Minerals  │                             │ • Targeted distribution      │
  │ • Certified: FSSAI, ISO 22000 │                             │   (Hotels, Flights, Events)   │
  └───────────────────────────────┘                             └───────────────────────────────┘
```

1. **Cultural Heritage Bottled Water**:
   - Commemorates Odisha's historic architectural and artistic masterworks: the **Konark Sun Temple**, the sacred chariot wheel (**Konark Chakra**), classical **Odissi dance**, **Sambalpuri Ikat weaves**, traditional terracotta pottery, and ancient maritime trade heritage (*Boita Bandana* / *Bali Jatra*).
   - Bottled and manufactured by **Subham Beverages**, Siliguri, West Bengal (FSSAI Lic. No. `112233440001234`, ISO 22000:2018 Certified).

2. **Smart Bottle Media & Partner Ad Platform**:
   - The label acts as an interactive billboard for partner brands across real estate, healthcare, hospitality, and tech.
   - Every bottle features branded partner creative, promotional offers (e.g., *15% OFF*, *20% OFF*), and direct scannable QR codes driving digital conversions.

---

## 2. Tech Stack & Dependencies

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Turbopack) | `16.3.3` | React server/client architecture, image optimization |
| **UI Library** | React | `19.2.8` | Component rendering, hooks, performance hooks |
| **Language** | TypeScript | `^5.0` | Strict type safety |
| **Styling** | Tailwind CSS (v4) & CSS Modules | `^4.0.0` | Utility layout + modular isolated 3D component styling |
| **PostCSS** | `@tailwindcss/postcss` | `^4.0.0` | Next-gen Tailwind processing pipeline |
| **Typography** | `Geist`, `Geist_Mono` (Google Fonts) | Next Font | Modern, readable, variable sans and mono fonts |

---

## 3. Directory & Asset Structure

```
d:\KULTUR/
├── public/                     # Static media and brand assets
│   ├── kbottle.png             # Kultur Heritage Art Edition bottle (1L)
│   ├── kdance.png              # Odissi dancer, peacock, drums, lotus, temple
│   ├── kestate.png             # Partner edition: Vistara Infra & Realty
│   ├── khosp.png               # Partner edition: Aarogya Superspeciality Hospital
│   ├── konarkc.png             # Konark Chakra (wheel) high-res cutout
│   ├── konarkt.png             # Konark Sun Temple chariot structure
│   ├── ksaree.png              # Sambalpuri handloom Ikat border & jasmine flowers
│   ├── kultur.png              # Script typography logo ("Kulture")
│   └── kwat.png                # Waterfront with traditional sailing boat & sunset
├── src/
│   ├── app/
│   │   ├── globals.css         # Keyframe choreographies, theme variables, reset
│   │   ├── layout.tsx          # Root layout, Geist font declarations, HTML shell
│   │   └── page.tsx            # Main stage assembling hero scenery and components
│   ├── components/
│   │   ├── cover-flow.tsx      # Math-driven 3D cylindrical bottle carousel
│   │   ├── cover-flow.module.css # 3D perspective stage styling
│   │   ├── keycap-button.tsx   # Tactile mechanical keyboard button
│   │   ├── keycap-button.module.css # Skeuomorphic inset shadow & gradient styles
│   │   └── logo-lockup.tsx     # Animated entrance lockup & interactive spin physics
│   └── lib/                    # Utilities folder (currently empty)
├── .tmp-header.png             # Visual target reference / design mockup
├── package.json
└── tsconfig.json
```

---

## 4. Completed Modules & Implementation Deep-Dive

### A. The Hero Stage & Orchestrated Opening Sequence
The landing page loads into a choreographed, zero-dependency CSS keyframe sequence:

```
Timeline:
0.0s ────────────────────────────── Chakra burst spin in screen center (chakra-burst)
0.4s ──────────── Water layer rises from bottom (rise-in)
0.45s ─────────── "Kulture" calligraphy pops & scales up into wheel center (kultur-pop)
1.2s ──────────── Konark Temple (left) & Odissi Dancer (right) rise up into view
5.4s ──────────── Temple & Dancer exit downwards (rise-out) [CURRENT BEHAVIOR]
6.5s ──────────── Water exits downwards (rise-out) [CURRENT BEHAVIOR]
6.5s ──────────── Center logo lockup travels diagonally to top-left (lockup-to-logo)
7.55s ─────────── Header actions & 3D Cover Flow Carousel fade into view
```

### B. Interactive Physics-Based Chakra Spinner (`logo-lockup.tsx`)
- Once the logo completes its transition to the top-left header position, it flags itself as active (`hot = true`).
- **User Interaction**: Clicking or pressing `Enter`/`Space` on the logo triggers an acceleration impulse (`BOOST = 16`, capping at `MAX_RATE = 180`).
- **Physics Engine**: Operates a `requestAnimationFrame` loop with exponential decay (`DECAY_TAU = 2.2s`) back to `BASE_RATE = 1`, adjusting the CSS animation's `playbackRate` directly on the GPU.

### C. Mathematical 3D Cover Flow Carousel (`cover-flow.tsx`)
- Renders **13 card slots** cycling continuously between the 3 bottle editions:
  1. `kbottle.png` (Kultur Heritage Art)
  2. `kestate.png` (Vistara Infra & Realty)
  3. `khosp.png` (Aarogya Superspeciality Hospital)
- **Trigonometric 3D Projection**:
  - Calculates angle: $\theta = \text{clamp}(-50^\circ, 50^\circ, \text{slot} \times 15.5^\circ)$
  - Horizontal offset: $X = \sin(\theta) \times 220\%$
  - Vertical parabolic sag: $Y = (1 - \cos(\theta)) \times 220\% \times \text{aspectRatio}$
  - Scale compression: $\text{scale} = 1 - |\text{slot}| \times 0.08$
  - Edge fade: Cubic Hermite smoother-step interpolation for soft opacity falloff.
- Runs on an infinite, frame-rate independent `requestAnimationFrame` ticker with `prefers-reduced-motion` compliance.

### D. Tactile Skeuomorphic 3D Keycap Button (`keycap-button.tsx`)
- High-fidelity mechanical keyboard keycap button component for the "Partner With Us" CTA.
- Styled with dual-layer inset shadows, linear rim lighting, bevel borders, and micro-elevation click response.

---

## 5. Current Discrepancies vs Reference Mockup (`.tmp-header.png`)

Inspection of the mockup image (`.tmp-header.png`) reveals crucial differences from the current code:

| Element | Reference Mockup (`.tmp-header.png`) | Current Code Implementation | Action Required |
| :--- | :--- | :--- | :--- |
| **Temple & Scenery** | **Permanently visible** as the majestic backdrop behind the bottle carousel | Animate out (`rise-out`) at 5.4s, leaving plain empty beige background | Keep temple, dancer, and water anchored on screen |
| **Top-Right Drape** | Sambalpuri handloom drape with jasmine blooms framing the top right corner | `public/ksaree.png` exists but is completely unreferenced | Mount `ksaree.png` in top-right corner of `page.tsx` |
| **Sailing Boat** | Traditional *Boita* boat with rowers rests prominently on the water waves | Included inside `kwat.png`, but vanishes when water exits | Persist with water layer |
| **Navigation CTAs** | "Fuel our expansion" & "Partner With Us" button present | Visual only — no click handlers, modal triggers, or routing | Connect to lead capture modal or contact drawer |
| **Page Length** | Clean framed hero viewport | `min-h-dvh overflow-hidden` — no scrollable body or further sections | Convert to full multi-section scrollable experience |

---

## 6. Comprehensive Project Roadmap & Pending Modules

To elevate Kultur into a full, production-ready brand and partnership web application:

### Phase 1: Hero Fidelity Polish (Immediate)
- [ ] Fix scenery exit: Keep temple (`konarkt.png`), dancer (`kdance.png`), and water (`kwat.png`) anchored as the permanent stage background.
- [ ] Integrate Sambalpuri drape (`ksaree.png`) at top-right corner.
- [ ] Add touch swipe gesture support for mobile browsing on the bottle carousel.

### Phase 2: Partner Lead Generation Flow
- [ ] Implement interactive **"Partner With Us"** modal / slide-over drawer:
  - Select campaign goal (Brand Awareness, App Installs, Event Promotion).
  - Target geographic distribution (Hotels, Flights, Universities, Cafes).
  - Estimated bottle volume calculator & pricing tier estimator.
  - Contact & business inquiry form.
- [ ] Add **"Fuel our expansion"** investor / franchise overview drawer or page.

### Phase 3: Content Sections (Below the Fold)
- [ ] **About Kultur & Cultural Heritage**:
  - Narrative on celebrating Odia artistry and Konark architectural heritage.
  - Social impact: Empowering traditional rural artisans through bottle art commissions.
- [ ] **Water Purity & Science**:
  - 8-stage purification journey (Active Carbon, Multi-barrier Reverse Osmosis, Micron Filtration, UV Treatment, Ozonation, Essential Mineral Remineralization).
  - Mineral composition breakdown (TDS, pH balance, Calcium, Magnesium).
  - Quality certifications (FSSAI, ISO 22000:2018).
- [ ] **The "Media on Bottles" Value Deck**:
  - Interactive ROI calculator for advertising brands.
  - Comparison vs traditional static hoardings and digital banners (100% focused attention, 45+ minute average retention time per bottle).
  - QR scan case studies (e.g. Vistara Realty 15% promo, Aarogya Hospital checkup package).
- [ ] **Interactive 3D / 360° Bottle Inspector**:
  - Click any bottle from the carousel to inspect its high-res artwork, label typography, nutritional data, and partner offer.
- [ ] **Eco-Commitment & Sustainability**:
  - 100% recyclable food-grade rPET plastic.
  - Closed-loop bottle collection and recycling initiatives.

### Phase 4: Production Readiness & Compliance
- [ ] Build global responsive **Footer**:
  - Legal disclaimer, FSSAI registration details, Subham Beverages factory location.
  - Privacy Policy, Terms of Service, Contact Support.
- [ ] SEO metadata, OpenGraph cards, Twitter preview cards, and favicon suite.
- [ ] Initialize Git version control (`git init`) and CI/CD deployment configuration for Vercel/Cloudflare.
