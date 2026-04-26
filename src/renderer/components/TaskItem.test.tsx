import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskItem from './TaskItem'
import type { Todo } from '../db/types'

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
}

const mockToggleTask = vi.fn()
const mockDeleteTask = vi.fn()
const mockUpdateTaskContent = vi.fn()

vi.mock('../store/taskStore', () => ({
  useTaskStore: () => ({
    toggleTask: mockToggleTask,
    deleteTask: mockDeleteTask,
    updateTaskContent: mockUpdateTaskContent,
  }),
}))

describe('TaskItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render task content and checkbox', () => {
    render(<TaskItem task={mockTask} />)

    expect(screen.getByText('测试任务')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should show checkbox unchecked for incomplete task', () => {
    render(<TaskItem task={mockTask} />)

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
  })

  it('should show checkbox checked for completed task', () => {
    const completedTask = { ...mockTask, completed: true }
    render(<TaskItem task={completedTask} />)

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('should toggle task when checkbox is clicked', () => {
    render(<TaskItem task={mockTask} />)

    fireEvent.click(screen.getByRole('checkbox'))

    expect(mockToggleTask).toHaveBeenCalledWith('test-id')
  })

  it('should show strikethrough style for completed task', () => {
    const completedTask = { ...mockTask, completed: true }
    render(<TaskItem task={completedTask} />)

    const content = screen.getByText('测试任务')
    expect(content).toHaveClass('line-through')
  })

  it('should show creation time', () => {
    render(<TaskItem task={mockTask} />)

    expect(screen.getByText(/01\/01/)).toBeInTheDocument()
  })

  it('should enter edit mode on double click', () => {
    render(<TaskItem task={mockTask} />)

    const content = screen.getByText('测试任务')
    fireEvent.dblClick(content)

    const editInput = screen.getByDisplayValue('测试任务')
    expect(editInput).toBeInTheDocument()
  })

  it('should save on Enter key in edit mode', async () => {
    render(<TaskItem task={mockTask} />)

    const content = screen.getByText('测试任务')
    fireEvent.dblClick(content)

    const editInput = screen.getByDisplayValue('测试任务') as HTMLInputElement
    fireEvent.change(editInput, { target: { value: '修改后的内容' } })
    fireEvent.keyDown(editInput, { key: 'Enter' })

    expect(mockUpdateTaskContent).toHaveBeenCalledWith('test-id', { content: '修改后的内容' })
  })

  it('should cancel edit on ESC key', () => {
    render(<TaskItem task={mockTask} />)

    const content = screen.getByText('测试任务')
    fireEvent.dblClick(content)

    const editInput = screen.getByDisplayValue('测试任务')
    fireEvent.keyDown(editInput, { key: 'Escape' })

    expect(screen.getByText('测试任务')).toBeInTheDocument()
    expect(mockUpdateTaskContent).not.toHaveBeenCalled()
  })

  it('should not save empty content on Enter', () => {
    render(<TaskItem task={mockTask} />)

    const content = screen.getByText('测试任务')
    fireEvent.dblClick(content)

    const editInput = screen.getByDisplayValue('测试任务') as HTMLInputElement
    fireEvent.change(editInput, { target: { value: '' } })
    fireEvent.keyDown(editInput, { key: 'Enter' })

    expect(mockUpdateTaskContent).not.toHaveBeenCalled()
  })

  it('should keep editing mode when content is empty on Enter', () => {
    render(<TaskItem task={mockTask} />)

    const content = screen.getByText('测试任务')
    fireEvent.dblClick(content)

    const editInput = screen.getByDisplayValue('测试任务') as HTMLInputElement
    fireEvent.change(editInput, { target: { value: '' } })
    fireEvent.keyDown(editInput, { key: 'Enter' })

    // 应该保持编辑状态，输入框依然存在
    expect(screen.getByDisplayValue('')).toBeInTheDocument()
    expect(mockUpdateTaskContent).not.toHaveBeenCalled()
  })

  it('should restore original content and exit edit mode on blur', () => {
    render(<TaskItem task={mockTask} />)

    const content = screen.getByText('测试任务')
    fireEvent.dblClick(content)

    const editInput = screen.getByDisplayValue('测试任务') as HTMLInputElement
    fireEvent.change(editInput, { target: { value: '新内容' } })
    fireEvent.blur(editInput)

    // 应该恢复原始内容并退出编辑模式
    expect(screen.getByText('测试任务')).toBeInTheDocument()
    expect(mockUpdateTaskContent).not.toHaveBeenCalled()
  })

  it('should show delete dialog on right click', () => {
    render(<TaskItem task={mockTask} />)

    const taskItem = screen.getByTestId('task-item')
    fireEvent.contextMenu(taskItem)

    expect(screen.getByText('确认删除')).toBeInTheDocument()
    expect(screen.getByText('确定要删除此任务吗？')).toBeInTheDocument()
  })

  it('should delete task when confirm button is clicked', () => {
    render(<TaskItem task={mockTask} />)

    const taskItem = screen.getByTestId('task-item')
    fireEvent.contextMenu(taskItem)

    const confirmButton = screen.getByText('确认')
    fireEvent.click(confirmButton)

    expect(mockDeleteTask).toHaveBeenCalledWith('test-id')
  })

  it('should not delete task when cancel button is clicked', () => {
    render(<TaskItem task={mockTask} />)

    const taskItem = screen.getByTestId('task-item')
    fireEvent.contextMenu(taskItem)

    const cancelButton = screen.getByText('取消')
    fireEvent.click(cancelButton)

    expect(mockDeleteTask).not.toHaveBeenCalled()
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
})
