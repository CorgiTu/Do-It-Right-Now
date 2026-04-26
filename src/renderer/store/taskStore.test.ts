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

  describe('task selection management', () => {
    beforeEach(() => {
      useTaskStore.setState({
        selectedTaskIds: [],
        selectedCount: 0,
      })
    })

    describe('selectedTaskIds', () => {
      it('should initialize as empty array', () => {
        const { selectedTaskIds } = useTaskStore.getState()
        expect(selectedTaskIds).toEqual([])
      })
    })

    describe('toggleTaskSelection', () => {
      it('should add task id when toggling an unselected task', async () => {
        const { toggleTaskSelection } = useTaskStore.getState()
        await toggleTaskSelection('id1')
        const { selectedTaskIds } = useTaskStore.getState()
        expect(selectedTaskIds).toContain('id1')
      })

      it('should remove task id when toggling a selected task', async () => {
        const { toggleTaskSelection } = useTaskStore.getState()
        await toggleTaskSelection('id1')
        await toggleTaskSelection('id1')
        const { selectedTaskIds } = useTaskStore.getState()
        expect(selectedTaskIds).not.toContain('id1')
      })

      it('should handle multiple task selections', async () => {
        const { toggleTaskSelection } = useTaskStore.getState()
        await toggleTaskSelection('id2')
        await toggleTaskSelection('id3')
        const { selectedTaskIds } = useTaskStore.getState()
        expect(selectedTaskIds).toContain('id2')
        expect(selectedTaskIds).toContain('id3')
        expect(selectedTaskIds).toHaveLength(2)
      })
    })

    describe('clearSelection', () => {
      it('should clear all selected task ids', async () => {
        const { toggleTaskSelection, clearSelection } = useTaskStore.getState()
        await toggleTaskSelection('id1')
        await toggleTaskSelection('id2')
        await clearSelection()
        const { selectedTaskIds } = useTaskStore.getState()
        expect(selectedTaskIds).toEqual([])
      })
    })

    describe('selectedCount', () => {
      it('should return the count of selected tasks', async () => {
        const { toggleTaskSelection } = useTaskStore.getState()
        await toggleTaskSelection('id1')
        await toggleTaskSelection('id2')
        await toggleTaskSelection('id3')
        const state = useTaskStore.getState()
        expect(state.selectedCount).toBe(3)
      })

      it('should return 0 when no tasks are selected', () => {
        const state = useTaskStore.getState()
        expect(state.selectedCount).toBe(0)
      })
    })

    describe('deleteSelectedTasks', () => {
      it('should delete all selected tasks from store and database', async () => {
        const { addTask, toggleTaskSelection, deleteSelectedTasks } = useTaskStore.getState()
        await addTask('task 1')
        await addTask('task 2')
        await addTask('task 3')

        const { tasks } = useTaskStore.getState()
        const [task1, task2, task3] = tasks

        await toggleTaskSelection(task1.id)
        await toggleTaskSelection(task2.id)
        await toggleTaskSelection(task3.id)

        await deleteSelectedTasks()

        const remainingTasks = useTaskStore.getState().tasks
        expect(remainingTasks).toHaveLength(0)
        const { selectedTaskIds } = useTaskStore.getState()
        expect(selectedTaskIds).toEqual([])
      })
    })
  })
})
