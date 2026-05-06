import { describe, it, expect, beforeEach } from 'vitest'
import { addTimelineEntry, getTimelineByTaskId, deleteTimelineByTaskId } from './timeline'

const TIMELINE_STORE_KEY = 'do-it-right-now-timeline-v1'

describe('timeline.ts', () => {
  beforeEach(() => {
    localStorage.removeItem(TIMELINE_STORE_KEY)
  })

  describe('addTimelineEntry', () => {
    it('should create a timeline entry with required fields', async () => {
      const entry = await addTimelineEntry('task-1', 'created')

      expect(entry.id).toBeDefined()
      expect(entry.id.length).toBeGreaterThan(0)
      expect(entry.taskId).toBe('task-1')
      expect(entry.actionType).toBe('created')
      expect(entry.createdAt).toBeDefined()
      expect(entry.beforeValue).toBeNull()
      expect(entry.afterValue).toBeNull()
    })

    it('should create entry with beforeValue and afterValue as JSON strings', async () => {
      const beforeValue = { content: 'old content' }
      const afterValue = { content: 'new content' }

      const entry = await addTimelineEntry('task-1', 'content_edit', beforeValue, afterValue)

      expect(entry.beforeValue).toBe('{"content":"old content"}')
      expect(entry.afterValue).toBe('{"content":"new content"}')
    })

    it('should create entry with null beforeValue/afterValue when not provided', async () => {
      const entry = await addTimelineEntry('task-1', 'created')

      expect(entry.beforeValue).toBeNull()
      expect(entry.afterValue).toBeNull()
    })

    it('should append entry to existing entries', async () => {
      await addTimelineEntry('task-1', 'created')
      await addTimelineEntry('task-1', 'content_edit', { content: 'old' }, { content: 'new' })

      const entries = await getTimelineByTaskId('task-1')
      expect(entries.length).toBe(2)
    })
  })

  describe('getTimelineByTaskId', () => {
    it('should return all timeline entries for a task', async () => {
      await addTimelineEntry('task-1', 'created')
      await addTimelineEntry('task-1', 'content_edit', { content: 'old' }, { content: 'new' })
      await addTimelineEntry('task-1', 'completed')

      const entries = await getTimelineByTaskId('task-1')
      expect(entries.length).toBe(3)
      expect(entries.every(e => e.taskId === 'task-1')).toBe(true)
    })

    it('should return empty array for non-existent taskId', async () => {
      await addTimelineEntry('task-1', 'created')

      const entries = await getTimelineByTaskId('task-2')
      expect(entries).toEqual([])
    })

    it('should return entries sorted by createdAt in descending order', async () => {
      await addTimelineEntry('task-1', 'created')
      await new Promise(resolve => setTimeout(resolve, 10))
      await addTimelineEntry('task-1', 'content_edit')
      await new Promise(resolve => setTimeout(resolve, 10))
      await addTimelineEntry('task-1', 'completed')

      const entries = await getTimelineByTaskId('task-1')
      expect(entries.length).toBe(3)
      expect(new Date(entries[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(entries[1].createdAt).getTime()
      )
      expect(new Date(entries[1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(entries[2].createdAt).getTime()
      )
    })

    it('should only return entries for the specified task', async () => {
      await addTimelineEntry('task-1', 'created')
      await addTimelineEntry('task-2', 'created')
      await addTimelineEntry('task-1', 'completed')

      const entries = await getTimelineByTaskId('task-1')
      expect(entries.length).toBe(2)
      expect(entries.every(e => e.taskId === 'task-1')).toBe(true)
    })
  })

  describe('deleteTimelineByTaskId', () => {
    it('should delete all timeline entries for a task', async () => {
      await addTimelineEntry('task-1', 'created')
      await addTimelineEntry('task-1', 'content_edit')
      await addTimelineEntry('task-2', 'created')

      await deleteTimelineByTaskId('task-1')

      const task1Entries = await getTimelineByTaskId('task-1')
      const task2Entries = await getTimelineByTaskId('task-2')
      expect(task1Entries.length).toBe(0)
      expect(task2Entries.length).toBe(1)
    })

    it('should do nothing for non-existent taskId', async () => {
      await addTimelineEntry('task-1', 'created')

      await deleteTimelineByTaskId('task-2')

      const entries = await getTimelineByTaskId('task-1')
      expect(entries.length).toBe(1)
    })
  })
})
