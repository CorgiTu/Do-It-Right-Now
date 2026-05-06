import type { TimelineEntry, TimelineActionType } from './types'
import { generateId } from '../utils/uuid'

const TIMELINE_STORE_KEY = 'do-it-right-now-timeline-v1'

function getEntries(): TimelineEntry[] {
  try {
    const data = localStorage.getItem(TIMELINE_STORE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[Timeline] Failed to read timeline entries:', error)
    return []
  }
}

function saveEntries(entries: TimelineEntry[]): void {
  try {
    localStorage.setItem(TIMELINE_STORE_KEY, JSON.stringify(entries))
  } catch (error) {
    console.error('[Timeline] Failed to save timeline entries:', error)
    throw error
  }
}

export async function addTimelineEntry(
  taskId: string,
  actionType: TimelineActionType,
  beforeValue?: Record<string, any>,
  afterValue?: Record<string, any>
): Promise<TimelineEntry> {
  const entries = getEntries()
  const entry: TimelineEntry = {
    id: generateId(),
    taskId,
    actionType,
    beforeValue: beforeValue ? JSON.stringify(beforeValue) : null,
    afterValue: afterValue ? JSON.stringify(afterValue) : null,
    createdAt: new Date().toISOString(),
  }
  entries.push(entry)
  saveEntries(entries)
  return entry
}

export async function getTimelineByTaskId(taskId: string): Promise<TimelineEntry[]> {
  const entries = getEntries()
  return entries
    .filter(e => e.taskId === taskId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function deleteTimelineByTaskId(taskId: string): Promise<void> {
  const entries = getEntries()
  const filtered = entries.filter(e => e.taskId !== taskId)
  saveEntries(filtered)
}
