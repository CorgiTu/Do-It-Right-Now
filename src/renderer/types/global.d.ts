interface ElectronAPI {
  syncTasks: (tasks: any[]) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}
