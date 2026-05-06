import type { Subtask, CreateSubtaskInput } from './types'
import { generateId } from '../utils/uuid'

const SUBTASKS_KEY = 'do-it-right-now-subtasks-v1'

function getSubtasks(): Subtask[] {
  try {
    const data = localStorage.getItem(SUBTASKS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[Storage] Failed to read subtasks:', error)
    return []
  }
}

function saveSubtasks(subtasks: Subtask[]): void {
  try {
    localStorage.setItem(SUBTASKS_KEY, JSON.stringify(subtasks))
  } catch (error) {
    console.error('[Storage] Failed to save subtasks:', error)
    throw error
  }
}

export async function createSubtask(input: CreateSubtaskInput): Promise<Subtask> {
  const existingSubtasks = getSubtasks()
  const maxOrder = existingSubtasks.length > 0
    ? Math.max(...existingSubtasks.filter(s => s.taskId === input.taskId).map(s => s.order))
    : -1

  const now = new Date().toISOString()
  const subtask: Subtask = {
    id: generateId(),
    taskId: input.taskId,
    content: input.content,
    completed: false,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  }

  saveSubtasks([...existingSubtasks, subtask])
  return subtask
}

export async function getSubtasksByTaskId(taskId: string): Promise<Subtask[]> {
  const subtasks = getSubtasks().filter(s => s.taskId === taskId)
  return subtasks.sort((a, b) => a.order - b.order)
}

export async function updateSubtask(id: string, updates: Partial<Subtask>): Promise<Subtask> {
  const subtasks = getSubtasks()
  const subtaskIndex = subtasks.findIndex(s => s.id === id)

  if (subtaskIndex === -1) {
    throw new Error(`Subtask with id ${id} not found`)
  }

  const updated: Subtask = {
    ...subtasks[subtaskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  subtasks[subtaskIndex] = updated
  saveSubtasks(subtasks)
  return updated
}

export async function deleteSubtask(id: string): Promise<void> {
  const subtasks = getSubtasks()
  saveSubtasks(subtasks.filter(s => s.id !== id))
}

export async function deleteSubtasksByTaskId(taskId: string): Promise<void> {
  const subtasks = getSubtasks()
  saveSubtasks(subtasks.filter(s => s.taskId !== taskId))
}

export async function getSubtaskStats(taskId: string): Promise<{ total: number; completed: number }> {
  const subtasks = await getSubtasksByTaskId(taskId)
  return {
    total: subtasks.length,
    completed: subtasks.filter(s => s.completed).length,
  }
}
