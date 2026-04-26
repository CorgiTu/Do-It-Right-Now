import { ipcMain } from 'electron'
import { notificationManager } from './notification'

export function setupIpcHandlers() {
  ipcMain.on('tasks:sync', (_event, tasks: any[]) => {
    notificationManager.updateTasks(tasks)
  })

  ipcMain.handle('tasks:sendNotifications', async (_event, notifiedIds: string[]) => {
    notifiedIds.forEach(id => {
      notificationManager.markAsNotified(id)
    })
    return { success: true }
  })
}
