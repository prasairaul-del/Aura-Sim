import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getVirtualCOOBrief = async (data: any) => {
  if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY is not set. Using mock insights.");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `[MOCK] Good morning. Analysis of the current luxury fleet performance shows a 12% increase in maintenance efficiency. 

Key Insights:
- Fleet Health: Optimal (94%)
- Projected Revenue: +$24,500
- Strategic Recommendation: Consider expanding the electric luxury segment in the Q3 window.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are the "Virtual COO" of a luxury fleet management company. 
      Analyze the following simulation data and provide a concise, high-end, and professional "Morning Brief".
      
      Data: ${JSON.stringify(data)}
      
      Format the response with:
      1. A professional greeting and high-level summary.
      2. "Key Insights" bullet points.
      3. A "Strategic Recommendation".
      
      Keep the tone cinematic, sophisticated, and insightful.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The Virtual COO is currently analyzing the data streams. Please check back in a moment.";
  }
};
