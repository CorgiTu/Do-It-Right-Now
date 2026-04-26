import { useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useListStore } from '../store/listStore'
import TaskItem from './TaskItem'
import type { Todo } from '../db/types'

export default function TaskListAllView() {
  const { tasks, loadTasks, toggleTask, selectedTaskIds = [] } = useTaskStore()
  const { lists } = useListStore()

  useEffect(() => {
    loadTasks()
  }, [])

  // 过滤出有任务的分组
  const listsWithTasks = lists.filter(list => 
    tasks.some(task => task.listId === list.id)
  )

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-light)]">
        <div className="text-6xl mb-4 opacity-30">✓</div>
        <p className="text-base font-light tracking-wide">暂无任务</p>
        <p className="text-sm mt-2 opacity-60">添加新任务开始使用</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {listsWithTasks.map(list => {
        const listTasks = tasks.filter(task => task.listId === list.id)
        const incompleteTasks = listTasks.filter(task => !task.completed)
        const completedTasks = listTasks.filter(task => task.completed)

        return (
          <section key={list.id} className="animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: list.color }}
              />
              <h2 className="text-lg font-semibold text-[var(--color-text)] tracking-wide">{list.name}</h2>
              <span className="text-sm text-[var(--color-text-light)] opacity-70">({listTasks.length})</span>
            </div>

            <div className="flex flex-col gap-4 ml-5">
              {incompleteTasks.length > 0 && (
                <ul role="list" className="space-y-3">
                  {incompleteTasks.map(task => {
                    const isSelected = selectedTaskIds.includes(task.id)
                    return (
                      <li key={task.id}>
                        <TaskItem 
                          task={task} 
                          isSelected={isSelected}
                          onToggleComplete={() => toggleTask(task.id)}
                        />
                      </li>
                    )
                  })}
                </ul>
              )}

              {completedTasks.length > 0 && (
                <div className="pt-6 border-t border-[var(--color-border)]">
                  <h3 className="text-sm text-[var(--color-text-light)] mb-3 font-medium tracking-wide">已完成 ({completedTasks.length})</h3>
                  <ul role="list" className="space-y-2">
                    {completedTasks.map(task => {
                      const isSelected = selectedTaskIds.includes(task.id)
                      return (
                        <li key={task.id}>
                          <TaskItem 
                            task={task} 
                            isSelected={isSelected}
                            onToggleComplete={() => toggleTask(task.id)}
                          />
                        </li>
                      )
                    })}
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
