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
  } = useSortable({ id: task.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  }

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskItem task={task} />
    </li>
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

  const renderTaskList = (taskItems: Todo[]) => (
    <ul role="list" className="space-y-2">
      {taskItems.map(task => (
        <SortableTaskItem key={task.id} task={task} />
      ))}
    </ul>
  )

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
          <ul role="list" className="space-y-3">
            {incompleteTasks.map(task => (
              <li key={task.id} className="transition-all duration-200">
                <SortableTaskItem task={task} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {completedTasks.length > 0 && (
        <section className="pt-6 border-t border-[var(--color-border)] animate-fade-in">
          <h3 className="text-sm text-[var(--color-text-light)] mb-3 font-medium tracking-wide">
            已完成 ({completedTasks.length})
          </h3>
          <ul role="list" className="space-y-2">
            {completedTasks.map(task => (
              <li key={task.id} className="transition-all duration-200">
                <SortableTaskItem task={task} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export function handleTaskDragEnd(
  event: any,
  filteredTasks: Todo[],
  reorderTasks: (tasks: Todo[]) => Promise<void>,
  moveTaskToList: (taskId: string, listId: string) => Promise<void>,
  targetListId?: string
) {
  const { active, over } = event

  if (!over) return

  const taskId = String(active.id)
  const task = filteredTasks.find(t => t.id === taskId)
  if (!task) return

  if (targetListId && task.listId !== targetListId) {
    moveTaskToList(taskId, targetListId)
    return
  }

  if (over && active.id !== over.id) {
    const oldIndex = filteredTasks.findIndex(t => t.id === active.id)
    const newIndex = filteredTasks.findIndex(t => t.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newTasks = arrayMove(filteredTasks, oldIndex, newIndex)

    const tasksToUpdate: Todo[] = []
    newTasks.forEach((t, index) => {
      tasksToUpdate.push({
        ...t,
        order: index,
        updatedAt: new Date().toISOString(),
      })
    })

    reorderTasks(tasksToUpdate)
  }
}
