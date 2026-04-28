import type { Todo, CreateTodoInput } from './types'
import { generateId } from '../utils/uuid'
import { getAllLists, createDefaultList } from './lists'

const TASKS_KEY = 'todo-app-tasks-v2'

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
    const priorityA = a.priority || 'medium'
    const priorityB = b.priority || 'medium'
    const priorityDiff = priorityOrder[priorityA] - priorityOrder[priorityB]
    if (priorityDiff !== 0) return priorityDiff
    return b.createdAt.localeCompare(a.createdAt)
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
    const priorityA = a.priority || 'medium'
    const priorityB = b.priority || 'medium'
    const priorityDiff = priorityOrder[priorityA] - priorityOrder[priorityB]
    if (priorityDiff !== 0) return priorityDiff
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export async function deleteTasksByListId(listId: string): Promise<void> {
  const tasks = getTasks().filter(t => t.listId !== listId)
  saveTasks(tasks)
}

export const LISTS_STORE_NAME = 'lists'
