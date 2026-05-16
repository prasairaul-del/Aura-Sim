# Aura-Sim Project Documentation

> Cinematic Financial Simulator for Luxury Fleet Management

## Project Overview

**Aura-Sim** is a "Financial Theater" — a luxury fleet management simulator that combines aesthetic immersion with complex business logic. Users manage high-end vehicles (Rolls-Royce, Bentley, Maybach) with real-time health tracking, revenue simulation, AI-powered strategic insights via Google Gemini, and OCR receipt scanning.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 8 |
| **State** | Zustand 5 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion 12 |
| **AI** | Google Gemini 1.5 Flash |
| **OCR** | Tesseract.js 7 |
| **Charts** | Recharts 3 |
| **Testing** | Playwright |
| **Deploy** | Vercel |

---

## Project Structure

```
Aura-Sim/
├── .github/workflows/main.yml        # CI: lint + build + E2E tests
├── public/
│   ├── favicon.svg                   # App icon
│   └── icons.svg                     # Icon sprite sheet
├── src/
│   ├── assets/                       # Static images
│   ├── components/
│   │   ├── Layout.tsx                # App shell: nav, ambient glows, transitions
│   │   ├── PerformanceChart.tsx      # Live balance chart (Recharts)
│   │   └── ui/
│   │       ├── GlassComponents.tsx   # GlassCard, StatusBadge
│   │       └── Animations.tsx        # PageTransition, AnimatedValue (unused)
│   ├── features/
│   │   ├── ai/
│   │   │   ├── VirtualCOO.tsx        # AI strategic analysis panel
│   │   │   └── cooService.ts         # Gemini API integration
│   │   ├── finance/
│   │   │   ├── FinancialLedger.tsx   # Transaction form + list
│   │   │   └── OCRDropzone.tsx       # Receipt scanning via Tesseract.js
│   │   └── simulation/
│   │       ── FleetModule.tsx       # Vehicle cards with health/status
│   ├── lib/
│   │   └── utils.ts                  # cn(), formatCurrency()
│   ├── store/
│   │   └── useSimulationStore.ts     # Zustand store (simulation engine)
│   ├── types/
│   │   └── index.ts                  # Vehicle, Transaction, SimulationState
│   ├── App.tsx                       # Root: KPIs + layout grid + sim toggle
│   ├── index.css                     # Tailwind v4 theme + custom styles
│   └── main.tsx                      # React entry point
├── tests/
│   └── core-flows.spec.ts            # Playwright E2E (4 tests)
├── .env.example                      # VITE_GEMINI_API_KEY template
├── vercel.json                       # SPA rewrite config
├── vite.config.ts                    # Vite + Tailwind v4 plugin
├── tsconfig*.json                    # TypeScript configs
└── eslint.config.js                  # ESLint flat config
```

---

## Core Features

### 1. Real-Time Simulation Engine
- **Tick system**: 1-second interval loop (toggle on/off)
- **Vehicle dynamics**: Health decay while in-service, auto-healing in maintenance, auto-status transitions
- **Revenue generation**: $20-$70 per tick for active vehicles
- **Random events**: 1% chance per tick for idle vehicles to enter service
- **Auto transactions**: 10% chance per tick to generate income/expense entries
- **Initial fleet**: Rolls-Royce Ghost, Bentley Flying Spur, Maybach S-Class

### 2. Fleet Module
- Responsive grid (1-3 columns) showing all vehicles
- Status badges: available (emerald), in-service (gold), maintenance (red)
- Color-coded health bars: green (>70%), gold (30-70%), red (<30%)
- Revenue and efficiency metrics per vehicle

### 3. Financial Ledger
- Manual entry form: merchant, amount, type (income/expense), category
- Animated transaction list with Framer Motion enter/exit effects
- Categories: Fleet, Operations, Marketing, Staff, VIP Services

### 4. OCR Receipt Scanning
- Drag-and-drop file upload (PNG, JPG, PDF)
- Real OCR via Tesseract.js with text parsing
- Intelligent extraction: vendor name, total amount, category detection
- Visual states: idle, processing (spinner), success (checkmark)

### 5. Virtual COO
- AI-powered strategic analysis using Google Gemini 1.5 Flash
- Typewriter effect for displaying responses
- Sends live simulation data (balance, fleet health, efficiency, transactions)
- Fallback to mock response when API key is not configured
- Manual refresh button

### 6. KPI Dashboard
- **Total Liquidity**: Current balance in USD
- **Fleet Viability**: Average fleet health percentage
- **Op. Efficiency**: Operational efficiency percentage

### 7. Performance Chart
- Recharts AreaChart showing running balance over time
- Live data from simulation transactions (not static)
- Emerald gradient fill with dark theme styling

---

## Simulation Data Model

### Vehicle
```typescript
interface Vehicle {
  id: string;
  model: string;
  status: "available" | "in-service" | "maintenance";
  health: number;        // 0-100
  lastService: string;
  revenueGenerated: number;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: "Fleet" | "Operations" | "Marketing" | "Staff" | "VIP Services";
  amount: number;
  type: "income" | "expense";
}
```

### Simulation State
```typescript
interface SimulationState {
  fleet: Vehicle[];
  transactions: Transaction[];
  totalBalance: number;
  fleetHealth: number;
  operationalEfficiency: number;
  isSimulating: boolean;
}
```

---

## Design System

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#050505` | Page background |
| `foreground` | `#fafafa` | Primary text |
| `emerald` | `#10b981` | Success, active states |
| `gold-500` | `#d4af37` | Premium highlights |
| `gold-400` | `#fbbf24` | Secondary gold |
| `onyx-950..700` | `#050505..#181818` | Depth layers |

### Visual Effects
- **Glassmorphism**: `bg-white/5 backdrop-blur-md border-white/10 rounded-2xl`
- **Ambient glows**: Pulsing radial gradients behind content
- **Text glow**: `emerald-text-glow` and `gold-text-glow` utility classes
- **Interactive buttons**: Scale-down on click, glow shadows on hover

---

## Environment Variables

```bash
VITE_GEMINI_API_KEY=  # Required for Virtual COO AI features
```

---

## Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
npx playwright test  # Run E2E tests
```

---

## Work Completed

### Session 1: Bug Fixes & Feature Implementation

| # | Task | Files Changed |
|---|------|--------------|
| 1 | Installed missing `react-dropzone` dependency | `package.json` |
| 2 | Fixed type-only imports for `verbatimModuleSyntax` | `src/store/useSimulationStore.ts` |
| 3 | Removed unused `AnimatePresence` import | `src/components/ui/Animations.tsx` |
| 4 | Removed unused `Battery` import, added missing `cn` import | `src/features/simulation/FleetModule.tsx` |
| 5 | Renamed `getVirtualCOOBrief` → `generateCOOReport` | `src/features/ai/cooService.ts` |
| 6 | Made `onAnalysisComplete` prop optional | `src/features/finance/OCRDropzone.tsx` |
| 7 | Connected PerformanceChart to live simulation data | `src/components/PerformanceChart.tsx` |
| 8 | Implemented real OCR with Tesseract.js + receipt parsing | `src/features/finance/OCRDropzone.tsx` |

### Session 2: Tailwind CSS v4 Migration

| # | Task | Files Changed |
|---|------|--------------|
| 1 | Added `@tailwindcss/vite` plugin to Vite config | `vite.config.ts` |
| 2 | Migrated from `@tailwind` directives to `@import "tailwindcss"` | `src/index.css` |
| 3 | Converted `tailwind.config.js` theme to CSS `@theme` directives | `src/index.css` |
| 4 | Replaced all `@apply` with plain CSS properties | `src/index.css` |
| 5 | Deleted obsolete `tailwind.config.js` | (removed) |
| 6 | Deleted unused `App.css` (Vite template leftovers) | (removed) |

**Result**: CSS bundle grew from 0.59kB to 28.32kB — all styles now properly generated and rendered.

---

## Suggested Improvements

### Critical (Fix Immediately)

| Priority | Issue | Impact | Location |
|----------|-------|--------|----------|
| **P0** | OCR results are computed but never used — broken integration | Feature doesn't work | `FinancialLedger.tsx` line 36 |
| **P0** | `any` type in `cooService.ts` undermines type safety | Type errors hidden | `cooService.ts` line 6 |
| **P0** | Gemini API key exposed in client bundle | Security risk | `cooService.ts` |
| **P0** | Dead navigation links (all point to `#`) | Confusing UX | `Layout.tsx` lines 19-22 |
| **P0** | "ACQUIRE NEW ASSET" button has no handler | Non-functional UI | `FleetModule.tsx` line 18 |

### High Priority (Fix Soon)

| Priority | Issue | Impact |
|----------|-------|--------|
| **P1** | No React ErrorBoundary — single error crashes entire app | Reliability |
| **P1** | Accessibility failures: missing ARIA labels, poor contrast, no focus styles | WCAG compliance |
| **P1** | Performance: unnecessary re-renders in chart (no `useMemo`) and typewriter (30ms intervals) | CPU usage |
| **P1** | CI/CD: lint failures ignored (`|| true`), no deployment step | Broken pipeline |
| **P1** | No state persistence — data lost on page refresh | Data loss |

### Medium Priority

| Priority | Issue | Location |
|----------|-------|----------|
| **P2** | Hardcoded magic numbers throughout (tick interval, health decay, revenue ranges) | `useSimulationStore.ts` |
| **P2** | Unused components (`PageTransition`, `AnimatedValue`) | `Animations.tsx` |
| **P2** | No transaction filtering or search | `FinancialLedger.tsx` |
| **P2** | Minimal test coverage (4 E2E tests, no unit tests) | `tests/` |
| **P2** | Redundant `@types/react-dropzone` dependency | `package.json` |

### Low Priority

| Priority | Issue | Description |
|----------|-------|-------------|
| **P3** | Multi-currency support | `formatCurrency` always uses USD |
| **P3** | Dark/light mode toggle | Permanently dark-themed |
| **P3** | Data export (CSV/PDF) | For accounting purposes |
| **P3** | Vehicle service scheduling | `lastService` field is never updated |
| **P3** | Alert/notification system | No alerts for low health or negative balance |

### Specific Code Recommendations

**1. Add proper COO data types** (`cooService.ts`):
```typescript
interface COOAnalysisData {
  totalBalance: number;
  fleetHealth: number;
  operationalEfficiency: number;
  recentTransactions: Transaction[];
}

export const generateCOOReport = async (data: COOAnalysisData) => { ... }
```

**2. Add `useMemo` to PerformanceChart** (`PerformanceChart.tsx`):
```typescript
const data = useMemo(() => {
  // chart calculation logic
}, [transactions, totalBalance]);
```

**3. Use `requestAnimationFrame` or visibility API for simulation tick** (`App.tsx`):
```typescript
useEffect(() => {
  if (!isSimulating) return;
  const interval = setInterval(() => {
    if (!document.hidden) tick();
  }, 1000);
  return () => clearInterval(interval);
}, [isSimulating, tick]);
```

**4. Add Zustand persist middleware** (`useSimulationStore.ts`):
```typescript
import { persist } from 'zustand/middleware';
export const useSimulationStore = create(
  persist<SimulationState & SimulationActions>((set, get) => ({ ... }), {
    name: 'aura-sim-storage',
  })
);
```

**5. Add ErrorBoundary** (new file):
```typescript
import { Component, ReactNode } from 'react';
export class ErrorBoundary extends Component<...> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <FallbackUI />;
    return this.props.children;
  }
}
```

---

## Dependency Notes

| Dependency | Version | Notes |
|------------|---------|-------|
| `react` | `^19.2.6` | Very new; all deps compatible |
| `react-dropzone` | (latest) | Ships own types — `@types/react-dropzone` is redundant |
| `tesseract.js` | `^7.0.0` | ~20MB with langs; consider lazy loading |
| `zustand` | `^5.0.13` | Current |
| `recharts` | `^3.8.1` | Verify v3 compatibility |
| `framer-motion` | `^12.38.0` | Current |
| `@google/generative-ai` | `^0.24.1` | Current |

---

## CI/CD Pipeline

**GitHub Actions** (`.github/workflows/main.yml`):
1. Checkout code
2. Install dependencies
3. Run lint (`|| true` — **lint failures are ignored**)
4. Build with TypeScript check
5. Start dev server + run Playwright E2E tests

**Known Issues**:
- Lint failures don't fail the build
- No Playwright browser caching
- No test artifact uploads
- No deployment step despite "CI/CD" naming
- Redundant manual dev server start (Playwright has `webServer` config)

---

## Deployment

**Platform**: Vercel
**Config**: `vercel.json` with SPA rewrite rules
**Build**: `npm run build`
**Output**: `dist/` directory

---

*Last updated: 2026-05-16*
