import { create } from 'zustand'
import type { Subtask } from '../db/types'
import { createSubtask, getSubtasksByTaskId, updateSubtask, deleteSubtask, deleteSubtasksByTaskId } from '../db/subtasks'

interface SubtaskState {
  subtaskMap: Record<string, Subtask[]>
  loadSubtasks: (taskId: string) => Promise<void>
  addSubtask: (taskId: string, content: string) => Promise<void>
  toggleSubtask: (subtaskId: string, taskId: string) => Promise<void>
  updateSubtaskContent: (subtaskId: string, content: string) => Promise<void>
  deleteSubtask: (subtaskId: string, taskId: string) => Promise<void>
  reorderSubtasks: (taskId: string, subtasks: Subtask[]) => Promise<void>
  deleteAllSubtasksForTask: (taskId: string) => Promise<void>
  getSubtaskStats: (taskId: string) => { total: number; completed: number }
}

export const useSubtaskStore = create<SubtaskState>((set, get) => ({
  subtaskMap: {},

  loadSubtasks: async (taskId: string) => {
    const subtasks = await getSubtasksByTaskId(taskId)
    set((state) => ({
      subtaskMap: { ...state.subtaskMap, [taskId]: subtasks },
    }))
  },

  addSubtask: async (taskId: string, content: string) => {
    const subtask = await createSubtask({ taskId, content })
    set((state) => {
      const existing = state.subtaskMap[taskId] || []
      return {
        subtaskMap: { ...state.subtaskMap, [taskId]: [...existing, subtask] },
      }
    })
  },

  toggleSubtask: async (subtaskId: string, taskId: string) => {
    const state = get()
    const subtasks = state.subtaskMap[taskId] || []
    const subtask = subtasks.find(s => s.id === subtaskId)
    if (!subtask) return

    const newCompleted = !subtask.completed

    set((s) => ({
      subtaskMap: {
        ...s.subtaskMap,
        [taskId]: s.subtaskMap[taskId]?.map((st) =>
          st.id === subtaskId ? { ...st, completed: newCompleted, updatedAt: new Date().toISOString() } : st
        ) || [],
      },
    }))

    await updateSubtask(subtaskId, { completed: newCompleted })
  },

  updateSubtaskContent: async (subtaskId: string, content: string) => {
    await updateSubtask(subtaskId, { content })
    set((state) => ({
      subtaskMap: Object.fromEntries(
        Object.entries(state.subtaskMap).map(([taskId, subtasks]) => [
          taskId,
          subtasks.map((st) =>
            st.id === subtaskId ? { ...st, content, updatedAt: new Date().toISOString() } : st
          ),
        ])
      ),
    }))
  },

  deleteSubtask: async (subtaskId: string, taskId: string) => {
    await deleteSubtask(subtaskId)
    set((state) => ({
      subtaskMap: {
        ...state.subtaskMap,
        [taskId]: state.subtaskMap[taskId]?.filter(s => s.id !== subtaskId) || [],
      },
    }))
  },

  reorderSubtasks: async (taskId: string, subtasksToUpdate: Subtask[]) => {
    set((state) => ({
      subtaskMap: {
        ...state.subtaskMap,
        [taskId]: subtasksToUpdate,
      },
    }))

    for (const subtask of subtasksToUpdate) {
      await updateSubtask(subtask.id, { order: subtask.order })
    }
  },

  deleteAllSubtasksForTask: async (taskId: string) => {
    await deleteSubtasksByTaskId(taskId)
    set((state) => {
      const newMap = { ...state.subtaskMap }
      delete newMap[taskId]
      return { subtaskMap: newMap }
    })
  },

  getSubtaskStats: (taskId: string) => {
    const subtasks = get().subtaskMap[taskId] || []
    return {
      total: subtasks.length,
      completed: subtasks.filter(s => s.completed).length,
    }
  },
}))
