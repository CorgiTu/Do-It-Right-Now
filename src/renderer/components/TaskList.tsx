import { useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskItem from './TaskItem'
import type { Todo } from '../db/types'

interface TaskListProps {
  listId?: string
}

/**
 * SortableTaskItem - 任务项拖拽组件
 * 
 * 关键动画优化点：
 * 1. 使用 dnd-kit 的 useSortable hook 处理拖拽逻辑
 * 2. 被拖拽项通过 visibility: hidden 保持占位，维持布局高度
 * 3. 让位动画由 dnd-kit 自动计算 transform，配合 CSS transition 实现平滑过渡
 * 4. 拖拽浮层由 DragOverlay 在 App.tsx 中统一渲染，脱离文档流
 * 5. 所有位移动画仅使用 transform，启用 GPU 加速（will-change + translateZ(0)）
 */
function SortableTaskItem({ task }: { task: Todo }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    // 让位动画配置：180ms ease-out 曲线，自然不生硬
    transition: {
      duration: 180,
      easing: 'ease-out',
    },
    // 禁用 resize observer 避免布局抖动
    resizeObserverConfig: {
      disabled: true,
    },
  })

  const { toggleTask, selectedTaskIds = [] } = useTaskStore()
  const isSelected = selectedTaskIds.includes(task.id)

  // 核心：让位动画的 transform 样式
  // - 被拖拽的项：不应用过渡动画（实时跟随鼠标）
  // - 其他项：应用平滑过渡（让位动画）
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    // transition 始终应用，dnd-kit 会自动处理拖拽项的过渡禁用
    transition: transition || 'transform 180ms ease-out',
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="sortable-item"
    >
      {/* 
       * 占位条实现：
       * - isDragging 时隐藏内容，但保持元素尺寸（visibility: hidden）
       * - pointerEvents: none 防止隐藏元素响应鼠标事件
       * - 这样其他项可以平滑让位，布局不会塌陷
       */}
      <div style={isDragging ? { 
        visibility: 'hidden',
        pointerEvents: 'none',
      } : {}}>
        <TaskItem
          task={task}
          isSelected={isSelected}
          onToggleComplete={() => toggleTask(task.id)}
          dragHandleProps={isDragging ? undefined : { listeners, attributes }}
        />
      </div>
    </div>
  )
}

export default function TaskList({ listId }: TaskListProps) {
  const { tasks, loadTasks } = useTaskStore()

  useEffect(() => {
    loadTasks()
  }, [])

  const filteredTasks = listId ? tasks.filter(t => t.listId === listId) : tasks
  const incompleteTasks = filteredTasks.filter(t => !t.completed)
  const completedTasks = filteredTasks.filter(t => t.completed)

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-light)]">
        <div className="text-6xl mb-4 opacity-30">✓</div>
        <p className="text-base font-light tracking-wide">暂无任务</p>
        <p className="text-sm mt-2 opacity-60">添加新任务开始使用</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {incompleteTasks.length > 0 && (
        <section className="animate-fade-in">
          <div className="space-y-3">
            {incompleteTasks.map(task => (
              <div key={task.id}>
                <SortableTaskItem task={task} />
              </div>
            ))}
          </div>
        </section>
      )}
      {completedTasks.length > 0 && (
        <section className="pt-6 border-t border-[var(--color-border)] animate-fade-in">
          <h3 className="text-sm text-[var(--color-text-light)] mb-3 font-medium tracking-wide">
            已完成 ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id}>
                <SortableTaskItem task={task} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
