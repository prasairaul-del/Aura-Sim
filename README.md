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
Run the Playwright E2E suite:
```bash
npx playwright test
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
