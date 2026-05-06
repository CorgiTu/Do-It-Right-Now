import type { Todo } from '../db/types'
import { getTasks, saveTasks } from '../db/tasks'

export function fixCorruptedRecurringData(): void {
  const tasks = getTasks()
  let fixedCount = 0

  const correctedTasks = tasks.map((task: Todo) => {
    if (task.isRecurring && !task.recurrencePattern) {
      fixedCount++
      return { ...task, isRecurring: false }
    }
    return task
  })

  if (fixedCount > 0) {
    saveTasks(correctedTasks)
    console.log(`[FixRecurringData] Cleaned up ${fixedCount} tasks with corrupted isRecurring flag`)
  }
}
