import { describe, it, expect } from 'vitest'
import { shouldResetOnCompletion } from '../db/tasks'
import type { Todo } from '../db/types'

function createTask(overrides: Partial<Todo> = {}): Todo {
  return {
    id: '1',
    content: 'test task',
    completed: false,
    listId: '1',
    dueDate: null,
    reminder: null,
    order: 0,
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    isRecurring: false,
    recurrencePattern: null,
    lastCompletedDate: null,
    originalTaskId: null,
    autoCompleteOnSubtasksDone: false,
    endDate: null,
    maxOccurrences: null,
    occurrenceCount: 0,
    exceptionDates: [],
    ...overrides,
  }
}

describe('shouldResetOnCompletion', () => {
  it('should return false for non-recurring task', () => {
    const task = createTask({ isRecurring: false })
    expect(shouldResetOnCompletion(task)).toBe(false)
  })

  it('should return true for recurring task with no end conditions', () => {
    const task = createTask({
      isRecurring: true,
      recurrencePattern: 'daily',
    })
    expect(shouldResetOnCompletion(task)).toBe(true)
  })

  it('should return false when current date >= endDate', () => {
    const task = createTask({
      isRecurring: true,
      recurrencePattern: 'daily',
      endDate: '2026-04-30',
    })
    expect(shouldResetOnCompletion(task)).toBe(false)
  })

  it('should return true when current date < endDate', () => {
    const task = createTask({
      isRecurring: true,
      recurrencePattern: 'daily',
      endDate: '2027-01-01',
    })
    expect(shouldResetOnCompletion(task)).toBe(true)
  })

  it('should return false when occurrenceCount >= maxOccurrences', () => {
    const task = createTask({
      isRecurring: true,
      recurrencePattern: 'daily',
      occurrenceCount: 10,
      maxOccurrences: 10,
    })
    expect(shouldResetOnCompletion(task)).toBe(false)
  })

  it('should return true when occurrenceCount < maxOccurrences', () => {
    const task = createTask({
      isRecurring: true,
      recurrencePattern: 'daily',
      occurrenceCount: 5,
      maxOccurrences: 10,
    })
    expect(shouldResetOnCompletion(task)).toBe(true)
  })

  it('should return false when current date is in exceptionDates', () => {
    const today = new Date().toISOString().split('T')[0]
    const task = createTask({
      isRecurring: true,
      recurrencePattern: 'daily',
      exceptionDates: [today],
    })
    expect(shouldResetOnCompletion(task)).toBe(false)
  })

  it('should return true when current date is not in exceptionDates', () => {
    const task = createTask({
      isRecurring: true,
      recurrencePattern: 'daily',
      exceptionDates: ['2026-10-01', '2026-10-02'],
    })
    expect(shouldResetOnCompletion(task)).toBe(true)
  })
})
