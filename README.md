# Aura-Sim | Financial Theater

A highly stylized, cinematic financial simulator for luxury fleet management. Aura-Sim bridges the gap between aesthetic immersion and complex logic, featuring real-time simulation, OCR-driven data entry, and AI-powered strategic analysis.

## 🎭 The "Theater" Experience
- **Cyber-Luxury Aesthetic:** Deep emerald, gold, and onyx palette with Glassmorphism 2.0 effects.
- **Cinematic Interactions:** Fluid page transitions and micro-interactions powered by Framer Motion.
- **Virtual COO:** Integrated Gemini-1.5-Flash provides a daily "Morning Brief" with strategic insights based on real-time simulation data.
- **OCR Neural Dropzone:** Drag and drop receipts to instantly update the ledger using client-side Tesseract.js.
- **Real-time Engine:** Dynamic "Fleet Health" and "Yield Velocity" calculations that respond to operational events.

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **State:** Zustand (Simulation Machine)
- **Intelligence:** Google Gemini AI SDK
- **OCR:** Tesseract.js
- **Charts:** Recharts (Customized Luxury Theme)
- **Testing:** Playwright (E2E)

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
   # Add your VITE_GEMINI_API_KEY to .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🧪 Testing
Run the Playwright E2E suite:
```bash
npx playwright test
```

## 📜 Deployment
The project is configured for instant deployment on Vercel or Netlify. Ensure the `VITE_GEMINI_API_KEY` is added to your production environment variables.
