const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  syncTasks: (tasks: any[]) => ipcRenderer.send('tasks:sync', tasks),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  getPlatform: () => ipcRenderer.invoke('window:getPlatform'),
})
