# Kuaizi Calculator

A pure-frontend web tool that computes the full landed cost of importing goods from China to Colombia. Built for Kuaizi Group's internal operators and clients.

## What it does

Takes a shipment's product value, origin, freight details, and customs parameters and walks through a 14-step calculation chain:

**Product value → FOB → CIF → Arancel → IVA → Antidumping → Nationalization → Local delivery → Financial costs → Kuaizi fees → Total landed cost (USD and COP)**

Key features:
- 8 input sections covering every cost component from China to Colombian warehouse
- Incoterm-driven field visibility (EXW / FOB / CIF)
- 4 freight modes: Sea-FCL, Sea-LCL, Air, Express — each with its own chargeable weight formula
- Hybrid HS code selector: 20 Kuaizi-frequent categories with pre-loaded tariff + IVA rates, plus manual 10-digit override
- Antidumping toggle with manual rate entry and disclaimer banner
- INVIMA/ICA advisory warnings for regulated product categories (food, cosmetics, agricultural, medical)
- TRM (Colombian exchange rate) manual entry with staleness warning after 7 days
- Live recalculation as you type (synchronous, < 50ms)
- Itemized cost breakdown table in USD and COP with per-unit calculations
- Margin calculator: given a target margin %, shows recommended COP sell price per unit
- Print/PDF export via native browser print dialog — no third-party PDF library

## Tech stack

| Layer | Choice |
|-------|--------|
| Build | Vite 5 |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS |
| State | `useReducer` + React Context |
| Calc engine | Pure function `calculateLandedCost(inputs): Result` in `src/lib/calc/` |
| PDF export | `window.print()` + `@media print` CSS |
| Backend | None — fully static, zero API calls |

## Architecture

The calculation engine (`src/lib/calc/`) is a pure synchronous function isolated from the React layer. React components are a thin shell: state lives in a single `useReducer`, derived state is computed via `useMemo` and fed into the engine on every render.

```
src/
├── lib/
│   ├── calc/          # Pure calculation engine (framework-agnostic)
│   │   ├── index.ts   # calculateLandedCost() orchestrator
│   │   ├── product.ts, freight.ts, duties.ts, ...
│   │   └── __smoke__.ts  # 5 smoke test cases (0.000% delta tolerance)
│   └── validation/
│       └── visibility.ts  # Declarative field visibility predicates
├── state/
│   ├── reducer.ts     # CalculatorState + actions
│   ├── context.tsx    # CalculatorProvider + useCalculator hook
│   └── selectors.ts   # state → CalculatorInputs
├── components/
│   ├── sections/      # Input sections A through H
│   ├── results/       # ResultsTable, MarginCalculator, ExportButton, WarningBanners
│   └── ui/            # NumberField, Select, Toggle, Banner
├── data/
│   └── hs-categories.json  # 20 HS categories with tariff + IVA rates (team-editable)
└── types/             # domain.ts, inputs.ts, result.ts
```

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Output goes to `dist/` — deploy to any static host (Vercel, Netlify, Cloudflare Pages).

## Deployment

The app is fully static. No server, no database, no environment variables required.

**Vercel / Netlify:** Connect this repo, set framework to Vite, deploy. Done.

## Smoke tests

The engine has 5 smoke test cases in `src/lib/calc/__smoke__.ts`. Run them directly with `ts-node` or Vite's `vite-node`:

```bash
npx vite-node src/lib/calc/__smoke__.ts
```

All 5 cases pass at 0.000% delta tolerance.

## Phase 2 candidates

- TRM live fetch from Banco de la República open data API
- HS code auto-lookup from DIAN database
- Multi-mode comparison view (Sea-LCL vs Air side-by-side)
- Saved quotes via localStorage or optional backend
- Quote sharing via URL (state-in-querystring)
- Antidumping rate auto-detection by HS chapter
- Bitrix24/n8n integration — push a quote directly as a Deal

---

Built by [Kuaizi Group](https://kuaizigroup.com)
