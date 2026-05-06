import { describe, it, expectTypeOf } from 'vitest'
import type { RecurrencePattern, RecurrenceRule, Todo, CreateTodoInput } from './types'

describe('Type Definitions', () => {
  describe('RecurrencePattern', () => {
    it('should accept valid pattern values', () => {
      const daily: RecurrencePattern = 'daily'
      const weekly: RecurrencePattern = 'weekly'
      const monthly: RecurrencePattern = 'monthly'
      const yearly: RecurrencePattern = 'yearly'
      const custom: RecurrencePattern = 'custom'
      const none: RecurrencePattern = null

      expectTypeOf(daily).toMatchTypeOf<RecurrencePattern>()
      expectTypeOf(weekly).toMatchTypeOf<RecurrencePattern>()
      expectTypeOf(monthly).toMatchTypeOf<RecurrencePattern>()
      expectTypeOf(yearly).toMatchTypeOf<RecurrencePattern>()
      expectTypeOf(custom).toMatchTypeOf<RecurrencePattern>()
      expectTypeOf(none).toMatchTypeOf<RecurrencePattern>()
    })
  })

  describe('RecurrenceRule', () => {
    it('should have all required fields', () => {
      const rule: RecurrenceRule = {
        pattern: 'daily',
        interval: 1,
      }
      expectTypeOf(rule).toHaveProperty('pattern')
      expectTypeOf(rule).toHaveProperty('interval')
    })

    it('should have optional fields', () => {
      const rule: RecurrenceRule = {
        pattern: 'weekly',
        interval: 1,
        weeklyDays: [1, 3],
        monthlyDay: 15,
        endDate: '2026-12-31',
        maxOccurrences: 10,
        exceptionDates: ['2026-10-01'],
      }
      expectTypeOf(rule).toHaveProperty('weeklyDays')
      expectTypeOf(rule).toHaveProperty('monthlyDay')
      expectTypeOf(rule).toHaveProperty('endDate')
      expectTypeOf(rule).toHaveProperty('maxOccurrences')
      expectTypeOf(rule).toHaveProperty('exceptionDates')
    })
  })

  describe('Todo interface', () => {
    it('should have recurrence fields', () => {
      const todo: Todo = {
        id: '1',
        content: 'test',
        completed: false,
        listId: '1',
        dueDate: null,
        reminder: null,
        order: 0,
        createdAt: '2026-05-01',
        updatedAt: '2026-05-01',
        isRecurring: true,
        recurrencePattern: 'daily',
        lastCompletedDate: null,
        originalTaskId: null,
        autoCompleteOnSubtasksDone: false,
        endDate: null,
        maxOccurrences: null,
        occurrenceCount: 0,
        exceptionDates: [],
      }

      expectTypeOf(todo).toHaveProperty('endDate')
      expectTypeOf(todo).toHaveProperty('maxOccurrences')
      expectTypeOf(todo).toHaveProperty('occurrenceCount')
      expectTypeOf(todo).toHaveProperty('exceptionDates')
    })
  })

  describe('CreateTodoInput', () => {
    it('should accept recurrence fields', () => {
      const input: CreateTodoInput = {
        content: 'test',
        isRecurring: true,
        recurrencePattern: 'weekly',
        endDate: '2026-12-31',
        maxOccurrences: 10,
        occurrenceCount: 0,
        exceptionDates: ['2026-10-01'],
      }

      expectTypeOf(input).toHaveProperty('endDate')
      expectTypeOf(input).toHaveProperty('maxOccurrences')
      expectTypeOf(input).toHaveProperty('exceptionDates')
    })
  })
})
