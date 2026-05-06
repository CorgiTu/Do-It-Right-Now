import type { Todo, CreateTodoInput } from './types'
import { generateId } from '../utils/uuid'
import { getAllLists, createDefaultList } from './lists'
import { calculateNextOccurrenceDate } from '../utils/recurrence'

const TASKS_KEY = 'do-it-right-now-tasks-v2'

function getTasks(): Todo[] {
  try {
    const data = localStorage.getItem(TASKS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[Storage] Failed to read tasks:', error)
    return []
  }
}

function saveTasks(tasks: Todo[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
    console.log('[Storage] Tasks saved, count:', tasks.length)
    console.log('[Storage] Raw data:', localStorage.getItem(TASKS_KEY)?.slice(0, 200))
  } catch (error) {
    console.error('[Storage] Failed to save tasks:', error)
    throw error
  }
}

export async function createTask(input: CreateTodoInput): Promise<Todo> {
  console.log('[tasks.createTask] Starting to create task:', input)
  const existingTasks = getTasks()
  console.log('[tasks.createTask] Existing tasks count:', existingTasks.length)
  
  const maxOrder = existingTasks.length > 0
    ? Math.max(...existingTasks.map(t => t.order))
    : -1

  let resolvedListId = input.listId
  if (!resolvedListId) {
    console.log('[tasks.createTask] No listId, finding default list')
    const lists = await getAllLists()
    console.log('[tasks.createTask] Available lists:', lists)
    
    const defaultList = lists.find(l => l.name === '默认分组')
    if (defaultList) {
      resolvedListId = defaultList.id
      console.log('[tasks.createTask] Found default list:', resolvedListId)
    } else if (lists.length > 0) {
      resolvedListId = lists[0].id
      console.log('[tasks.createTask] Using first available list:', resolvedListId)
    } else {
      console.log('[tasks.createTask] Creating default list')
      const newList = await createDefaultList()
      resolvedListId = newList.id
      console.log('[tasks.createTask] Created default list:', resolvedListId)
    }
  }

  const now = new Date().toISOString()
  const task: Todo = {
    id: generateId(),
    content: input.content,
    completed: input.completed ?? false,
    listId: resolvedListId,
    dueDate: input.dueDate ?? null,
    reminder: input.reminder ?? null,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
    isRecurring: input.isRecurring ?? false,
    recurrencePattern: input.recurrencePattern ?? null,
    lastCompletedDate: input.lastCompletedDate ?? null,
    originalTaskId: input.originalTaskId ?? null,
    autoCompleteOnSubtasksDone: input.autoCompleteOnSubtasksDone ?? false,
    endDate: input.endDate ?? null,
    maxOccurrences: input.maxOccurrences ?? null,
    occurrenceCount: input.occurrenceCount ?? 0,
    exceptionDates: input.exceptionDates ?? [],
    notes: input.notes ?? null,
  }

  console.log('[tasks.createTask] Attempting to save task:', task)
  try {
    saveTasks([...existingTasks, task])
    console.log('[tasks.createTask] Task saved successfully')
  } catch (error) {
    console.error('[tasks.createTask] Failed to save task:', error)
    throw error
  }
  
  return task
}

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }

export async function getAllTasks(): Promise<Todo[]> {
  const tasks = getTasks()
  return tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // Use order field for sorting within the same completion status
    return a.order - b.order
  })
}

export async function updateTask(id: string, updates: Partial<Todo>): Promise<Todo> {
  const tasks = getTasks()
  const taskIndex = tasks.findIndex(t => t.id === id)

  if (taskIndex === -1) {
    throw new Error(`Task with id ${id} not found`)
  }

  const updated: Todo = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  tasks[taskIndex] = updated
  saveTasks(tasks)
  return updated
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = getTasks()
  saveTasks(tasks.filter(t => t.id !== id))
}

export async function deleteTasks(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0
  
  const tasks = getTasks()
  const filteredTasks = tasks.filter(t => !ids.includes(t.id))
  saveTasks(filteredTasks)
  return tasks.length - filteredTasks.length
}

export async function getTasksByListId(listId: string): Promise<Todo[]> {
  const tasks = getTasks().filter(t => t.listId === listId)
  return tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // Use order field for sorting within the same completion status
    return a.order - b.order
  })
}

export async function deleteTasksByListId(listId: string): Promise<void> {
  const tasks = getTasks().filter(t => t.listId !== listId)
  saveTasks(tasks)
}

export const LISTS_STORE_NAME = 'lists'

export function isToday(dateString: string | null): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate()
}

export function resetRecurringTasksForDailyList(listId: string): void {
  const tasks = getTasks()
  const today = new Date().toISOString().split('T')[0]
  
  let hasChanges = false
  const updatedTasks = tasks.map(task => {
    if (task.listId === listId && task.isRecurring && task.completed) {
      if (task.lastCompletedDate && task.lastCompletedDate < today) {
        hasChanges = true
        return {
          ...task,
          completed: false,
          lastCompletedDate: null,
          updatedAt: new Date().toISOString()
        }
      }
    }
    return task
  })
  
  if (hasChanges) {
    saveTasks(updatedTasks)
    console.log('[tasks.resetRecurringTasksForDailyList] Reset recurring tasks for list:', listId)
  }
}

export function markTaskCompletedWithRecurrence(id: string, completed: boolean): Promise<Todo> {
  const tasks = getTasks()
  const taskIndex = tasks.findIndex(t => t.id === id)

  if (taskIndex === -1) {
    throw new Error(`Task with id ${id} not found`)
  }

  const task = tasks[taskIndex]
  const now = new Date().toISOString()
  
  const updated: Todo = {
    ...task,
    completed,
    lastCompletedDate: completed ? now.split('T')[0] : null,
    updatedAt: now,
  }

  tasks[taskIndex] = updated
  saveTasks(tasks)
  return updated
}

export async function migrateExistingDailyTasks(listId: string): Promise<void> {
  const tasks = getTasks()
  let hasChanges = false
  
  const updatedTasks = tasks.map(task => {
    if (task.listId === listId && !task.isRecurring) {
      hasChanges = true
      return {
        ...task,
        isRecurring: true,
        recurrencePattern: 'daily' as const,
      }
    }
    return task
  })
  
  if (hasChanges) {
    saveTasks(updatedTasks)
    console.log('[tasks.migrateExistingDailyTasks] Migrated tasks in list', listId, 'to recurring')
  }
}

export function shouldResetOnCompletion(task: Todo): boolean {
  if (!task.isRecurring) {
    return false
  }

  const today = new Date().toISOString().split('T')[0]

  if (task.endDate && today >= task.endDate) {
    return false
  }

  if (task.maxOccurrences !== null && task.maxOccurrences !== undefined && task.occurrenceCount >= task.maxOccurrences) {
    return false
  }

  if (task.exceptionDates && task.exceptionDates.includes(today)) {
    return false
  }

  return true
}

export function resetTaskForNextOccurrence(task: Todo): Todo {
  const nextDueDate = task.dueDate
    ? calculateNextOccurrenceDate(task.dueDate, {
        pattern: task.recurrencePattern,
        interval: 1,
      })
    : null

  return {
    ...task,
    id: generateId(),
    originalTaskId: task.originalTaskId || task.id,
    completed: false,
    dueDate: nextDueDate,
    occurrenceCount: 0,
    lastCompletedDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
