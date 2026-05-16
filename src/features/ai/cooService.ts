import type { Transaction } from "../../types";

const PROXY_URL = import.meta.env.VITE_PROXY_URL || "http://localhost:3001";

export interface COOAnalysisData {
  totalBalance: number;
  fleetHealth: number;
  operationalEfficiency: number;
  recentTransactions: Transaction[];
}

export const generateCOOReport = async (data: COOAnalysisData) => {
  try {
    const response = await fetch(`${PROXY_URL}/api/generate-coo-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error("Proxy API Error:", error);
    return "The Virtual COO is currently analyzing the data streams. Please check back in a moment.";
  }
};
