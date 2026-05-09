import { useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskItem from './TaskItem'
import type { Todo } from '../db/types'

interface TaskListProps {
  listId?: string
}

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
    transition: {
      duration: 180,
      easing: 'ease-out',
    },
    resizeObserverConfig: {
      disabled: true,
    },
  })

  const { toggleTask, selectedTaskIds = [] } = useTaskStore()
  const isSelected = selectedTaskIds.includes(task.id)

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 180ms ease-out',
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="sortable-item"
    >
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
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="text-6xl mb-4 opacity-20">✓</div>
        <p className="text-base font-light tracking-wide">暂无任务</p>
        <p className="text-sm mt-2 opacity-40">添加新任务开始使用</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {incompleteTasks.length > 0 && (
        <section className="animate-fade-in">
          <div className="space-y-2">
            {incompleteTasks.map(task => (
              <div key={task.id}>
                <SortableTaskItem task={task} />
              </div>
            ))}
          </div>
        </section>
      )}
      {completedTasks.length > 0 && (
        <section className="pt-6 border-t border-gray-200/60 animate-fade-in">
          <h3 className="text-sm text-gray-400 mb-3 font-medium tracking-wide">
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
