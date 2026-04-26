import { useEffect, useState } from 'react'
import { useListStore } from './store/listStore'
import { useTaskStore } from './store/taskStore'
import { useThemeStore } from './store/themeStore'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, PointerSensorArgs } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import ListSidebar from './components/ListSidebar'
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'
import TaskListAllView from './components/TaskListAllView'
import SettingsPanel from './components/SettingsPanel'

export default function App() {
  const { loadLists, selectList, selectedListId, initDefaultList, lists } = useListStore()
  const { loadTasks, tasks, reorderTasks, moveTaskToList } = useTaskStore()
  const { currentThemeId } = useThemeStore()
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const init = async () => {
      await initDefaultList()
      await loadLists()
      await loadTasks()
    }
    init()
  }, [])

  // Sync tasks to main process for notification checking
  useEffect(() => {
    if (window.electron && tasks.length > 0) {
      window.electron.syncTasks(tasks)
    }
  }, [tasks])

  const handleListSelect = async (id: string | 'all') => {
    selectList(id)
    await loadTasks()
  }

  const filteredTasks = selectedListId === 'all' ? tasks : tasks.filter(t => t.listId === selectedListId)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    } as PointerSensorArgs),
    useSensor(KeyboardSensor, {})
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || !active.id) return

    const taskId = String(active.id)
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const overId = String(over.id)

    // Cross-list drop: task dropped on a list in sidebar
    if (overId.startsWith('list-')) {
      const targetListId = overId.replace('list-', '')
      if (task.listId !== targetListId) {
        await moveTaskToList(taskId, targetListId)
      }
      return
    }

    // Within-list reorder: task dropped on another task
    if (task.listId === selectedListId && over.id !== active.id) {
      const oldIndex = filteredTasks.findIndex(t => t.id === active.id)
      const newIndex = filteredTasks.findIndex(t => t.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      const reordered = [...filteredTasks]
      const [movedTask] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, movedTask)

      const tasksToUpdate = reordered.map((t, index) => ({
        ...t,
        order: index,
        updatedAt: new Date().toISOString(),
      }))

      await reorderTasks(tasksToUpdate)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-[var(--color-bg)]">
        <ListSidebar
          onListSelect={handleListSelect}
          droppableLists={lists}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-[var(--color-bg)] border-b border-[var(--color-border)] px-8 py-6 shadow-sm flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[var(--color-text)] tracking-wide">
              {selectedListId === 'all'
                ? '全部任务'
                : useListStore.getState().lists.find(l => l.id === selectedListId)?.name || '任务'}
            </h1>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-light)] hover:text-[var(--color-text)]"
              title="设置"
            >
              ⚙️
            </button>
          </header>
          <main className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-3xl mx-auto w-full">
              <TaskInput listId={selectedListId === 'all' ? undefined : selectedListId} />
              <div className="mt-6 animate-slide-up">
                {selectedListId === 'all' ? (
                  <TaskListAllView />
                ) : (
                  <TaskList listId={selectedListId} />
                )}
              </div>
            </div>
          </main>
        </div>
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center" onClick={() => setShowSettings(false)}>
            <div className="bg-[var(--color-bg)] rounded-xl shadow-2xl border border-[var(--color-border)] max-w-md w-full mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                <h2 className="text-xl font-semibold text-[var(--color-text)]">设置</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg hover:bg-[var(--color-hover)] transition-colors text-[var(--color-text-light)]"
                >
                  ✕
                </button>
              </div>
              <SettingsPanel />
            </div>
          </div>
        )}
      </div>
    </DndContext>
  )
}
