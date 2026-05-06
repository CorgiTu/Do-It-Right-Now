import type { RecurrenceRule } from '../db/types'

const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function clampDayOfMonth(date: Date, targetDay: number): Date {
  const year = date.getFullYear()
  const month = date.getMonth()
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
  const actualDay = Math.min(targetDay, lastDayOfMonth)
  return new Date(year, month, actualDay)
}

export function calculateNextOccurrenceDate(currentDate: string, rule: RecurrenceRule): string | null {
  const date = new Date(currentDate)
  
  switch (rule.pattern) {
    case 'daily': {
      const interval = rule.interval || 1
      const next = new Date(date)
      next.setDate(next.getDate() + interval)
      return formatDate(next)
    }
    
    case 'weekly': {
      if (rule.weeklyDays && rule.weeklyDays.length > 0) {
        return findNextWeekday(date, rule.weeklyDays, rule.interval || 1)
      }
      const interval = rule.interval || 1
      const next = new Date(date)
      next.setDate(next.getDate() + interval * 7)
      return formatDate(next)
    }
    
    case 'monthly': {
      const interval = rule.interval || 1
      const currentDay = date.getDate()
      const next = new Date(date)
      next.setDate(1)
      next.setMonth(next.getMonth() + interval)
      const clamped = clampDayOfMonth(next, currentDay)
      return formatDate(clamped)
    }
    
    case 'yearly': {
      const interval = rule.interval || 1
      const next = new Date(date)
      next.setFullYear(next.getFullYear() + interval)
      const clamped = clampDayOfMonth(next, date.getDate())
      return formatDate(clamped)
    }
    
    case 'custom': {
      if (rule.weeklyDays && rule.weeklyDays.length > 0) {
        return findNextWeekday(date, rule.weeklyDays, rule.interval || 1)
      }
      if (rule.monthlyDay) {
        return findNextMonthlyDay(date, rule.monthlyDay, rule.interval || 1)
      }
      return null
    }
    
    default:
      return null
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function findNextWeekday(currentDate: Date, daysOfWeek: number[], interval: number): string {
  const today = currentDate.getDay()
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b)
  
  const nextDay = sortedDays.find(day => day > today)
  
  if (nextDay !== undefined) {
    const daysUntilNext = nextDay - today
    const next = new Date(currentDate)
    next.setDate(next.getDate() + daysUntilNext)
    return formatDate(next)
  }
  
  const daysUntilFirst = (7 - today) + sortedDays[0]
  const next = new Date(currentDate)
  next.setDate(next.getDate() + daysUntilFirst + (interval - 1) * 7)
  return formatDate(next)
}

function findNextMonthlyDay(currentDate: Date, monthlyDay: number, interval: number): string {
  const currentDay = currentDate.getDate()
  
  if (monthlyDay > currentDay) {
    const next = new Date(currentDate)
    next.setDate(monthlyDay)
    return formatDate(next)
  }
  
  const next = new Date(currentDate)
  next.setMonth(next.getMonth() + interval)
  const clamped = clampDayOfMonth(next, monthlyDay)
  return formatDate(clamped)
}

export function getRecurrenceDescription(rule: RecurrenceRule): string {
  switch (rule.pattern) {
    case 'daily':
      return `每日`
    case 'weekly':
      if (rule.weeklyDays && rule.weeklyDays.length > 0) {
        const days = rule.weeklyDays.map(d => DAY_NAMES[d]).join('、')
        return rule.interval > 1 ? `每隔${rule.interval}周${days}` : `每周${days}`
      }
      return `每周`
    case 'monthly':
      return rule.interval > 1 ? `每隔${rule.interval}月` : `每月`
    case 'yearly':
      return rule.interval > 1 ? `每隔${rule.interval}年` : `每年`
    case 'custom':
      if (rule.weeklyDays && rule.weeklyDays.length > 0) {
        const days = rule.weeklyDays.map(d => DAY_NAMES[d]).join('、')
        return rule.interval > 1 ? `每隔${rule.interval}周${days}` : `每周${days}`
      }
      if (rule.monthlyDay) {
        return rule.interval > 1 ? `每隔${rule.interval}月${rule.monthlyDay}号` : `每月${rule.monthlyDay}号`
      }
      return `自定义`
    default:
      return ''
  }
}
