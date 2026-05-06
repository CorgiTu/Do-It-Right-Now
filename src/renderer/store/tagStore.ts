import { create } from 'zustand'
import type { Tag } from '../db/types'
import {
  createTag as dbCreateTag,
  getAllTags,
  updateTag as dbUpdateTag,
  deleteTag as dbDeleteTag,
  tagExists as dbTagExists,
  addTagToTask as dbAddTagToTask,
  removeTagFromTask as dbRemoveTagFromTask,
  getTagsByTaskId as dbGetTagsByTaskId,
} from '../db/tags'
import { DEFAULT_TAG_COLOR } from '../db/types'
<<<<<<< HEAD
import { addTimelineEntry } from '../db/timeline'
=======
>>>>>>> c8da83c05226073247d160e91e3e7c9a773d138f

interface TagState {
  tags: Tag[]
  taskTagMap: Record<string, string[]>
  selectedTagIds: string[]

  createTag: (name: string, color?: string) => Promise<{ success: boolean; error?: string }>
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>
  deleteTag: (id: string) => Promise<void>

  addTagToTask: (taskId: string, tagId: string) => Promise<void>
  removeTagFromTask: (taskId: string, tagId: string) => Promise<void>
  getTaskTags: (taskId: string) => string[]

  selectTag: (tagId: string) => void
  deselectTag: (tagId: string) => void
  clearTagFilter: () => void

  loadTags: () => Promise<void>
  loadTaskTags: (taskId: string) => Promise<void>
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  taskTagMap: {},
  selectedTagIds: [],

  createTag: async (name: string, color?: string) => {
    const trimmed = name.trim()
    if (!trimmed) {
      return { success: false, error: '标签名称不能为空' }
    }

    const exists = await dbTagExists(trimmed)
    if (exists) {
      return { success: false, error: '标签名称已存在' }
    }

    const tag = await dbCreateTag({ name: trimmed, color: color || DEFAULT_TAG_COLOR })

    set((state) => ({
      tags: [...state.tags, tag],
    }))

    return { success: true }
  },

  updateTag: async (id: string, updates: Partial<Tag>) => {
    const updated = await dbUpdateTag(id, updates)

    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id ? { ...tag, ...updates } : tag
      ),
    }))

    return updated
  },

  deleteTag: async (id: string) => {
    await dbDeleteTag(id)

    set((state) => {
      const newTaskTagMap = { ...state.taskTagMap }
      Object.keys(newTaskTagMap).forEach((taskId) => {
        newTaskTagMap[taskId] = newTaskTagMap[taskId].filter((tagId) => tagId !== id)
      })

      return {
        tags: state.tags.filter((tag) => tag.id !== id),
        taskTagMap: newTaskTagMap,
        selectedTagIds: state.selectedTagIds.filter((tagId) => tagId !== id),
      }
    })
  },

  addTagToTask: async (taskId: string, tagId: string) => {
    await dbAddTagToTask(taskId, tagId)

    set((state) => {
      const currentTags = state.taskTagMap[taskId] || []
      if (currentTags.includes(tagId)) return state

      return {
        taskTagMap: {
          ...state.taskTagMap,
          [taskId]: [...currentTags, tagId],
        },
      }
    })

    const tags = get().tags
    const tagIndex = tags.findIndex((t) => t.id === tagId)
    if (tagIndex !== -1) {
      set((state) => ({
        tags: state.tags.map((tag, index) =>
          index === tagIndex ? { ...tag, usageCount: (tag.usageCount || 0) + 1 } : tag
        ),
      }))
    }
  },

  removeTagFromTask: async (taskId: string, tagId: string) => {
    await dbRemoveTagFromTask(taskId, tagId)

    set((state) => ({
      taskTagMap: {
        ...state.taskTagMap,
        [taskId]: (state.taskTagMap[taskId] || []).filter((id) => id !== tagId),
      },
    }))

    const tags = get().tags
    const tagIndex = tags.findIndex((t) => t.id === tagId)
    if (tagIndex !== -1) {
      set((state) => ({
        tags: state.tags.map((tag, index) =>
          index === tagIndex ? { ...tag, usageCount: Math.max(0, (tag.usageCount || 0) - 1) } : tag
        ),
      }))
    }
  },

  getTaskTags: (taskId: string) => {
    return get().taskTagMap[taskId] || []
  },

  selectTag: (tagId: string) => {
    set((state) => {
      const isSelected = state.selectedTagIds.includes(tagId)
      if (isSelected) {
        return {
          selectedTagIds: state.selectedTagIds.filter((id) => id !== tagId),
        }
      } else {
        return {
          selectedTagIds: [...state.selectedTagIds, tagId],
        }
      }
    })
  },

  deselectTag: (tagId: string) => {
    set((state) => ({
      selectedTagIds: state.selectedTagIds.filter((id) => id !== tagId),
    }))
  },

  clearTagFilter: () => {
    set({ selectedTagIds: [] })
  },

  loadTags: async () => {
    const tags = await getAllTags()
    set({ tags })
  },

  loadTaskTags: async (taskId: string) => {
    const taskTags = await dbGetTagsByTaskId(taskId)
    const tagIds = taskTags.map((tt) => tt.tagId)

    set((state) => ({
      taskTagMap: {
        ...state.taskTagMap,
        [taskId]: tagIds,
      },
    }))
  },
}))
