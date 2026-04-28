import { create } from 'zustand'
import type { Todo } from '../db/types'
import { createTask, getAllTasks, updateTask, deleteTask, deleteTasks } from '../db/tasks'

interface TaskState {
  tasks: Todo[]
  loading: boolean
  error: string | null
  selectedTaskIds: string[]
  addTask: (content: string, listId?: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  updateTaskContent: (id: string, updates: Partial<Todo>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  loadTasks: () => Promise<void>
  reorderTasks: (tasksToUpdate: Todo[]) => Promise<void>
  moveTaskToList: (taskId: string, listId: string) => Promise<void>
  toggleTaskSelection: (id: string) => Promise<void>
  clearSelection: () => void
  deleteSelectedTasks: () => Promise<void>
  selectedCount: number
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  selectedTaskIds: [],

  addTask: async (content: string, listId?: string) => {
    console.log('[TaskStore] Adding task:', content, 'to list:', listId)
    try {
      const task = await createTask({ content, listId })
      console.log('[TaskStore] Task added successfully:', task)
      set((state) => ({
        tasks: [...state.tasks, task],
      }))
    } catch (error) {
      console.error('[TaskStore] Failed to add task:', error)
      throw error
    }
  },

  toggleTask: async (id: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
          : task
      ),
    }))

    const task = useTaskStore.getState().tasks.find(t => t.id === id)
    if (task) {
      await updateTask(id, { completed: task.completed })
    }
  },

  updateTaskContent: async (id: string, updates: Partial<Todo>) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
    }))

    await updateTask(id, updates)
  },

  deleteTask: async (id: string) => {
    await deleteTask(id)
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }))
  },

  loadTasks: async () => {
    set({ loading: true, error: null })
    try {
      const tasks = await getAllTasks()
      set({ tasks, loading: false })
    } catch (err) {
      set({ error: 'Failed to load tasks', loading: false })
    }
  },

  reorderTasks: async (tasksToUpdate: Todo[]) => {
    set((state) => {
      const updatedTasks = state.tasks.map(task => {
        const updated = tasksToUpdate.find(t => t.id === task.id)
        return updated ? { ...updated } : task
      })
      return { tasks: updatedTasks }
    })

    for (const task of tasksToUpdate) {
      await updateTask(task.id, { order: task.order })
    }
  },

  moveTaskToList: async (taskId: string, listId: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, listId, updatedAt: new Date().toISOString() }
          : task
      ),
    }))

    await updateTask(taskId, { listId })
  },

  toggleTaskSelection: async (id: string) => {
    set((state) => {
      const isSelected = state.selectedTaskIds.includes(id)
      const newSelectedTaskIds = isSelected
        ? state.selectedTaskIds.filter(taskId => taskId !== id)
        : [...state.selectedTaskIds, id]
      return {
        selectedTaskIds: newSelectedTaskIds,
        selectedCount: newSelectedTaskIds.length,
      }
    })
  },

  clearSelection: () => {
    set({ selectedTaskIds: [], selectedCount: 0 })
  },

  deleteSelectedTasks: async () => {
    const state = get()
    if (state.selectedTaskIds.length === 0) return
    
    await deleteTasks(state.selectedTaskIds)
    
    set((prevState) => ({
      tasks: prevState.tasks.filter(task => !state.selectedTaskIds.includes(task.id)),
      selectedTaskIds: [],
      selectedCount: 0,
    }))
  },

  selectedCount: 0,
}))
