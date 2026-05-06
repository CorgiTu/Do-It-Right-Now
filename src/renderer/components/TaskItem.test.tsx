import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskItem from './TaskItem'
import type { Todo } from '../db/types'
import * as taskStoreModule from '../store/taskStore'
import * as tagStoreModule from '../store/tagStore'

const mockTask: Todo = {
  id: 'test-id',
  content: '测试任务',
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
}

const mockToggleTask = vi.fn()
const mockToggleTaskSelection = vi.fn()
const mockDeleteTask = vi.fn()
const mockUpdateTaskContent = vi.fn()

vi.mock('../store/taskStore', () => ({
  useTaskStore: vi.fn(() => ({
    toggleTask: mockToggleTask,
    toggleTaskSelection: mockToggleTaskSelection,
    deleteTask: mockDeleteTask,
    updateTaskContent: mockUpdateTaskContent,
    selectedTaskIds: [],
  })),
}))

vi.mock('../store/tagStore', () => {
  const mockFn = vi.fn()
  return {
    useTagStore: mockFn,
  }
})

vi.mock('../store/subtaskStore', () => ({
  useSubtaskStore: vi.fn(() => ({
    loadSubtasks: vi.fn(),
    getSubtaskStats: vi.fn(() => ({ total: 0, completed: 0 })),
    subtaskMap: {},
  })),
}))

describe('TaskItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(taskStoreModule.useTaskStore as any).mockImplementation(() => ({
      toggleTask: mockToggleTask,
      toggleTaskSelection: mockToggleTaskSelection,
      deleteTask: mockDeleteTask,
      updateTaskContent: mockUpdateTaskContent,
      selectedTaskIds: [],
    }))
    ;(tagStoreModule.useTagStore as any).mockImplementation((selector?: any) => {
      const state = {
        tags: [],
        taskTagMap: {},
        getTaskTags: () => [],
      }
      return selector ? selector(state) : state
    })
  })

  it('should render task content', () => {
    render(<TaskItem task={mockTask} />)

    expect(screen.getByText('测试任务')).toBeInTheDocument()
  })

  it('should render with completed task', () => {
    const completedTask: Todo = {
      ...mockTask,
      completed: true,
    }

    render(<TaskItem task={completedTask} />)

    expect(screen.getByText('测试任务')).toHaveClass('line-through')
  })

  it('should show due date when set', () => {
    const taskWithDue: Todo = {
      ...mockTask,
      dueDate: '2024-01-15T09:00:00.000Z',
    }

    render(<TaskItem task={taskWithDue} />)

    expect(screen.getByText('01/15 09:00')).toBeInTheDocument()
  })

  it('should not show due date when not set', () => {
    render(<TaskItem task={mockTask} />)

    expect(screen.queryByText(/01\/01 08:00/)).not.toBeInTheDocument()
  })

  it('should render with due date and reminder set', () => {
    const taskWithDueAndReminder: Todo = {
      ...mockTask,
      dueDate: '2024-01-15T09:00:00.000Z',
      reminder: '10 minutes',
    }

    render(<TaskItem task={taskWithDueAndReminder} />)

    expect(screen.getByText('01/15 09:00')).toBeInTheDocument()
    expect(screen.getByText('设置提醒')).toBeInTheDocument()
  })

  it('should show disabled reminder when no due date', () => {
    const taskWithReminder = { ...mockTask, reminder: null }
    render(<TaskItem task={taskWithReminder} />)

    const reminderButton = screen.getByText('设置提醒')
    expect(reminderButton.closest('button')).toBeDisabled()
  })

  it('should call toggleTask when checkbox is clicked', () => {
    render(<TaskItem task={mockTask} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(mockToggleTask).toHaveBeenCalledWith('test-id')
  })

  it('should enter editing mode when edit button is clicked', () => {
    render(<TaskItem task={mockTask} />)

    const editButton = screen.getByTitle('编辑')
    fireEvent.click(editButton)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should call updateTaskContent when editing and Enter pressed', () => {
    render(<TaskItem task={mockTask} />)

    const editButton = screen.getByTitle('编辑')
    fireEvent.click(editButton)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '新任务内容' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockUpdateTaskContent).toHaveBeenCalledWith('test-id', { content: '新任务内容' })
  })

  it('should call updateTaskContent when editing and input blur', () => {
    render(<TaskItem task={mockTask} />)

    const editButton = screen.getByTitle('编辑')
    fireEvent.click(editButton)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '新任务内容' } })
    fireEvent.blur(input)

    expect(mockUpdateTaskContent).toHaveBeenCalledWith('test-id', { content: '新任务内容' })
  })

  it('should keep editing mode when content is empty on blur', () => {
    render(<TaskItem task={mockTask} />)

    const editButton = screen.getByTitle('编辑')
    fireEvent.click(editButton)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.blur(input)

    expect(mockUpdateTaskContent).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should keep editing mode when content is empty on Enter', () => {
    render(<TaskItem task={mockTask} />)

    const editButton = screen.getByTitle('编辑')
    fireEvent.click(editButton)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockUpdateTaskContent).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should show context menu and confirm dialog when delete is clicked', () => {
    render(<TaskItem task={mockTask} />)

    const taskItem = screen.getByTestId('task-item')
    fireEvent.contextMenu(taskItem)

    const deleteButton = screen.getByTitle('删除')
    fireEvent.click(deleteButton)

    expect(screen.getByText('确认删除')).toBeInTheDocument()
    expect(screen.getByText(/确定要删除任务「测试任务」吗/)).toBeInTheDocument()
  })

  it('should call deleteTask when confirm delete', () => {
    render(<TaskItem task={mockTask} />)

    const taskItem = screen.getByTestId('task-item')
    fireEvent.contextMenu(taskItem)

    const deleteButton = screen.getByTitle('删除')
    fireEvent.click(deleteButton)

    const confirmButton = screen.getByText('确认删除')
    fireEvent.click(confirmButton)

    expect(mockDeleteTask).toHaveBeenCalledWith('test-id')
  })

  it('should not call deleteTask when cancel', () => {
    render(<TaskItem task={mockTask} />)

    const taskItem = screen.getByTestId('task-item')
    fireEvent.contextMenu(taskItem)

    const deleteButton = screen.getByTitle('删除')
    fireEvent.click(deleteButton)

    const cancelButton = screen.getByText('取消')
    fireEvent.click(cancelButton)

    expect(mockDeleteTask).not.toHaveBeenCalled()
    expect(screen.queryByText('确认删除')).not.toBeInTheDocument()
  })

  it('should close dialog when overlay is clicked', () => {
    render(<TaskItem task={mockTask} />)

    const taskItem = screen.getByTestId('task-item')
    fireEvent.contextMenu(taskItem)

    const overlay = screen.getByTestId('confirm-dialog-overlay')
    fireEvent.click(overlay)

    expect(mockDeleteTask).not.toHaveBeenCalled()
    expect(screen.queryByText('确认删除')).not.toBeInTheDocument()
  })

  it('should show tag badges when task has tags', async () => {
    const mockTags = [
      { id: 'tag-1', name: '工作', color: '#FF5722', usageCount: 1 },
      { id: 'tag-2', name: '紧急', color: '#E91E63', usageCount: 2 },
    ]
    ;(tagStoreModule.useTagStore as any).mockImplementation((selector?: any) => {
      const state = {
        tags: mockTags,
        taskTagMap: { 'test-id': ['tag-1', 'tag-2'] },
        getTaskTags: () => ['tag-1', 'tag-2'],
      }
      return selector ? selector(state) : state
    })

    render(<TaskItem task={mockTask} />)

    await waitFor(() => {
      expect(screen.getByText('工作')).toBeInTheDocument()
      expect(screen.getByText('紧急')).toBeInTheDocument()
    })
  })

  it('should show +N badge when task has more than 3 tags', async () => {
    const mockTags = [
      { id: 'tag-1', name: '工作', color: '#FF5722', usageCount: 1 },
      { id: 'tag-2', name: '紧急', color: '#E91E63', usageCount: 2 },
      { id: 'tag-3', name: '会议', color: '#3F51B5', usageCount: 3 },
      { id: 'tag-4', name: '电话', color: '#4CAF50', usageCount: 4 },
      { id: 'tag-5', name: '邮件', color: '#FF9800', usageCount: 5 },
    ]
    ;(tagStoreModule.useTagStore as any).mockImplementation((selector?: any) => {
      const state = {
        tags: mockTags,
        taskTagMap: { 'test-id': ['tag-1', 'tag-2', 'tag-3', 'tag-4', 'tag-5'] },
        getTaskTags: () => ['tag-1', 'tag-2', 'tag-3', 'tag-4', 'tag-5'],
      }
      return selector ? selector(state) : state
    })

    render(<TaskItem task={mockTask} />)

    await waitFor(() => {
      expect(screen.getByText('工作')).toBeInTheDocument()
      expect(screen.getByText('紧急')).toBeInTheDocument()
      expect(screen.getByText('会议')).toBeInTheDocument()
      expect(screen.getByText('+2')).toBeInTheDocument()
    })
  })

  it('should not show tag badges when task has no tags', () => {
    ;(tagStoreModule.useTagStore as any).mockImplementation((selector?: any) => {
      const state = {
        tags: [],
        taskTagMap: {},
        getTaskTags: () => [],
      }
      return selector ? selector(state) : state
    })

    render(<TaskItem task={mockTask} />)

    expect(screen.queryByText('工作')).not.toBeInTheDocument()
    expect(screen.queryByText('紧急')).not.toBeInTheDocument()
  })
})
