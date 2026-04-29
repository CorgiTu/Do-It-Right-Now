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
