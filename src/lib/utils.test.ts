import { describe, it, expect } from 'vitest'
import { formatCurrency, cn, AVAILABLE_CURRENCIES } from './utils'

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats USD explicitly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00')
  })

  it('formats EUR with German locale', () => {
    const result = formatCurrency(1234.56, 'EUR')
    expect(result).toContain('1.234,56')
    expect(result).toContain('€')
  })

  it('formats GBP with UK locale', () => {
    const result = formatCurrency(999.99, 'GBP')
    expect(result).toContain('£')
    expect(result).toContain('999.99')
  })

  it('formats JPY without decimal places', () => {
    const result = formatCurrency(1000, 'JPY')
    // JPY uses full-width yen symbol in ja-JP locale
    expect(result).toMatch(/[¥￥]/)
    // JPY has no minor units, so no decimals
    expect(result).not.toContain('.')
  })

  it('formats AED (UAE Dirham)', () => {
    const result = formatCurrency(500, 'AED')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('handles negative amounts', () => {
    expect(formatCurrency(-100)).toBe('-$100.00')
  })

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('handles large numbers', () => {
    const result = formatCurrency(1000000)
    expect(result).toContain('1,000,000')
  })

  it('falls back to USD for unknown currency codes', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(formatCurrency(100, 'INVALID' as any)).toBe('$100.00')
  })

  it('formats cents correctly', () => {
    expect(formatCurrency(0.01)).toBe('$0.01')
    expect(formatCurrency(0.99)).toBe('$0.99')
  })
})

describe('AVAILABLE_CURRENCIES', () => {
  it('contains expected currency codes', () => {
    expect(AVAILABLE_CURRENCIES).toContain('USD')
    expect(AVAILABLE_CURRENCIES).toContain('EUR')
    expect(AVAILABLE_CURRENCIES).toContain('GBP')
    expect(AVAILABLE_CURRENCIES).toContain('JPY')
    expect(AVAILABLE_CURRENCIES).toContain('AED')
  })

  it('has exactly 5 currencies', () => {
    expect(AVAILABLE_CURRENCIES).toHaveLength(5)
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters out falsy values', () => {
    expect(cn('foo', false, null, undefined, '', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes with objects', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('merges Tailwind classes intelligently', () => {
    // tailwind-merge should resolve conflicts
    expect(cn('px-2 px-4')).toBe('px-4')
  })

  it('handles mixed input types', () => {
    expect(cn('base', ['nested', { condition: true }], { another: false })).toBe('base nested condition')
  })

  it('returns empty string for no classes', () => {
    expect(cn()).toBe('')
  })

  it('handles complex real-world usage', () => {
    const isActive = true
    const hasError = false
    const result = cn(
      'btn btn-primary',
      { 'btn-active': isActive, 'btn-error': hasError },
      ['px-4 py-2', { 'bg-red-500': hasError }]
    )
    expect(result).toContain('btn')
    expect(result).toContain('btn-primary')
    expect(result).toContain('btn-active')
    expect(result).toContain('px-4')
    expect(result).toContain('py-2')
  })
})
