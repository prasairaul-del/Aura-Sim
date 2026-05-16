import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Exchange rates relative to USD (base currency)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 154.50,
  AED: 3.67,
}

const CURRENCIES: Record<string, { code: string; locale: string }> = {
  USD: { code: 'USD', locale: 'en-US' },
  EUR: { code: 'EUR', locale: 'de-DE' },
  GBP: { code: 'GBP', locale: 'en-GB' },
  JPY: { code: 'JPY', locale: 'ja-JP' },
  AED: { code: 'AED', locale: 'ar-AE' },
}

/**
 * Convert amount from one currency to another using fixed exchange rates
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount
  
  const fromRate = EXCHANGE_RATES[fromCurrency] ?? 1.0
  const toRate = EXCHANGE_RATES[toCurrency] ?? 1.0
  
  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate
  return amountInUSD * toRate
}

/**
 * Format amount in the specified currency with proper locale formatting
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const { code, locale } = CURRENCIES[currency] ?? CURRENCIES.USD
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
  }).format(amount)
}

/**
 * Format amount by converting from USD base to target currency
 */
export function formatCurrencyFromUSD(amountInUSD: number, currency: string = 'USD'): string {
  const converted = convertCurrency(amountInUSD, 'USD', currency)
  return formatCurrency(converted, currency)
}

export const AVAILABLE_CURRENCIES = Object.keys(CURRENCIES) as (keyof typeof CURRENCIES)[]

