import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  syncTasks: (tasks: any[]) => ipcRenderer.send('tasks:sync', tasks),
})
