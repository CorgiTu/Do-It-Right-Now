import type { TodoList, CreateListInput } from './types'
import { generateId } from '../utils/uuid'
import { initDB, LISTS_STORE_NAME } from './tasks'

export async function createList(input: CreateListInput): Promise<TodoList> {
  const database = await initDB()
  const existingLists = await getAllLists()
  const maxOrder = existingLists.length > 0
    ? Math.max(...existingLists.map(l => l.order))
    : -1

  const list: TodoList = {
    id: generateId(),
    name: input.name,
    color: input.color,
    icon: input.icon,
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  }

  await database.put(LISTS_STORE_NAME, list)
  return list
}

export async function getAllLists(): Promise<TodoList[]> {
  const database = await initDB()
  const lists = await database.getAll(LISTS_STORE_NAME)
  return lists.sort((a, b) => a.order - b.order)
}

export async function getListById(id: string): Promise<TodoList | undefined> {
  const database = await initDB()
  return database.get(LISTS_STORE_NAME, id)
}

export async function updateList(id: string, updates: Partial<TodoList>): Promise<TodoList> {
  const database = await initDB()
  const list = await database.get(LISTS_STORE_NAME, id)

  if (!list) {
    throw new Error(`List with id ${id} not found`)
  }

  const updated: TodoList = {
    ...list,
    ...updates,
  }

  await database.put(LISTS_STORE_NAME, updated)
  return updated
}

export async function deleteList(id: string): Promise<void> {
  const database = await initDB()
  await database.delete(LISTS_STORE_NAME, id)
}

export async function listExists(name: string): Promise<boolean> {
  const lists = await getAllLists()
  return lists.some(l => l.name === name)
}

export async function createDefaultList(): Promise<TodoList> {
  const exists = await listExists('默认分组')
  if (exists) {
    const lists = await getAllLists()
    return lists.find(l => l.name === '默认分组')!
  }

  return createList({
    name: '默认分组',
    color: '#3B82F6',
    icon: 'inbox',
  })
}
