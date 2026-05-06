import { Notification, BrowserWindow } from 'electron'
import type { Todo } from '../renderer/db/types'

class NotificationManager {
  private tasks: Todo[] = []
  private notifiedTaskIds: Set<string> = new Set()
  private checkInterval: NodeJS.Timeout | null = null

  updateTasks(tasks: Todo[]) {
    this.tasks = tasks
  }

  markAsNotified(taskId: string) {
    this.notifiedTaskIds.add(taskId)
  }

  startChecker() {
    this.checkDueTasks()

    this.checkInterval = setInterval(() => {
      this.checkDueTasks()
    }, 60 * 1000)
  }

  stopChecker() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  private checkDueTasks() {
    const now = new Date()

    for (const task of this.tasks) {
      if (!task.dueDate) continue
      if (this.notifiedTaskIds.has(task.id)) continue

      const dueDate = new Date(task.dueDate)
      if (dueDate <= now) {
        this.sendNotification(task)
        this.notifiedTaskIds.add(task.id)
      }
    }
  }

  private sendNotification(task: Todo) {
    const notification = new Notification({
      title: '任务到期提醒',
      body: `"${task.content}" 已到期`,
      urgency: 'critical',
    })

    notification.on('click', () => {
      const windows = BrowserWindow.getAllWindows()
      if (windows.length > 0) {
        if (windows[0].isMinimized()) {
          windows[0].restore()
        }
        windows[0].focus()
      }
    })

    notification.show()
  }
}

export const notificationManager = new NotificationManager()
