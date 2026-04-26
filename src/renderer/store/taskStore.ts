import { create } from 'zustand'
import type { Todo } from '../db/types'
import { createTask, getAllTasks, updateTask, deleteTask } from '../db/tasks'

interface TaskState {
  tasks: Todo[]
  loading: boolean
  error: string | null
  addTask: (content: string, listId?: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  updateTaskContent: (id: string, updates: Partial<Todo>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  loadTasks: () => Promise<void>
  reorderTasks: (tasksToUpdate: Todo[]) => Promise<void>
  moveTaskToList: (taskId: string, listId: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  addTask: async (content: string, listId?: string) => {
    const task = await createTask({ content, listId })
    set((state) => ({
      tasks: [...state.tasks, task],
    }))
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
}))
