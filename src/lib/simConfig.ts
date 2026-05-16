/**
 * Simulation configuration constants.
 * All magic numbers from the simulation engine are centralized here.
 */

// Tick timing (milliseconds)
export const TICK_INTERVAL_MS = 1000

// Health decay per tick when vehicle is in-service
export const HEALTH_DECAY_MAX = 0.3

// Revenue per tick when vehicle is in-service (min, max)
export const REVENUE_MIN = 20
export const REVENUE_MAX = 70

// Healing rate per tick during maintenance
export const MAINTENANCE_HEAL_RATE = 1.0

// Random event: chance per tick that an available vehicle enters service
export const ENTER_SERVICE_CHANCE = 0.01

// Random transaction generation: chance per tick
export const TRANSACTION_CHANCE = 0.1

// Random transaction amounts
export const INCOME_AMOUNT_MIN = 100
export const INCOME_AMOUNT_MAX = 600
export const EXPENSE_AMOUNT_MIN = 50
export const EXPENSE_AMOUNT_MAX = 250

// Max transactions to keep in store
export const MAX_TRANSACTIONS = 50

// Performance chart: max data points to display
export const CHART_MAX_POINTS = 24

// Virtual COO: typewriter character delay (ms)
export const TYPEWRITER_DELAY_MS = 30

// Alert thresholds
export const LOW_HEALTH_THRESHOLD = 30
export const CRITICAL_HEALTH_THRESHOLD = 10
export const NEGATIVE_BALANCE_THRESHOLD = 0

// OCR max file size in bytes (5MB)
export const OCR_MAX_FILE_SIZE = 5 * 1024 * 1024
