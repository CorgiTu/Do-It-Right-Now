import type { Tag, TaskTag } from './types'
import { generateId } from '../utils/uuid'
import { DEFAULT_TAG_COLOR, TAG_COLORS } from './types'

<<<<<<< HEAD
const TAGS_KEY = 'do-it-right-now-tags'
const TASK_TAGS_KEY = 'do-it-right-now-task-tags'
=======
const TAGS_KEY = 'todo-app-tags'
const TASK_TAGS_KEY = 'todo-app-task-tags'
>>>>>>> c8da83c05226073247d160e91e3e7c9a773d138f

function getTags(): Tag[] {
  try {
    const data = localStorage.getItem(TAGS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[Storage] Failed to read tags:', error)
    return []
  }
}

function saveTags(tags: Tag[]): void {
  try {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags))
  } catch (error) {
    console.error('[Storage] Failed to save tags:', error)
    throw error
  }
}

function getTaskTags(): TaskTag[] {
  try {
    const data = localStorage.getItem(TASK_TAGS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[Storage] Failed to read task tags:', error)
    return []
  }
}

function saveTaskTags(taskTags: TaskTag[]): void {
  try {
    localStorage.setItem(TASK_TAGS_KEY, JSON.stringify(taskTags))
  } catch (error) {
    console.error('[Storage] Failed to save task tags:', error)
    throw error
  }
}

export interface CreateTagInput {
  name: string
  color?: string
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  if (!input.name.trim()) {
    throw new Error('Tag name cannot be empty')
  }

  if (input.name.length > 20) {
    throw new Error('Tag name cannot exceed 20 characters')
  }

  const existingTags = getTags()
  const nameExists = existingTags.some(
    (t) => t.name.toLowerCase() === input.name.toLowerCase()
  )

  if (nameExists) {
    throw new Error(`Tag with name "${input.name}" already exists`)
  }

  const tag: Tag = {
    id: generateId(),
    name: input.name,
    color: input.color || DEFAULT_TAG_COLOR,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  }

  saveTags([...existingTags, tag])
  return tag
}

export async function getAllTags(): Promise<Tag[]> {
  const tags = getTags()
  return tags.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function getTagById(id: string): Promise<Tag | undefined> {
  const tags = getTags()
  return tags.find((t) => t.id === id)
}

export async function updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
  const tags = getTags()
  const tagIndex = tags.findIndex((t) => t.id === id)

  if (tagIndex === -1) {
    throw new Error(`Tag with id ${id} not found`)
  }

  if (updates.name !== undefined) {
    if (!updates.name.trim()) {
      throw new Error('Tag name cannot be empty')
    }

    const nameExists = tags.some(
      (t) => t.id !== id && t.name.toLowerCase() === updates.name!.toLowerCase()
    )

    if (nameExists) {
      throw new Error(`Tag with name "${updates.name}" already exists`)
    }
  }

  const updated: Tag = {
    ...tags[tagIndex],
    ...updates,
  }

  tags[tagIndex] = updated
  saveTags(tags)
  return updated
}

export async function deleteTag(id: string): Promise<void> {
  const tags = getTags()
  saveTags(tags.filter((t) => t.id !== id))

  await deleteAllTaskTags(id)
}

export async function tagExists(name: string): Promise<boolean> {
  const tags = getTags()
  return tags.some((t) => t.name.toLowerCase() === name.toLowerCase())
}

export async function addTagToTask(taskId: string, tagId: string): Promise<TaskTag> {
  const taskTags = getTaskTags()

  const alreadyExists = taskTags.some(
    (tt) => tt.taskId === taskId && tt.tagId === tagId
  )

  if (alreadyExists) {
    return taskTags.find((tt) => tt.taskId === taskId && tt.tagId === tagId)!
  }

  const taskTag: TaskTag = {
    id: generateId(),
    taskId,
    tagId,
    createdAt: new Date().toISOString(),
  }

  saveTaskTags([...taskTags, taskTag])

  const tags = getTags()
  const tagIndex = tags.findIndex((t) => t.id === tagId)
  if (tagIndex !== -1) {
    tags[tagIndex].usageCount = (tags[tagIndex].usageCount || 0) + 1
    saveTags(tags)
  }

  return taskTag
}

export async function removeTagFromTask(taskId: string, tagId: string): Promise<void> {
  const taskTags = getTaskTags()
  const filtered = taskTags.filter(
    (tt) => !(tt.taskId === taskId && tt.tagId === tagId)
  )
  saveTaskTags(filtered)

  const tags = getTags()
  const tagIndex = tags.findIndex((t) => t.id === tagId)
  if (tagIndex !== -1) {
    tags[tagIndex].usageCount = Math.max(0, (tags[tagIndex].usageCount || 0) - 1)
    saveTags(tags)
  }
}

export async function getTagsByTaskId(taskId: string): Promise<TaskTag[]> {
  return getTaskTags().filter((tt) => tt.taskId === taskId)
}

export async function getTasksByTagId(tagId: string): Promise<string[]> {
  return getTaskTags()
    .filter((tt) => tt.tagId === tagId)
    .map((tt) => tt.taskId)
}

export async function deleteAllTaskTags(tagId: string): Promise<void> {
  const taskTags = getTaskTags()
  saveTaskTags(taskTags.filter((tt) => tt.tagId !== tagId))
}
