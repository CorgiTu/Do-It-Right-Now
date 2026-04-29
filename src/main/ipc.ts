import { ipcMain, BrowserWindow } from 'electron'
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

  // Window controls
  ipcMain.on('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
  })

  ipcMain.on('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.on('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
  })

  ipcMain.handle('window:getPlatform', () => {
    return process.platform
  })
}
