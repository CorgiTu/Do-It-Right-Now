import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Todo, CreateTodoInput } from './types'
import { generateId } from '../utils/uuid'

interface TodoDB extends DBSchema {
  todos: {
    key: string
    value: Todo
    indexes: {
      byListId: string
      byCompleted: boolean
      byDueDate: string
    }
  }
  lists: {
    key: string
    value: {
      id: string
      name: string
      color: string
      icon: string
      order: number
      createdAt: string
    }
    indexes: {
      byName: string
    }
  }
}

const DB_NAME = 'todo-app-db'
const DB_VERSION = 2
const STORE_NAME = 'todos'
const LISTS_STORE_NAME = 'lists'

let db: IDBPDatabase<TodoDB> | null = null

export async function initDB(): Promise<IDBPDatabase<TodoDB>> {
  if (db) return db

  db = await openDB<TodoDB>(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion) {
      if (oldVersion! < 1) {
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('byListId', 'listId', { unique: false })
          store.createIndex('byCompleted', 'completed', { unique: false })
          store.createIndex('byDueDate', 'dueDate', { unique: false })
        }
      }
      if (oldVersion! < 2) {
        if (!database.objectStoreNames.contains(LISTS_STORE_NAME)) {
          const store = database.createObjectStore(LISTS_STORE_NAME, { keyPath: 'id' })
          store.createIndex('byName', 'name', { unique: true })
        }
      }
    },
  })

  return db
}

export { LISTS_STORE_NAME }

export async function createTask(input: CreateTodoInput): Promise<Todo> {
  const database = await initDB()
  const existingTasks = await getAllTasks()
  const maxOrder = existingTasks.length > 0
    ? Math.max(...existingTasks.map(t => t.order))
    : -1

  // If no listId specified, find or create default list
  let resolvedListId = input.listId
  if (!resolvedListId) {
    const lists = await database.getAll(LISTS_STORE_NAME)
    const defaultList = lists.find(l => l.name === '默认分组')
    if (defaultList) {
      resolvedListId = defaultList.id
    } else if (lists.length > 0) {
      // Use first available list if no default exists
      resolvedListId = lists[0].id
    } else {
      // Create default list as fallback
      const { createDefaultList } = await import('./lists')
      const newDefaultList = await createDefaultList()
      resolvedListId = newDefaultList.id
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

  await database.put(STORE_NAME, task)
  return task
}

export async function getAllTasks(): Promise<Todo[]> {
  const database = await initDB()
  const tasks = await database.getAll(STORE_NAME)
  return tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export async function updateTask(id: string, updates: Partial<Todo>): Promise<Todo> {
  const database = await initDB()
  const task = await database.get(STORE_NAME, id)

  if (!task) {
    throw new Error(`Task with id ${id} not found`)
  }

  const updated: Todo = {
    ...task,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await database.put(STORE_NAME, updated)
  return updated
}

export async function deleteTask(id: string): Promise<void> {
  const database = await initDB()
  await database.delete(STORE_NAME, id)
}

export async function deleteTasks(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0
  
  const database = await initDB()
  let deletedCount = 0
  
  for (const id of ids) {
    const task = await database.get(STORE_NAME, id)
    if (task) {
      await database.delete(STORE_NAME, id)
      deletedCount++
    }
  }
  
  return deletedCount
}

export async function getTasksByListId(listId: string): Promise<Todo[]> {
  const database = await initDB()
  const tasks = await database.getAllFromIndex(STORE_NAME, 'byListId', listId)
  return tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export async function deleteTasksByListId(listId: string): Promise<void> {
  const database = await initDB()
  const tasks = await getTasksByListId(listId)
  for (const task of tasks) {
    await database.delete(STORE_NAME, task.id)
  }
}
