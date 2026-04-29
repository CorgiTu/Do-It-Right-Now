import { create } from 'zustand'
import type { TodoList } from '../db/types'
import { createList, getAllLists, updateList as dbUpdateList, deleteList, listExists, createDefaultList, createDailyList } from '../db/lists'

interface ListState {
  lists: TodoList[]
  selectedListId: string | 'all'
  loading: boolean
  error: string | null
  addList: (name: string, color: string, icon: string) => Promise<{ success: boolean; error?: string }>
  updateList: (id: string, updates: Partial<TodoList>) => Promise<void>
  removeList: (id: string) => Promise<boolean>
  selectList: (id: string | 'all') => void
  loadLists: () => Promise<void>
  initDefaultList: () => Promise<void>
  initDailyList: () => Promise<void>
  reorderLists: (lists: TodoList[]) => Promise<void>
}

export const useListStore = create<ListState>((set, get) => ({
  lists: [],
  selectedListId: 'all',
  loading: false,
  error: null,

  addList: async (name: string, color: string, icon: string) => {
    console.log('[ListStore] Adding list:', name)
    const trimmedName = name.trim()
    if (!trimmedName) {
      return { success: false, error: '分组名称不能为空' }
    }

    if (await listExists(trimmedName)) {
      return { success: false, error: '分组名称已存在' }
    }

    try {
      const list = await createList({ name: trimmedName, color, icon })
      console.log('[ListStore] List added successfully:', list)
      set((state) => ({
        lists: [...state.lists, list],
      }))
      return { success: true }
    } catch (error) {
      console.error('[ListStore] Failed to add list:', error)
      return { success: false, error: '创建分组失败' }
    }
  },

  updateList: async (id: string, updates: Partial<TodoList>) => {
    try {
      const updatedList = await dbUpdateList(id, updates)
      set((state) => ({
        lists: state.lists.map((l) => (l.id === id ? updatedList : l)),
      }))
    } catch (error) {
      console.error('[ListStore] Failed to update list:', error)
    }
  },

  reorderLists: async (lists: TodoList[]) => {
    const { updateList } = await import('../db/lists')
    for (const list of lists) {
      await updateList(list.id, { order: list.order })
    }
    set({ lists: [...lists] })
  },

  removeList: async (id: string) => {
    const { getTasksByListId } = await import('../db/tasks')
    const tasksInList = await getTasksByListId(id)

    if (tasksInList.length === 0) {
      await deleteList(id)
      set((state) => ({
        lists: state.lists.filter(l => l.id !== id),
        selectedListId: state.selectedListId === id ? 'all' : state.selectedListId,
      }))
      return true
    }

    return false
  },

  selectList: (id: string | 'all') => {
    set({ selectedListId: id })
  },

  loadLists: async () => {
    set({ loading: true, error: null })
    try {
      const lists = await getAllLists()
      set({ lists, loading: false })
    } catch {
      set({ error: 'Failed to load lists', loading: false })
    }
  },

  initDefaultList: async () => {
    const list = await createDefaultList()
    set((state) => {
      const exists = state.lists.some(l => l.id === list.id)
      if (exists) return state
      return { lists: [...state.lists, list] }
    })
  },

  initDailyList: async () => {
    const list = await createDailyList()
    set((state) => {
      const exists = state.lists.some(l => l.id === list.id)
      if (exists) {
        const listIndex = state.lists.findIndex(l => l.id === list.id)
        const updatedLists = [...state.lists]
        updatedLists[listIndex] = list
        return { lists: updatedLists }
      }
      return { lists: [...state.lists, list] }
    })
  },
}))
