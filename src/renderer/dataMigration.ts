const MIGRATION_MAP: Record<string, string> = {
  'todo-app-tasks-v2': 'do-it-right-now-tasks-v2',
  'todo-app-data': 'do-it-right-now-data',
  'todo-app-tags': 'do-it-right-now-tags',
  'todo-app-task-tags': 'do-it-right-now-task-tags',
  'todo-app-subtasks-v1': 'do-it-right-now-subtasks-v1',
  'todo-app-timeline-v1': 'do-it-right-now-timeline-v1',
  'todo-app-daily-list-id': 'do-it-right-now-daily-list-id',
  'todo-app-theme': 'do-it-right-now-theme',
}

export function migrateOldData() {
  let migrated = 0
  for (const [oldKey, newKey] of Object.entries(MIGRATION_MAP)) {
    const oldValue = localStorage.getItem(oldKey)
    if (oldValue !== null) {
      const newValue = localStorage.getItem(newKey)
      if (newValue === null) {
        localStorage.setItem(newKey, oldValue)
        migrated++
        console.log(`[DataMigration] ${oldKey} -> ${newKey}`)
      }
    }
  }
  if (migrated > 0) {
    console.log(`[DataMigration] Successfully migrated ${migrated} keys`)
  }
}

export function fixCorruptedRecurringData() {
  const TASKS_KEY = 'do-it-right-now-tasks-v2'
  const raw = localStorage.getItem(TASKS_KEY)
  if (!raw) return

  let tasks: any[]
  try {
    tasks = JSON.parse(raw)
  } catch {
    return
  }

  let fixedCount = 0
  const corrected = tasks.map((t: any) => {
    if (t.isRecurring === true) {
      fixedCount++
      const { isRecurring, recurrencePattern, endDate, maxOccurrences, occurrenceCount, exceptionDates, originalTaskId, lastCompletedDate, ...rest } = t
      return { ...rest, isRecurring: false, recurrencePattern: null, endDate: null, maxOccurrences: null, occurrenceCount: 0, exceptionDates: [], originalTaskId: null }
    }
    return t
  })

  if (fixedCount > 0) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(corrected))
    console.log(`[FixRecurringData] Fixed ${fixedCount} corrupted isRecurring flags`)
  }
}
