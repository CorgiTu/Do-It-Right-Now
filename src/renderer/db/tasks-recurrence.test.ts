import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resetTaskForNextOccurrence } from './tasks'
import type { Todo } from './types'

vi.mock('../utils/uuid', () => ({
  generateId: () => 'test-id',
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-01T12:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

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

describe('resetTaskForNextOccurrence', () => {
  it('should set completed to false', () => {
    const task = createTask({
      completed: true,
      isRecurring: true,
      recurrencePattern: 'daily',
    })
    const result = resetTaskForNextOccurrence(task)
    expect(result.completed).toBe(false)
  })

  it('should advance dueDate to next day for daily pattern', () => {
    const task = createTask({
      completed: true,
      isRecurring: true,
      recurrencePattern: 'daily',
      dueDate: '2026-05-01',
    })
    const result = resetTaskForNextOccurrence(task)
    expect(result.dueDate).toBe('2026-05-02')
  })

  it('should advance dueDate by 1 week for weekly pattern', () => {
    const task = createTask({
      completed: true,
      isRecurring: true,
      recurrencePattern: 'weekly',
      dueDate: '2026-05-01',
    })
    const result = resetTaskForNextOccurrence(task)
    expect(result.dueDate).toBe('2026-05-08')
  })

  it('should keep dueDate as null when task has no dueDate', () => {
    const task = createTask({
      completed: true,
      isRecurring: true,
      recurrencePattern: 'daily',
      dueDate: null,
    })
    const result = resetTaskForNextOccurrence(task)
    expect(result.dueDate).toBeNull()
  })

  it('should increment occurrenceCount', () => {
    const task = createTask({
      completed: true,
      isRecurring: true,
      recurrencePattern: 'daily',
      occurrenceCount: 5,
    })
    const result = resetTaskForNextOccurrence(task)
    expect(result.occurrenceCount).toBe(6)
  })

  it('should update updatedAt to current time', () => {
    const task = createTask({
      completed: true,
      isRecurring: true,
      recurrencePattern: 'daily',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const result = resetTaskForNextOccurrence(task)
    expect(result.updatedAt).toBe('2026-05-01T12:00:00.000Z')
  })

  it('should clear lastCompletedDate', () => {
    const task = createTask({
      completed: true,
      isRecurring: true,
      recurrencePattern: 'daily',
      lastCompletedDate: '2026-05-01',
    })
    const result = resetTaskForNextOccurrence(task)
    expect(result.lastCompletedDate).toBeNull()
  })
})
