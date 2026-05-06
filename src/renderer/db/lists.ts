import type { TodoList, CreateListInput } from './types'
import { generateId } from '../utils/uuid'

<<<<<<< HEAD
const LISTS_KEY = 'do-it-right-now-data'
=======
const LISTS_KEY = 'todo-app-data'
>>>>>>> c8da83c05226073247d160e91e3e7c9a773d138f

function getLists(): TodoList[] {
  try {
    const data = localStorage.getItem(LISTS_KEY)
    console.log('[Storage] getLists - raw data length:', data?.length || 0)
    const lists = data ? JSON.parse(data) : []
    console.log('[Storage] getLists - parsed lists count:', lists.length)
    return lists
  } catch (error) {
    console.error('[Storage] Failed to read lists:', error)
    return []
  }
}

function saveLists(lists: TodoList[]): void {
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
    console.log('[Storage] Lists saved, count:', lists.length)
    console.log('[Storage] Raw data:', localStorage.getItem(LISTS_KEY)?.slice(0, 200))
  } catch (error) {
    console.error('[Storage] Failed to save lists:', error)
    throw error
  }
}

export async function createList(input: CreateListInput): Promise<TodoList> {
  const existingLists = getLists()
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

  saveLists([...existingLists, list])
  return list
}

export async function getAllLists(): Promise<TodoList[]> {
  const lists = getLists()
  return lists.sort((a, b) => a.order - b.order)
}

export async function getListById(id: string): Promise<TodoList | undefined> {
  const lists = getLists()
  return lists.find(l => l.id === id)
}

export async function updateList(id: string, updates: Partial<TodoList>): Promise<TodoList> {
  const lists = getLists()
  const listIndex = lists.findIndex(l => l.id === id)

  if (listIndex === -1) {
    throw new Error(`List with id ${id} not found`)
  }

  const updated: TodoList = {
    ...lists[listIndex],
    ...updates,
  }

  lists[listIndex] = updated
  saveLists(lists)
  return updated
}

export async function deleteList(id: string): Promise<void> {
  const lists = getLists()
  saveLists(lists.filter(l => l.id !== id))
}

export async function listExists(name: string): Promise<boolean> {
  const lists = getLists()
  return lists.some(l => l.name === name)
}

export async function createDefaultList(): Promise<TodoList> {
  const exists = await listExists('默认分组')
  if (exists) {
    const lists = getLists()
    return lists.find(l => l.name === '默认分组')!
  }

  return createList({
    name: '默认分组',
    color: '#3B82F6',
    icon: 'inbox',
  })
}

export async function createDailyList(): Promise<TodoList> {
  const exists = await listExists('Daily')
  if (exists) {
    const lists = getLists()
    const dailyList = lists.find(l => l.name === 'Daily')
    if (dailyList && !dailyList.isDailyList) {
      await updateList(dailyList.id, { isDailyList: true })
      return { ...dailyList, isDailyList: true }
    }
    return dailyList!
  }

  return createList({
    name: 'Daily',
    color: '#10B981',
    icon: 'repeat',
    isDailyList: true,
  })
}

export async function getDailyList(): Promise<TodoList | undefined> {
  const lists = getLists()
  return lists.find(l => l.name === 'Daily' && l.isDailyList)
}
