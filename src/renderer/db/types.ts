export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly' | null

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
}

export type CreateTodoInput = Pick<Todo, 'content'> & Partial<Omit<Todo, 'id' | 'content' | 'completed' | 'order' | 'createdAt' | 'updatedAt'>>

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
