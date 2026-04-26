import { describe, it, expect, beforeEach } from 'vitest'
import { useTaskStore } from './taskStore'

describe('taskStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useTaskStore.setState({
      tasks: [],
      loading: false,
      error: null,
    })
  })

  describe('initial state', () => {
    it('should have empty tasks array initially', () => {
      const { tasks } = useTaskStore.getState()
      expect(tasks).toEqual([])
    })

    it('should have loading false initially', () => {
      const { loading } = useTaskStore.getState()
      expect(loading).toBe(false)
    })
  })

  describe('addTask', () => {
    it('should add a task to the store', async () => {
      const { addTask } = useTaskStore.getState()
      await addTask('test task')

      const { tasks } = useTaskStore.getState()
      expect(tasks).toHaveLength(1)
      expect(tasks[0].content).toBe('test task')
      expect(tasks[0].completed).toBe(false)
    })

    it('should add multiple tasks', async () => {
      const { addTask } = useTaskStore.getState()
      await addTask('task 1')
      await addTask('task 2')
      await addTask('task 3')

      const { tasks } = useTaskStore.getState()
      expect(tasks).toHaveLength(3)
    })
  })

  describe('toggleTask', () => {
    it('should flip task completed status', async () => {
      const { addTask, toggleTask } = useTaskStore.getState()
      await addTask('test')

      const { tasks } = useTaskStore.getState()
      const taskId = tasks[0].id
      expect(tasks[0].completed).toBe(false)

      await toggleTask(taskId)
      const updatedTasks = useTaskStore.getState().tasks
      expect(updatedTasks.find(t => t.id === taskId)?.completed).toBe(true)

      await toggleTask(taskId)
      const revertedTasks = useTaskStore.getState().tasks
      expect(revertedTasks.find(t => t.id === taskId)?.completed).toBe(false)
    })
  })

  describe('updateTask', () => {
    it('should update task content', async () => {
      const { addTask, updateTaskContent } = useTaskStore.getState()
      await addTask('original')

      const { tasks } = useTaskStore.getState()
      const taskId = tasks[0].id

      await updateTaskContent(taskId, { content: 'updated' })
      const updatedTasks = useTaskStore.getState().tasks
      expect(updatedTasks.find(t => t.id === taskId)?.content).toBe('updated')
    })
  })

  describe('deleteTask', () => {
    it('should remove task from store', async () => {
      const { addTask, deleteTask } = useTaskStore.getState()
      await addTask('to delete')

      const { tasks } = useTaskStore.getState()
      expect(tasks).toHaveLength(1)

      await deleteTask(tasks[0].id)
      const updatedTasks = useTaskStore.getState().tasks
      expect(updatedTasks).toHaveLength(0)
    })
  })
})
