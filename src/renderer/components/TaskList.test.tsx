import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import TaskList from './TaskList'
import { useTaskStore } from '../store/taskStore'
import type { Todo } from '../db/types'

vi.mock('../store/taskStore', () => ({
  useTaskStore: vi.fn(),
}))

vi.mock('../store/subtaskStore', () => ({
  useSubtaskStore: vi.fn(() => ({
    loadSubtasks: vi.fn(),
    getSubtaskStats: vi.fn(() => ({ total: 0, completed: 0 })),
    subtaskMap: {},
  })),
}))

const mockTasks: Todo[] = [
  {
    id: '1',
    content: '未完成的任务1',
    completed: false,
    listId: 'default',
    dueDate: null,
    reminder: null,
    order: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isRecurring: false,
    recurrencePattern: null,
    lastCompletedDate: null,
    originalTaskId: null,
    autoCompleteOnSubtasksDone: false,
  },
  {
    id: '2',
    content: '未完成的任务2',
    completed: false,
    listId: 'default',
    dueDate: null,
    reminder: null,
    order: 1,
    createdAt: '2024-01-01T00:01:00.000Z',
    updatedAt: '2024-01-01T00:01:00.000Z',
    isRecurring: false,
    recurrencePattern: null,
    lastCompletedDate: null,
    originalTaskId: null,
    autoCompleteOnSubtasksDone: false,
  },
  {
    id: '3',
    content: '已完成的任务',
    completed: true,
    listId: 'default',
    dueDate: null,
    reminder: null,
    order: 2,
    createdAt: '2024-01-01T00:02:00.000Z',
    updatedAt: '2024-01-01T00:02:00.000Z',
    isRecurring: false,
    recurrencePattern: null,
    lastCompletedDate: null,
    originalTaskId: null,
    autoCompleteOnSubtasksDone: false,
  },
]

describe('TaskList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show empty state when no tasks', () => {
    ;(useTaskStore as any).mockReturnValue({
      tasks: [],
      loadTasks: vi.fn(),
    })

    render(<TaskList />)

    expect(screen.getByText('暂无任务')).toBeInTheDocument()
  })

  it('should render all tasks', () => {
    ;(useTaskStore as any).mockReturnValue({
      tasks: mockTasks,
      loadTasks: vi.fn(),
    })

    render(<TaskList />)

    expect(screen.getByText('未完成的任务1')).toBeInTheDocument()
    expect(screen.getByText('未完成的任务2')).toBeInTheDocument()
    expect(screen.getByText('已完成的任务')).toBeInTheDocument()
  })

  it('should show incomplete tasks above completed tasks', () => {
    ;(useTaskStore as any).mockReturnValue({
      tasks: mockTasks,
      loadTasks: vi.fn(),
    })

    render(<TaskList />)

    const incompleteSection = screen.getAllByRole('list')[0]
    const incompleteItems = incompleteSection.querySelectorAll('[data-testid="task-item"]')

    expect(incompleteItems).toHaveLength(2)
    expect(incompleteItems[0]).toHaveTextContent('未完成的任务1')
    expect(incompleteItems[1]).toHaveTextContent('未完成的任务2')
  })

  it('should show completed tasks below', () => {
    ;(useTaskStore as any).mockReturnValue({
      tasks: mockTasks,
      loadTasks: vi.fn(),
    })

    render(<TaskList />)

    const completedSection = screen.getAllByRole('list')[1]
    const completedItems = completedSection.querySelectorAll('[data-testid="task-item"]')

    expect(completedItems).toHaveLength(1)
    expect(completedItems[0]).toHaveTextContent('已完成的任务')
  })
})
