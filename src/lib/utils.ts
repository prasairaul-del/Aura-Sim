import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CURRENCIES: Record<string, { code: string; locale: string }> = {
  USD: { code: 'USD', locale: 'en-US' },
  EUR: { code: 'EUR', locale: 'de-DE' },
  GBP: { code: 'GBP', locale: 'en-GB' },
  JPY: { code: 'JPY', locale: 'ja-JP' },
  AED: { code: 'AED', locale: 'ar-AE' },
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const { code, locale } = CURRENCIES[currency] ?? CURRENCIES.USD
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
  }).format(amount)
}

export const AVAILABLE_CURRENCIES = Object.keys(CURRENCIES) as (keyof typeof CURRENCIES)[]
