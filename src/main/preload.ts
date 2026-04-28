const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  syncTasks: (tasks: any[]) => ipcRenderer.send('tasks:sync', tasks),
})
