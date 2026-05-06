import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initDB, createTask, getAllTasks, updateTask, deleteTask, deleteTasks } from './tasks'
import type { Todo } from './types'

describe('IndexedDB Data Layer', () => {
  beforeEach(async () => {
    await initDB()
    // Clear all tasks before each test
    const tasks = await getAllTasks()
    for (const task of tasks) {
      await deleteTask(task.id)
    }
  })

  describe('createTask', () => {
    it('should create a task and return it with all required fields', async () => {
      const task = await createTask({ content: 'test' })

      expect(task).toBeDefined()
      expect(task.id).toBeDefined()
      expect(task.content).toBe('test')
      expect(task.completed).toBe(false)
      // listId should be auto-assigned to a real list, not 'default' string
      expect(task.listId).toBeDefined()
      expect(typeof task.listId).toBe('string')
      expect(task.listId).not.toBe('default')
      expect(task.order).toBe(0)
      expect(task.createdAt).toBeDefined()
      expect(task.updatedAt).toBeDefined()
    })

    it('should create multiple tasks with incrementing order', async () => {
      const task1 = await createTask({ content: 'task1' })
      const task2 = await createTask({ content: 'task2' })

      expect(task2.order).toBeGreaterThan(task1.order)
    })
  })

  describe('getAllTasks', () => {
    it('should return empty array initially', async () => {
      const tasks = await getAllTasks()
      expect(tasks).toEqual([])
    })

    it('should return all created tasks', async () => {
      await createTask({ content: 'task1' })
      await createTask({ content: 'task2' })

      const tasks = await getAllTasks()
      expect(tasks).toHaveLength(2)
      expect(tasks.map(t => t.content)).toContain('task1')
      expect(tasks.map(t => t.content)).toContain('task2')
    })

    it('should return tasks sorted by creation time descending', async () => {
      const task1 = await createTask({ content: 'first' })
      await new Promise(r => setTimeout(r, 10))
      const task2 = await createTask({ content: 'second' })

      const tasks = await getAllTasks()
      expect(tasks[0].content).toBe('second')
      expect(tasks[1].content).toBe('first')
    })
  })

  describe('updateTask', () => {
    it('should update task completed status', async () => {
      const task = await createTask({ content: 'test' })
      expect(task.completed).toBe(false)

      const updated = await updateTask(task.id, { completed: true })
      expect(updated.completed).toBe(true)

      // Verify persistence
      const tasks = await getAllTasks()
      expect(tasks.find(t => t.id === task.id)?.completed).toBe(true)
    })

    it('should update task content', async () => {
      const task = await createTask({ content: 'original' })
      await new Promise(r => setTimeout(r, 10))
      const updated = await updateTask(task.id, { content: 'modified' })

      expect(updated.content).toBe('modified')
      expect(updated.updatedAt).not.toBe(task.createdAt)
    })
  })

  describe('deleteTask', () => {
    it('should remove task from database', async () => {
      const task = await createTask({ content: 'to delete' })
      await deleteTask(task.id)

      const tasks = await getAllTasks()
      expect(tasks).toHaveLength(0)
    })

    it('should only delete the specified task', async () => {
      const task1 = await createTask({ content: 'keep' })
      const task2 = await createTask({ content: 'delete' })

      await deleteTask(task2.id)

      const tasks = await getAllTasks()
      expect(tasks).toHaveLength(1)
      expect(tasks[0].content).toBe('keep')
    })
  })

  describe('deleteTasks', () => {
    it('should delete multiple tasks by ids', async () => {
      const task1 = await createTask({ content: 'task 1' })
      const task2 = await createTask({ content: 'task 2' })
      const task3 = await createTask({ content: 'task 3' })

      const deletedCount = await deleteTasks([task1.id, task2.id, task3.id])

      expect(deletedCount).toBe(3)
      const tasks = await getAllTasks()
      expect(tasks).toHaveLength(0)
    })

    it('should return 0 when deleting empty array', async () => {
      const deletedCount = await deleteTasks([])
      expect(deletedCount).toBe(0)
    })

    it('should only delete specified tasks and keep others', async () => {
      const task1 = await createTask({ content: 'keep 1' })
      const task2 = await createTask({ content: 'delete 1' })
      const task3 = await createTask({ content: 'delete 2' })
      const task4 = await createTask({ content: 'keep 2' })

      const deletedCount = await deleteTasks([task2.id, task3.id])

      expect(deletedCount).toBe(2)
      const tasks = await getAllTasks()
      expect(tasks).toHaveLength(2)
      expect(tasks.map(t => t.content)).toContain('keep 1')
      expect(tasks.map(t => t.content)).toContain('keep 2')
    })

    it('should handle non-existent ids gracefully', async () => {
      const task1 = await createTask({ content: 'task 1' })
      await createTask({ content: 'task 2' })

      const deletedCount = await deleteTasks([task1.id, 'non-existent-id'])

      expect(deletedCount).toBe(1)
      const tasks = await getAllTasks()
      expect(tasks).toHaveLength(1)
      expect(tasks[0].content).toBe('task 2')
    })
  })
})
