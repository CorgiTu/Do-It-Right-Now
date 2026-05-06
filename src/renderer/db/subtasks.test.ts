import { describe, it, expect, beforeEach } from 'vitest'
import { createSubtask, getSubtasksByTaskId, updateSubtask, deleteSubtask, deleteSubtasksByTaskId, getSubtaskStats } from './subtasks'

describe('Subtask Data Layer', () => {
  const TEST_TASK_ID = 'test-task-1'

  beforeEach(async () => {
    localStorage.clear()
  })

  describe('createSubtask', () => {
    it('should create a subtask and return it with all required fields', async () => {
      const subtask = await createSubtask({ taskId: TEST_TASK_ID, content: 'Test subtask' })

      expect(subtask).toBeDefined()
      expect(subtask.id).toBeDefined()
      expect(subtask.taskId).toBe(TEST_TASK_ID)
      expect(subtask.content).toBe('Test subtask')
      expect(subtask.completed).toBe(false)
      expect(subtask.order).toBe(0)
      expect(subtask.createdAt).toBeDefined()
      expect(subtask.updatedAt).toBeDefined()
    })

    it('should create multiple subtasks with incrementing order', async () => {
      const subtask1 = await createSubtask({ taskId: TEST_TASK_ID, content: 'subtask1' })
      const subtask2 = await createSubtask({ taskId: TEST_TASK_ID, content: 'subtask2' })

      expect(subtask2.order).toBeGreaterThan(subtask1.order)
    })
  })

  describe('getSubtasksByTaskId', () => {
    it('should return empty array when no subtasks exist', async () => {
      const subtasks = await getSubtasksByTaskId(TEST_TASK_ID)
      expect(subtasks).toEqual([])
    })

    it('should return subtasks for the given task ID', async () => {
      await createSubtask({ taskId: TEST_TASK_ID, content: 'subtask1' })
      await createSubtask({ taskId: TEST_TASK_ID, content: 'subtask2' })

      const subtasks = await getSubtasksByTaskId(TEST_TASK_ID)
      expect(subtasks).toHaveLength(2)
      expect(subtasks[0].content).toBe('subtask1')
      expect(subtasks[1].content).toBe('subtask2')
    })

    it('should only return subtasks for the specified task ID', async () => {
      await createSubtask({ taskId: TEST_TASK_ID, content: 'task1-subtask' })
      await createSubtask({ taskId: 'other-task', content: 'other-subtask' })

      const subtasks = await getSubtasksByTaskId(TEST_TASK_ID)
      expect(subtasks).toHaveLength(1)
      expect(subtasks[0].content).toBe('task1-subtask')
    })

    it('should return subtasks sorted by order', async () => {
      await createSubtask({ taskId: TEST_TASK_ID, content: 'first' })
      await createSubtask({ taskId: TEST_TASK_ID, content: 'second' })
      await createSubtask({ taskId: TEST_TASK_ID, content: 'third' })

      const subtasks = await getSubtasksByTaskId(TEST_TASK_ID)
      expect(subtasks.map(s => s.content)).toEqual(['first', 'second', 'third'])
    })
  })

  describe('updateSubtask', () => {
    it('should update subtask content', async () => {
      const subtask = await createSubtask({ taskId: TEST_TASK_ID, content: 'original' })
      await new Promise(resolve => setTimeout(resolve, 10))
      const updated = await updateSubtask(subtask.id, { content: 'updated' })

      expect(updated.content).toBe('updated')
      expect(updated.updatedAt).not.toBe(subtask.updatedAt)
    })

    it('should update subtask completed status', async () => {
      const subtask = await createSubtask({ taskId: TEST_TASK_ID, content: 'test' })
      const updated = await updateSubtask(subtask.id, { completed: true })

      expect(updated.completed).toBe(true)
    })

    it('should throw error when subtask not found', async () => {
      await expect(updateSubtask('nonexistent', { content: 'test' })).rejects.toThrow()
    })
  })

  describe('deleteSubtask', () => {
    it('should delete a subtask', async () => {
      const subtask = await createSubtask({ taskId: TEST_TASK_ID, content: 'to delete' })
      await deleteSubtask(subtask.id)

      const subtasks = await getSubtasksByTaskId(TEST_TASK_ID)
      expect(subtasks).toHaveLength(0)
    })
  })

  describe('deleteSubtasksByTaskId', () => {
    it('should delete all subtasks for a task', async () => {
      await createSubtask({ taskId: TEST_TASK_ID, content: 'subtask1' })
      await createSubtask({ taskId: TEST_TASK_ID, content: 'subtask2' })
      await createSubtask({ taskId: 'other-task', content: 'other' })

      await deleteSubtasksByTaskId(TEST_TASK_ID)

      const taskSubtasks = await getSubtasksByTaskId(TEST_TASK_ID)
      const otherSubtasks = await getSubtasksByTaskId('other-task')

      expect(taskSubtasks).toHaveLength(0)
      expect(otherSubtasks).toHaveLength(1)
    })
  })

  describe('getSubtaskStats', () => {
    it('should return correct stats for empty subtasks', async () => {
      const stats = await getSubtaskStats(TEST_TASK_ID)
      expect(stats).toEqual({ total: 0, completed: 0 })
    })

    it('should return correct stats with mixed completion', async () => {
      const s1 = await createSubtask({ taskId: TEST_TASK_ID, content: 'done' })
      await createSubtask({ taskId: TEST_TASK_ID, content: 'pending' })
      const s3 = await createSubtask({ taskId: TEST_TASK_ID, content: 'done2' })

      await updateSubtask(s1.id, { completed: true })
      await updateSubtask(s3.id, { completed: true })

      const stats = await getSubtaskStats(TEST_TASK_ID)
      expect(stats).toEqual({ total: 3, completed: 2 })
    })
  })
})
