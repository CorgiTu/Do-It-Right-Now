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
}

export type CreateTodoInput = Pick<Todo, 'content'> & Partial<Omit<Todo, 'id' | 'content' | 'completed' | 'order' | 'createdAt' | 'updatedAt'>>

export interface TodoList {
  id: string
  name: string
  color: string
  icon: string
  order: number
  createdAt: string
}

export type CreateListInput = Pick<TodoList, 'name' | 'color' | 'icon'>
