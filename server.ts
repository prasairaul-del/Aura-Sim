import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const API_KEY = process.env.GEMINI_API_KEY

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Gemini API proxy endpoint
app.post('/api/generate-coo-report', async (req, res) => {
  if (!API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Returning mock insights.')
    await new Promise(resolve => setTimeout(resolve, 2000))
    return res.json({
      text: `[MOCK] Good morning. Analysis of the current luxury fleet performance shows a 12% increase in maintenance efficiency.

Key Insights:
- Fleet Health: Optimal (94%)
- Projected Revenue: +$24,500
- Strategic Recommendation: Consider expanding the electric luxury segment in the Q3 window.`
    })
  }

  try {
    const { data } = req.body

    if (!data) {
      return res.status(400).json({ error: 'Missing data parameter' })
    }

    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      You are the "Virtual COO" of a luxury fleet management company.
      Analyze the following simulation data and provide a concise, high-end, and professional "Morning Brief".

      Data: ${JSON.stringify(data)}

      Format the response with:
      1. A professional greeting and high-level summary.
      2. "Key Insights" bullet points.
      3. A "Strategic Recommendation".

      Keep the tone cinematic, sophisticated, and insightful.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    res.json({ text })
  } catch (error) {
    console.error('Gemini API Error:', error)
    res.status(500).json({
      error: 'Failed to generate report',
      message: 'The Virtual COO is currently analyzing the data streams. Please check back in a moment.'
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
