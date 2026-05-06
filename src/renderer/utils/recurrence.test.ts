import { describe, it, expect } from 'vitest'
import { calculateNextOccurrenceDate, clampDayOfMonth } from './recurrence'
import type { RecurrenceRule } from '../db/types'

describe('calculateNextOccurrenceDate', () => {
  it('should advance by 1 day for daily pattern', () => {
    const rule: RecurrenceRule = { pattern: 'daily', interval: 1 }
    const result = calculateNextOccurrenceDate('2026-05-01T00:00:00.000Z', rule)
    expect(result).toBe('2026-05-02')
  })

  it('should advance by interval days for daily pattern', () => {
    const rule: RecurrenceRule = { pattern: 'daily', interval: 3 }
    const result = calculateNextOccurrenceDate('2026-05-01T00:00:00.000Z', rule)
    expect(result).toBe('2026-05-04')
  })

  it('should advance by 1 week for weekly pattern', () => {
    const rule: RecurrenceRule = { pattern: 'weekly', interval: 1 }
    const result = calculateNextOccurrenceDate('2026-05-01T00:00:00.000Z', rule)
    expect(result).toBe('2026-05-08')
  })

  it('should advance by 2 weeks for weekly pattern with interval=2', () => {
    const rule: RecurrenceRule = { pattern: 'weekly', interval: 2 }
    const result = calculateNextOccurrenceDate('2026-05-01T00:00:00.000Z', rule)
    expect(result).toBe('2026-05-15')
  })

  it('should advance to next month for monthly pattern', () => {
    const rule: RecurrenceRule = { pattern: 'monthly', interval: 1 }
    const result = calculateNextOccurrenceDate('2026-05-01T00:00:00.000Z', rule)
    expect(result).toBe('2026-06-01')
  })

  it('should clamp day to last day of month when month has fewer days', () => {
    const rule: RecurrenceRule = { pattern: 'monthly', interval: 1 }
    const result = calculateNextOccurrenceDate('2026-01-31T00:00:00.000Z', rule)
    expect(result).toBe('2026-02-28')
  })

  it('should handle February in leap year', () => {
    const rule: RecurrenceRule = { pattern: 'monthly', interval: 1 }
    const result = calculateNextOccurrenceDate('2024-01-31T00:00:00.000Z', rule)
    expect(result).toBe('2024-02-29')
  })

  it('should advance by 2 months for monthly pattern with interval=2', () => {
    const rule: RecurrenceRule = { pattern: 'monthly', interval: 2 }
    const result = calculateNextOccurrenceDate('2026-05-15T00:00:00.000Z', rule)
    expect(result).toBe('2026-07-15')
  })

  it('should advance to next year for yearly pattern', () => {
    const rule: RecurrenceRule = { pattern: 'yearly', interval: 1 }
    const result = calculateNextOccurrenceDate('2026-05-01T00:00:00.000Z', rule)
    expect(result).toBe('2027-05-01')
  })

  it('should preserve month and day for yearly pattern', () => {
    const rule: RecurrenceRule = { pattern: 'yearly', interval: 1 }
    const result = calculateNextOccurrenceDate('2026-02-28T00:00:00.000Z', rule)
    expect(result).toBe('2027-02-28')
  })

  it('should find next weekly day when multiple days selected', () => {
    const rule: RecurrenceRule = { pattern: 'weekly', interval: 1, weeklyDays: [1, 3] }
    const monday = new Date(2026, 4, 4).toISOString()
    const result = calculateNextOccurrenceDate(monday, rule)
    expect(result).toBe('2026-05-06')
  })
})

describe('clampDayOfMonth', () => {
  it('should keep the same day if within month range', () => {
    const result = clampDayOfMonth(new Date(2026, 4, 1), 15)
    expect(result.getDate()).toBe(15)
  })

  it('should clamp to last day of month when day exceeds range', () => {
    const result = clampDayOfMonth(new Date(2026, 1, 1), 31)
    expect(result.getDate()).toBe(28)
  })

  it('should handle February in leap year', () => {
    const result = clampDayOfMonth(new Date(2024, 1, 1), 31)
    expect(result.getDate()).toBe(29)
  })

  it('should handle 30-day months', () => {
    const result = clampDayOfMonth(new Date(2026, 3, 1), 31)
    expect(result.getDate()).toBe(30)
  })

  it('should handle 31-day months', () => {
    const result = clampDayOfMonth(new Date(2026, 0, 1), 31)
    expect(result.getDate()).toBe(31)
  })
})
