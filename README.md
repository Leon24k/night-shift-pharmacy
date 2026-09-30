<p align="center">
  <img src="docs/logo.svg" alt="Apotek Jaga: Shift Malam" width="560" />
</p>

<h1 align="center">Apotek Jaga: Shift Malam</h1>

<p align="center">
  <b>A first-person, tactile pharmacy prescription verification &amp; dispensing simulator.</b><br/>
  Educational · Indonesian community-pharmacy setting · 100% client-side · works offline.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## Overview

**Apotek Jaga: Shift Malam** ("Pharmacy Night Watch") is a document-verification game in the spirit of *Papers, Please*, set in the quiet, neon-lit night shift of an Indonesian community pharmacy (*apotek*).

You play a pharmacist. Patients slide prescriptions through the acrylic-glass window. You inspect each prescription, cross-check it against the retro pharmacy software (**SIM-Apotek Prima v3.2**), and decide: **dispense** or **refuse** — while keeping patients safe and your pharmacy's license intact.

Every rule and trap mirrors real Indonesian pharmacy practice, and every mistake explains *which rule* was broken and *why*, making the game a hands-on way to learn prescription screening.

> This is an educational game. It is not medical or pharmaceutical advice. Doses, prices, and registrations are illustrative.

## Gameplay

<p align="center">
  <img src="docs/gameplay.svg" alt="Animated gameplay loop" width="640" />
</p>

| Title screen | In-shift verification |
|:---:|:---:|
| <img src="docs/screenshot-title.svg" width="420" /> | <img src="docs/screenshot-gameplay.svg" width="420" /> |

| Compounding &amp; labelling |
|:---:|
| <img src="docs/screenshot-dispensing.svg" width="560" /> |

## The loop

```
Patient arrives at the window
      │
      ▼
Hear the (muffled) complaint  +  receive the paper prescription (drag & zoom)
      │
      ▼
Cross-check in SIM-Apotek (F1–F4): drug class, stock, SIP lookup, interactions
      │
      ▼
Decide:  [A] ACCEPT   /   [D] REFUSE
      │
      ├─ Accept a valid Rx → grind powder if compounded → copy-Rx if stock is short → pick label → dispense
      │
      ▼
Educational feedback → next patient → end-of-shift audit (pay, reputation, bills)
```

## Features

- **Tiered rules, one per day** (like *Papers, Please*), announced by a morning newspaper:
  - **R1** — prescription completeness (doctor, SIP, date, patient, R/, signature) and expiry
  - **R2** — drug class vs. prescription requirement (Keras / Psikotropika / Narkotika require an Rx)
  - **R3** — doctor authenticity via **SIP** lookup (registered? name match? expired?)
  - **R4** — spoken complaint vs. prescribed therapy (catches misuse and **LASA** confusion)
  - **R5** — pediatric **maximum daily dose** using Young / Dilling / Clark formulas
- **Retro pharmacy GUI** — a WinForm-style *SIM-Apotek Prima v3.2* with a drug grid, SIP master, and drug-interaction alerts. Fully keyboard-driven (F1–F4).
- **Tactile dispensing**
  - **Etiket** (label) colour: white for internal/oral, blue for external/topical
  - **Puyer compounding** mini-game: grind tablets in the mortar with a circular cursor gesture
  - **Copy prescription (apograph, p.c.c)** with `det` / `ne det` when stock is short
- **OWA (Obat Wajib Apotek)** — selected Keras drugs a pharmacist may dispense without an Rx, within limits.
- **Procedural patients and traps** — panicking parent, controlled-substance tout, chronic (Prolanis) patient, pediatric powder, pediatric overdose, and undercover **Dinkes inspections** (mystery shopper).
- **Shift modifiers** — *Cakar Ayam* (near-illegible handwriting), *Waspada LASA* (look-alike / sound-alike traps), and *Antrian Ramai* (busy night).
- **Diegetic economy** — salary, fines, daily bills, and a reputation meter, with graduated warnings rather than instant game-over.
- **Synthesized audio** — stamp thud, paper slide, mortar grind, bell, and result cues via the Web Audio API, with no audio files to download.
- **100% client-side** — ships as a static SPA. No server, no runtime AI, works offline.

## Pharmacy authenticity

The game encodes real practice, simplified for play:

- **Drug classes:** Bebas, Bebas Terbatas, Keras, Psikotropika, Narkotika, plus **OWA**.
- **Latin `signa`** abbreviations (`S 3 dd tab 1 p.c.`, `u.e.`, `p.r.n.`, `m.f. pulv dtd`, and more) with an in-game dictionary.
- **SIP** issued by *Dinkes* — fakes are caught by unregistered numbers, name mismatches, or expiry.
- **Copy prescription / apograph** with `det` (dispensed) and `ne det` (not yet dispensed).
- **Pediatric dosing** via Young (age, under 8y), Dilling (age, 8–20y), and Clark (body weight).
- **Major interactions** such as Sildenafil + nitrate, Warfarin + Aspirin, and benzodiazepine + opioid.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 (static SPA output) |
| Styling | Tailwind CSS (retro WinForm theme) |
| State | Zustand |
| Audio | Web Audio API (synthesized SFX) |
| Deploy | Vercel (static) |

## Getting started

```bash
# install dependencies
npm install

# run the dev server (http://localhost:5173)
npm run dev

# type-check and produce a production build in dist/
npm run build

# preview the production build
npm run preview
```

Requires Node 18+.

### Controls

| Key | Action |
|---|---|
| `A` | Stamp **ACCEPT** |
| `D` | Stamp **REFUSE** |
| `F1`–`F4` | SIM-Apotek tabs (Tebus Resep / Formularium / Cek Stok / Master SIP) |
| `Enter` | Continue (feedback screen) |
| Mouse | Drag and zoom the prescription; grind in the mortar; pick labels |

## Project structure

```
src/
  audio/            # Web Audio SFX engine
  components/       # UI: layout, SIM-Apotek, prescription, mortar, modals, screens
  data/             # formulary, doctor registry, latin dictionary, interactions, OWA
  game/             # generator, verification engine, dose calc, day rules, RNG, modifiers
  store/            # Zustand game store (phases, economy, flow)
  types/            # shared TypeScript types
docs/               # logo, screenshots, and gameplay media
```

## Deployment

The repository includes `vercel.json`. Import it in Vercel with the **Vite** preset (build command `npm run build`, output directory `dist`), or deploy from the CLI:

```bash
npm i -g vercel
vercel --prod
```

## Roadmap

- Pixi.js desk viewport (scratched acrylic-glass shader, powder particles)
- Additional patient archetypes and multi-item interaction cases
- Generic-substitution flow via the intercom
- Expanded formulary and doctor registry
- English localisation of the in-game text

## Contributing

Contributions are welcome. The content is data-driven — you can add drugs, doctors, interactions, and patient archetypes with small edits under `src/data/` and `src/game/`. Please keep pharmacy facts accurate and cite sources when adding clinical content.

## License

Released under the [MIT License](LICENSE).

## Acknowledgements

Inspired by *Papers, Please* by Lucas Pope, and by the quiet dedication of Indonesian night-shift pharmacists.
