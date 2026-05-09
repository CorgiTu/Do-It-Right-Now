import { useEffect, useState } from 'react'
import { useListStore } from './store/listStore'
import { useTaskStore } from './store/taskStore'
import { fixCorruptedRecurringData } from './dataMigration'
import { useThemeStore } from './store/themeStore'
import { useTagStore } from './store/tagStore'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverlay, MeasuringStrategy, DragStartEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import ListSidebar from './components/ListSidebar'
import TaskList from './components/TaskList'
import TaskListAllView from './components/TaskListAllView'
import SettingsPanel from './components/SettingsPanel'
import FloatingActionButton from './components/FloatingActionButton'
import AddTaskModal from './components/AddTaskModal'
import Toast from './components/Toast'
import TitleBar from './components/TitleBar'
import TaskDetailSidebar from './components/TaskDetailSidebar'
import { useToast } from './hooks/useToast'
import type { Todo } from './db/types'

export default function App() {
  const { loadLists, selectList, selectedListId, initDefaultList, initDailyList, lists, reorderLists } = useListStore()
  const { loadTasks, tasks, reorderTasks, moveTaskToList, deleteSelectedTasks, clearSelection, initializeDailyTasks } = useTaskStore()
  const { themeId } = useThemeStore()
  const { loadTags, loadTaskTags, tags } = useTagStore()
  const [showSettings, setShowSettings] = useState(false)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const { toasts, showToast, removeToast } = useToast()
  
  // 拖拽状态
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [activeListId, setActiveListId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      await initDefaultList()
      await initDailyList()
      await loadLists()
      await loadTasks()
      await initializeDailyTasks()
      fixCorruptedRecurringData()
      await loadTasks()
      await loadTags()

      const loadedTasks = useTaskStore.getState().tasks
      for (const task of loadedTasks) {
        await loadTaskTags(task.id)
      }
    }
    init()
  }, [])

  // Sync tasks to main process for notification checking
  useEffect(() => {
    if ((window as any).electronAPI && tasks.length > 0) {
      (window as any).electronAPI.syncTasks(tasks)
    }
  }, [tasks])

  const handleListSelect = async (id: string | 'all') => {
    selectList(id)
    await loadTasks()
  }

  const filteredTasks = selectedListId === 'all' ? tasks : tasks.filter(t => t.listId === selectedListId)

  // 关键配置：仅在左侧拖动手柄上按下鼠标时，才触发拖拽
  // 使用 distance 约束防止点击误判为拖拽
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // 必须移动 8px 后才激活拖拽，确保是拖拽意图而非点击
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const collisionDetection = closestCenter

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = String(active.id)
    
    // 判断是任务还是分组
    if (activeId.startsWith('list-')) {
      setActiveListId(activeId.replace('list-', ''))
      setActiveTaskId(null)
    } else {
      setActiveTaskId(activeId)
      setActiveListId(null)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log('[App] handleDragEnd called:', event)
    const { active, over } = event

    // 清除拖拽状态
    setActiveTaskId(null)
    setActiveListId(null)

    if (!over || !active.id) {
      console.log('[App] No over or active.id')
      return
    }

    const activeId = String(active.id)
    const overId = String(over.id)

    console.log('[App] Active:', activeId, 'Over:', overId)

    // List reorder: list dragged on another list
    if (activeId.startsWith('list-') && overId.startsWith('list-')) {
      console.log('[App] List reorder detected')
      if (activeId === overId) return

      const oldIndex = lists.findIndex(l => `list-${l.id}` === activeId)
      const newIndex = lists.findIndex(l => `list-${l.id}` === overId)

      if (oldIndex === -1 || newIndex === -1) return

      const reordered = [...lists]
      const [movedList] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, movedList)

      // Reassign order values
      const updatedLists = reordered.map((list, index) => ({
        ...list,
        order: index,
      }))

      await reorderLists(updatedLists)
      return
    }

    // Task operations - only handle cross-list drops
    const task = tasks.find(t => t.id === activeId)
    console.log('[App] Task found:', task)
    if (!task) return

    // Cross-list drop: task dropped on a list in sidebar
    if (overId.startsWith('list-')) {
      console.log('[App] Cross-list drop detected')
      const targetListId = overId.replace('list-', '')
      if (task.listId !== targetListId) {
        await moveTaskToList(task.id, targetListId)
      }
      return
    }

    // Task-to-task reordering within the same list
    const targetTask = tasks.find(t => t.id === overId)
    console.log('[App] Target task:', targetTask)
    if (!targetTask) return

    // Only reorder if both tasks are in the same list
    if (task.listId !== targetTask.listId) {
      console.log('[App] Different lists, skipping')
      return
    }

    // Get the correct list of tasks to reorder (only from the same list)
    const listTasks = tasks.filter(t => t.listId === task.listId)
    
    // Check if both tasks are in the same section (both incomplete or both completed)
    const isTaskIncomplete = !task.completed
    const isTargetTaskIncomplete = !targetTask.completed
    
    console.log('[App] isTaskIncomplete:', isTaskIncomplete, 'isTargetTaskIncomplete:', isTargetTaskIncomplete)
    
    // Only allow reordering within the same section
    if (isTaskIncomplete !== isTargetTaskIncomplete) {
      console.log('[App] Cannot reorder between incomplete and completed sections')
      return
    }

    const oldIndex = listTasks.findIndex(t => t.id === activeId)
    const newIndex = listTasks.findIndex(t => t.id === overId)

    console.log('[App] oldIndex:', oldIndex, 'newIndex:', newIndex)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...listTasks]
    const [movedTask] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, movedTask)

    // Update order for ALL tasks in the list to ensure unique sequential order
    const tasksToUpdate = reordered.map((t, index) => ({
      ...t,
      order: index,
      updatedAt: new Date().toISOString(),
    }))

    console.log('[App] Updating tasks:', tasksToUpdate)
    await reorderTasks(tasksToUpdate)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <div className="flex flex-col h-screen bg-coinbase-canvas">
        <TitleBar />
        <div className="flex-1 flex overflow-hidden">
          <ListSidebar
            onListSelect={handleListSelect}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-coinbase-canvas border-b border-gray-200/60 px-8 py-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {selectedListId === 'all'
                  ? '全部任务'
                  : useListStore.getState().lists.find(l => l.id === selectedListId)?.name || '任务'}
              </h1>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-coinbase-sm hover:bg-coinbase-surface-strong transition-colors text-coinbase-muted hover:text-coinbase-body"
                title="设置"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </header>
            <main className="flex-1 overflow-y-auto px-8 py-6 bg-coinbase-surface-soft">
              <div className="max-w-3xl mx-auto w-full">
                <div className="animate-slide-up">
                  {selectedListId === 'all' ? (
                    <TaskListAllView />
                  ) : (
                    <TaskList listId={selectedListId} />
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
        {showSettings && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowSettings(false)}>
            <div className="bg-coinbase-canvas rounded-coinbase-xl shadow-coinbase-hover border border-gray-200/60 max-w-md w-full mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
                <h2 className="text-xl font-semibold text-coinbase-ink">设置</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-coinbase-sm hover:bg-coinbase-surface-strong transition-colors text-coinbase-muted"
                >
                  ✕
                </button>
              </div>
              <SettingsPanel />
            </div>
          </div>
        )}
        <FloatingActionButton
          onAddTask={() => setShowAddTaskModal(true)}
          onDeleteSelected={async (count) => {
            await deleteSelectedTasks()
            clearSelection()
            showToast(`已删除 ${count} 个任务`)
          }}
        />
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          listId={selectedListId === 'all' ? undefined : selectedListId}
        />
        <Toast toasts={toasts} onClose={removeToast} />
        <TaskDetailSidebar showToast={showToast} />

        {/* 
         * 拖拽覆盖层 - 脱离文档流的拖拽项
         * 
         * 关键动画优化点：
         * 1. DragOverlay 自动使用 position: fixed 定位，脱离文档流
         * 2. 被拖拽项通过 CSS 实现 scale(1.02) 轻微放大 + opacity(0.95) 半透明
         * 3. 柔和阴影（box-shadow）增强层次感
         * 4. dropAnimation 确保拖拽结束时平滑过渡到目标位置（180ms ease-out）
         * 5. 所有动画使用 GPU 加速（transform + opacity）
         */}
        <DragOverlay
          dropAnimation={{
            duration: 180,
            easing: 'ease-out',
          }}
        >
          {activeTaskId ? (
            (() => {
              const task = tasks.find(t => t.id === activeTaskId)
              if (!task) return null
              return (
                <div
                  className="sortable-dragging-overlay"
                  style={{
                    minWidth: '300px',
                    maxWidth: '800px',
                  }}
                >
                  <div className="bg-coinbase-surface-card rounded-coinbase-lg shadow-coinbase-hover border border-gray-200/60 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          readOnly
                          className="w-5 h-5 rounded-coinbase-xs border-coinbase-hairline text-coinbase-primary focus:ring-coinbase-primary/20"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block text-base ${task.completed ? 'line-through text-coinbase-muted' : 'text-coinbase-body'}`}>
                          {task.content}
                        </span>
                        <div className="mt-2 flex items-center gap-2 text-xs text-coinbase-muted">
                          <span>{new Date(task.createdAt).toLocaleString('zh-CN')}</span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              📅 {new Date(task.dueDate).toLocaleDateString('zh-CN')}
                            </span>
                          )}
                          {task.isRecurring && (
                            <span className="text-coinbase-semantic-up bg-coinbase-semantic-up/10 px-2 py-0.5 rounded-coinbase-pill border border-coinbase-semantic-up/20">
                              🔄 每日
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()
          ) : activeListId ? (
            (() => {
              const list = lists.find(l => l.id === activeListId)
              if (!list) return null
              const taskCount = tasks.filter(t => t.listId === list.id).length
              return (
                <div
                  className="sortable-dragging-overlay"
                  style={{
                    minWidth: '200px',
                    maxWidth: '400px',
                  }}
                >
                  <div className="bg-coinbase-surface-card rounded-coinbase-lg shadow-coinbase-hover border border-coinbase-hairline px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-coinbase-full" style={{ backgroundColor: list.color }} />
                      <span className="text-sm text-coinbase-body-strong">{list.name}</span>
                      <span className="text-xs text-coinbase-muted">{taskCount}</span>
                    </div>
                  </div>
                </div>
              )
            })()
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
