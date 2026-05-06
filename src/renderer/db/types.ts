export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' | null

export interface RecurrenceRule {
  pattern: RecurrencePattern
  interval: number
  weeklyDays?: number[]
  monthlyDay?: number
  endDate?: string | null
  maxOccurrences?: number | null
  exceptionDates?: string[]
}

export interface Todo {
  id: string
  content: string
  completed: boolean
  listId: string
  dueDate: string | null
  reminder: string | null
  order: number
  createdAt: string
  updatedAt: string
  isRecurring: boolean
  recurrencePattern: RecurrencePattern
  lastCompletedDate: string | null
  originalTaskId: string | null
  autoCompleteOnSubtasksDone: boolean
  endDate: string | null
  maxOccurrences: number | null
  occurrenceCount: number
  exceptionDates: string[]
  notes: string | null
}

export type TimelineActionType = 
  | 'created'
  | 'content_edit'
  | 'completed'
  | 'uncompleted'
  | 'due_date_changed'
  | 'reminder_changed'
  | 'tags_changed'
  | 'deleted'
  | 'notes_changed'
  | 'subtask_changed'

export interface TimelineEntry {
  id: string
  taskId: string
  actionType: TimelineActionType
  beforeValue: string | null
  afterValue: string | null
  createdAt: string
}

export type CreateTodoInput = Pick<Todo, 'content'> & Partial<Omit<Todo, 'id' | 'content' | 'order' | 'createdAt' | 'updatedAt'>>

export interface TodoList {
  id: string
  name: string
  color: string
  icon: string
  order: number
  createdAt: string
  isDailyList: boolean
}

export type CreateListInput = Pick<TodoList, 'name' | 'color' | 'icon'> & Partial<Pick<TodoList, 'isDailyList'>>

export interface Tag {
  id: string
  name: string
  color: string
  usageCount: number
  createdAt: string
}

export interface TaskTag {
  id: string
  taskId: string
  tagId: string
  createdAt: string
}

export interface Subtask {
  id: string
  taskId: string
  content: string
  completed: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export type CreateSubtaskInput = Pick<Subtask, 'taskId' | 'content'> & Partial<Pick<Subtask, 'id' | 'order' | 'createdAt' | 'updatedAt'>>
export const TAG_COLORS = [
  '#FF5722',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#009688',
  '#4CAF50',
  '#FF9800',
  '#795548',
  '#607D8B',
  '#8BC34A',
]

export const DEFAULT_TAG_COLOR = '#FF5722'
