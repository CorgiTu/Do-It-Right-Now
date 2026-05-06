import { useState, useEffect } from 'react'
import { getTimelineByTaskId } from '../db/timeline'
import type { TimelineEntry } from '../db/types'

interface TaskTimelineProps {
  taskId: string
}

const ACTION_LABELS: Record<string, string> = {
  created: '创建了任务',
  content_edit: '修改了内容',
  completed: '标记完成',
  uncompleted: '取消完成',
  due_date_changed: '修改了截止日期',
  reminder_changed: '修改了提醒时间',
  tags_changed: '修改了标签',
  deleted: '删除了任务',
  notes_changed: '修改了备注',
  subtask_changed: '修改了子任务',
}

export default function TaskTimeline({ taskId }: TaskTimelineProps) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])

  useEffect(() => {
    const loadTimeline = async () => {
      const timelineEntries = await getTimelineByTaskId(taskId)
      setEntries(timelineEntries)
    }
    loadTimeline()
  }, [taskId])

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatActionDetail = (entry: TimelineEntry): string => {
    if (!entry.beforeValue || !entry.afterValue) return ''
    
    try {
      const before = JSON.parse(entry.beforeValue)
      const after = JSON.parse(entry.afterValue)
      
      switch (entry.actionType) {
        case 'content_edit':
          if (before.content && after.content) {
            return `"${before.content}" → "${after.content}"`
          }
          break
        case 'due_date_changed':
          if (before.dueDate !== after.dueDate) {
            const beforeStr = before.dueDate ? new Date(before.dueDate).toLocaleDateString('zh-CN') : '无'
            const afterStr = after.dueDate ? new Date(after.dueDate).toLocaleDateString('zh-CN') : '无'
            return `${beforeStr} → ${afterStr}`
          }
          break
        case 'reminder_changed':
          if (before.reminder !== after.reminder) {
            const beforeStr = before.reminder ? new Date(before.reminder).toLocaleString('zh-CN') : '无'
            const afterStr = after.reminder ? new Date(after.reminder).toLocaleString('zh-CN') : '无'
            return `${beforeStr} → ${afterStr}`
          }
          break
        case 'notes_changed':
          const beforeNotes = before.notes || '无'
          const afterNotes = after.notes || '无'
          if (beforeNotes !== afterNotes) {
            return `"${beforeNotes}" → "${afterNotes}"`
          }
          break
        case 'tags_changed':
          if (before.tags && after.tags) {
            return JSON.stringify(before.tags) + ' → ' + JSON.stringify(after.tags)
          }
          break
      }
    } catch (e) {
      // ignore parse errors
    }
    return ''
  }

  if (entries.length === 0) {
    return (
      <div className="text-sm text-[var(--color-text-light)] py-4 text-center">
        暂无操作记录
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-3 text-sm pb-3 border-b border-[var(--color-border)] last:border-b-0"
        >
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--color-accent)] mt-1.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[var(--color-text)] font-medium">
              {ACTION_LABELS[entry.actionType] || entry.actionType}
            </div>
            <div className="text-xs text-[var(--color-text-light)] mt-0.5">
              {formatTime(entry.createdAt)}
            </div>
            {formatActionDetail(entry) && (
              <div className="text-xs text-[var(--color-text-light)] mt-1 truncate">
                {formatActionDetail(entry)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
