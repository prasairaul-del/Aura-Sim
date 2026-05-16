# Aura-Sim | Financial Theater

A highly stylized, cinematic financial simulator for luxury fleet management. Aura-Sim bridges the gap between aesthetic immersion and complex logic, featuring real-time simulation, OCR-driven data entry, AI-powered strategic analysis, and comprehensive business management tools.

## 🎭 The "Theater" Experience
- **Cyber-Luxury Aesthetic:** Deep emerald, gold, and onyx palette with Glassmorphism 2.0 effects.
- **Cinematic Interactions:** Fluid page transitions and micro-interactions powered by Framer Motion.
- **Virtual COO:** Integrated Gemini-1.5-Flash provides a daily "Morning Brief" with strategic insights based on real-time simulation data.
- **OCR Neural Dropzone:** Drag and drop receipts to instantly update the ledger using client-side Tesseract.js.
- **Real-time Engine:** Dynamic "Fleet Health" and "Yield Velocity" calculations that respond to operational events.

## ✨ Features

### Core Simulation
- **Luxury Fleet Management:** Track Rolls-Royce, Bentley, Maybach vehicles with health monitoring
- **Financial Ledger:** Real-time income/expense tracking with multi-currency support (USD, EUR, GBP, JPY, AED)
- **Vehicle Acquisition:** Browse and purchase from an integrated vehicle catalog
- **Maintenance Tracking:** Per-vehicle maintenance cost tracking and service scheduling
- **Vehicle Decommissioning:** Sell assets with automatic resale value calculation

### Business Intelligence
- **Advanced Analytics Dashboard:** Revenue charts, fleet status distribution, transaction trends, maintenance costs
- **Budget Planning:** Set budget targets by category with planned vs actual variance tracking
- **Customer Profiles & Bookings:** VIP customer directory with tier system and reservation calendar
- **Staff Management:** Hire/fire employees, track salaries, monitor performance ratings by department
- **Scenario Manager:** Create and switch between multiple simulation profiles with different configurations

### User Experience
- **Client-Side Routing:** Fast page transitions with React Router v6 - each section has its own URL
- **Keyboard Shortcuts:** Power user shortcuts for quick navigation (Space, ?, g+d, g+f, etc.)
- **Configurable Alerts:** Customizable thresholds for vehicle health and balance warnings
- **CSV Import:** Drag-and-drop import for vehicles and transactions with template downloads
- **First-Time Onboarding:** Interactive tutorial for new users
- **Confirmation Dialogs:** Safety checks for destructive actions
- **Mobile Responsive:** Hamburger menu and touch-optimized interface
- **Accessibility:** ARIA labels, keyboard navigation, focus management, screen reader support

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **State:** Zustand (Simulation Machine with localStorage persistence)
- **Intelligence:** Google Gemini AI SDK
- **Charts:** Recharts (Customized Luxury Theme)
- **Testing:** Vitest (Unit), Playwright (E2E)
- **Backend:** Express.js proxy server for API key protection

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API Key ([Get one here](https://aistudio.google.com/))

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env (backend proxy)
   ```
4. Start the backend proxy server (recommended for production):
   ```bash
   npm run proxy
   ```
5. In a new terminal, start the development server:
   ```bash
   npm run dev
   ```

**Note:** The backend proxy protects your API keys by keeping them server-side. For development only, you can still use `VITE_GEMINI_API_KEY` directly in the frontend, but this is not recommended for production.

## 🧪 Testing
Run the test suite:
```bash
npm test        # Unit tests with Vitest
npx playwright test  # E2E tests
```

## 📜 Deployment

### Frontend (Vercel/Netlify)
The project is configured for instant deployment on Vercel or Netlify. Set the `VITE_PROXY_URL` environment variable to point to your deployed proxy server.

### Backend Proxy (Railway/Render/Fly.io)
Deploy the proxy server separately to protect your Gemini API key:
1. Set `GEMINI_API_KEY` in your hosting platform's environment variables
2. Deploy `server.ts` as a Node.js application
3. Update `VITE_PROXY_URL` in your frontend to match the deployed proxy URL

**Security Note:** Never expose your `GEMINI_API_KEY` in frontend code. Always use the backend proxy in production.
