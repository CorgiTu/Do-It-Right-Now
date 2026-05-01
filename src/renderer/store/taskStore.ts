import { create } from 'zustand'
import type { Todo } from '../db/types'
import { createTask, getAllTasks, updateTask, deleteTask, deleteTasks, markTaskCompletedWithRecurrence, resetRecurringTasksForDailyList, migrateExistingDailyTasks } from '../db/tasks'
import { getDailyList } from '../db/lists'

interface TaskState {
  tasks: Todo[]
  loading: boolean
  error: string | null
  selectedTaskIds: string[]
  tagFilter: string[]
  addTask: (content: string, listId?: string, isRecurring?: boolean) => Promise<void>
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
  initializeDailyTasks: () => Promise<void>
  setTagFilter: (tagIds: string[]) => void
  clearTagFilter: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  selectedTaskIds: [],
  tagFilter: [],

  addTask: async (content: string, listId?: string, isRecurring?: boolean) => {
    console.log('[TaskStore] Adding task:', content, 'to list:', listId, 'isRecurring:', isRecurring)
    try {
      const task = await createTask({ 
        content, 
        listId,
        isRecurring: isRecurring ?? false,
        recurrencePattern: isRecurring ? 'daily' : null,
      })
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
    const task = useTaskStore.getState().tasks.find(t => t.id === id)
    if (!task) return
    
    const newCompleted = !task.completed
    
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { 
              ...task, 
              completed: newCompleted, 
              lastCompletedDate: newCompleted ? new Date().toISOString().split('T')[0] : null,
              updatedAt: new Date().toISOString() 
            }
          : task
      ),
    }))

    await markTaskCompletedWithRecurrence(id, newCompleted)
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
    console.log('[TaskStore.reorderTasks] Updating tasks:', tasksToUpdate)
    
    // First, update the state immediately
    set((state) => {
      // Create a map of task updates
      const updateMap = new Map(tasksToUpdate.map(t => [t.id, t.order]))
      
      const updatedTasks = state.tasks.map(task => {
        const newOrder = updateMap.get(task.id)
        if (newOrder !== undefined) {
          return { ...task, order: newOrder, updatedAt: new Date().toISOString() }
        }
        return task
      })
      
      // Re-sort tasks by order
      const sortedTasks = [...updatedTasks].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        return a.order - b.order
      })
      
      return { tasks: sortedTasks }
    })

    // Then, persist to database
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

  initializeDailyTasks: async () => {
    console.log('[TaskStore.initializeDailyTasks] Starting initialization...')
    try {
      const dailyListId = localStorage.getItem('todo-app-daily-list-id')
      console.log('[TaskStore.initializeDailyTasks] Saved daily list ID:', dailyListId)
      
      let dailyListIdToUse = dailyListId
      
      if (!dailyListIdToUse) {
        const fallbackDailyList = await getDailyList()
        if (fallbackDailyList) {
          dailyListIdToUse = fallbackDailyList.id
          console.log('[TaskStore.initializeDailyTasks] Using fallback Daily list:', dailyListIdToUse)
        }
      }
      
      if (dailyListIdToUse) {
        console.log('[TaskStore.initializeDailyTasks] Migrating existing daily tasks...')
        await migrateExistingDailyTasks(dailyListIdToUse)
        console.log('[TaskStore.initializeDailyTasks] Resetting recurring tasks...')
        resetRecurringTasksForDailyList(dailyListIdToUse)
        console.log('[TaskStore.initializeDailyTasks] Daily tasks initialized for list:', dailyListIdToUse)
      } else {
        console.log('[TaskStore.initializeDailyTasks] No daily list configured')
      }
    } catch (error) {
      console.error('[TaskStore] Failed to initialize daily tasks:', error)
    }
  },

  setTagFilter: (tagIds: string[]) => {
    set({ tagFilter: tagIds })
  },

  clearTagFilter: () => {
    set({ tagFilter: [] })
  },
}))
