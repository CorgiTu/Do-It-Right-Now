import { useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useListStore } from '../store/listStore'
import { useTagStore } from '../store/tagStore'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskItem from './TaskItem'
import type { Todo } from '../db/types'

function SortableTaskItemAllView({ task }: { task: Todo }) {
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

export default function TaskListAllView() {
  const { tasks, loadTasks } = useTaskStore()
  const { lists } = useListStore()
  const selectedTagIds = useTagStore((state) => state.selectedTagIds)
  const taskTagMap = useTagStore((state) => state.taskTagMap)

  useEffect(() => {
    loadTasks()
  }, [])

  const filteredTasks = selectedTagIds.length > 0
    ? tasks.filter(task => {
        const taskTags = taskTagMap[task.id] || []
        return selectedTagIds.every(tagId => taskTags.includes(tagId))
      })
    : tasks

  const listsWithTasks = lists.filter(list =>
    filteredTasks.some(task => task.listId === list.id)
  )

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-coinbase-muted">
        <div className="text-6xl mb-4 opacity-20">✓</div>
        <p className="text-base font-light tracking-wide">
          {selectedTagIds.length > 0 ? '没有匹配的任务' : '暂无任务'}
        </p>
        <p className="text-sm mt-2 opacity-60">
          {selectedTagIds.length > 0 ? '请尝试清除标签筛选' : '添加新任务开始使用'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {listsWithTasks.map(list => {
        const listTasks = filteredTasks.filter(task => task.listId === list.id)
        const incompleteTasks = listTasks.filter(task => !task.completed)
        const completedTasks = listTasks.filter(task => task.completed)

        return (
          <section key={list.id} className="animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-3 h-3 rounded-coinbase-full shadow-sm"
                style={{ backgroundColor: list.color }}
              />
              <h2 className="text-lg font-semibold text-coinbase-ink">{list.name}</h2>
              <span className="text-sm text-coinbase-muted-soft">({listTasks.length})</span>
            </div>

            <div className="flex flex-col gap-4 ml-5">
              {incompleteTasks.length > 0 && (
                <ul role="list" className="space-y-2">
                  {incompleteTasks.map(task => (
                    <li key={task.id}>
                      <SortableTaskItemAllView task={task} />
                    </li>
                  ))}
                </ul>
              )}

              {completedTasks.length > 0 && (
                <div className="pt-6 border-t border-gray-200/60">
                  <h3 className="text-sm text-gray-400 mb-3 font-medium tracking-wide">已完成 ({completedTasks.length})</h3>
                  <ul role="list" className="space-y-2">
                  {completedTasks.map(task => (
                    <li key={task.id}>
                      <SortableTaskItemAllView task={task} />
                    </li>
                  ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
