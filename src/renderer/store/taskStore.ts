import { create } from 'zustand'
import type { Todo } from '../db/types'
import { createTask, getAllTasks, updateTask, deleteTask as deleteTaskFromDb, deleteTasks, markTaskCompletedWithRecurrence, resetRecurringTasksForDailyList, migrateExistingDailyTasks, shouldResetOnCompletion, resetTaskForNextOccurrence } from '../db/tasks'
import { getDailyList } from '../db/lists'
import { addTimelineEntry, deleteTimelineByTaskId } from '../db/timeline'

interface TaskState {
  tasks: Todo[]
  loading: boolean
  error: string | null
  selectedTaskIds: string[]
  tagFilter: string[]
  selectedTaskId: string | null
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
  selectTask: (id: string) => Promise<void>
  deselectTask: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  selectedTaskIds: [],
  tagFilter: [],
  selectedTaskId: null,

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
      await addTimelineEntry(task.id, 'created')
    } catch (error) {
      console.error('[TaskStore] Failed to add task:', error)
      throw error
    }
  },

  toggleTask: async (id: string) => {
    const task = useTaskStore.getState().tasks.find(t => t.id === id)
    if (!task) return
    
    const wasCompleted = task.completed
    
    if (shouldResetOnCompletion(task)) {
      const resetTask = resetTaskForNextOccurrence(task)
      
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? resetTask : t
        ),
      }))

      await updateTask(id, resetTask)
    } else {
      const newCompleted = !task.completed
      
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id
            ? { 
                ...t, 
                completed: newCompleted, 
                lastCompletedDate: newCompleted ? new Date().toISOString().split('T')[0] : null,
                updatedAt: new Date().toISOString() 
              }
            : t
        ),
      }))

      await markTaskCompletedWithRecurrence(id, newCompleted)
    }
    
    const newTaskState = useTaskStore.getState().tasks.find(t => t.id === id)
    if (newTaskState) {
      if (newTaskState.completed && !wasCompleted) {
        await addTimelineEntry(id, 'completed')
      } else if (!newTaskState.completed && wasCompleted) {
        await addTimelineEntry(id, 'uncompleted')
      }
    }
  },

  updateTaskContent: async (id: string, updates: Partial<Todo>) => {
    const task = useTaskStore.getState().tasks.find(t => t.id === id)
    if (!task) return
    
    const beforeValue: Record<string, any> = {}
    const afterValue: Record<string, any> = {}
    let hasActualChange = false
    
    if (updates.content !== undefined && updates.content !== task.content) {
      beforeValue.content = task.content
      afterValue.content = updates.content
      hasActualChange = true
    }
    if (updates.dueDate !== undefined && updates.dueDate !== task.dueDate) {
      beforeValue.dueDate = task.dueDate
      afterValue.dueDate = updates.dueDate
      hasActualChange = true
    }
    if (updates.reminder !== undefined && updates.reminder !== task.reminder) {
      beforeValue.reminder = task.reminder
      afterValue.reminder = updates.reminder
      hasActualChange = true
    }
    if (updates.notes !== undefined && updates.notes !== task.notes) {
      beforeValue.notes = task.notes
      afterValue.notes = updates.notes
      hasActualChange = true
    }
    
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      ),
    }))

    await updateTask(id, updates)
    
    if (!hasActualChange) return
    
    if (updates.content !== undefined && beforeValue.content !== undefined) {
      await addTimelineEntry(id, 'content_edit', beforeValue, afterValue)
    } else if ((updates.dueDate !== undefined || updates.reminder !== undefined) && 
               (beforeValue.dueDate !== undefined || beforeValue.reminder !== undefined)) {
      await addTimelineEntry(id, updates.dueDate !== undefined ? 'due_date_changed' : 'reminder_changed', beforeValue, afterValue)
    } else if (updates.notes !== undefined && beforeValue.notes !== undefined) {
      await addTimelineEntry(id, 'notes_changed', beforeValue, afterValue)
    }
  },

  deleteTask: async (id: string) => {
    await addTimelineEntry(id, 'deleted')
    await deleteTimelineByTaskId(id)
    
    await deleteTaskFromDb(id)

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
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
      const dailyListId = localStorage.getItem('do-it-right-now-daily-list-id')
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

  selectTask: async (id: string) => {
    const currentState = get()
    if (currentState.selectedTaskId === id) {
      return
    }
    set({ selectedTaskId: id })
  },

  deselectTask: () => {
    set({ selectedTaskId: null })
  },
}))
