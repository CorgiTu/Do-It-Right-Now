import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReminderPicker from './ReminderPicker'
import * as taskStoreModule from '../store/taskStore'

vi.mock('../store/taskStore', () => ({
  useTaskStore: vi.fn(),
}))

describe('ReminderPicker', () => {
  const mockTaskId = 'task-1'
  const mockUpdateTask = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(taskStoreModule.useTaskStore as any).mockImplementation((selector?: any) => {
      const store = {
        updateTaskContent: mockUpdateTask,
      }
      if (selector) return selector(store)
      return store
    })
  })

  it('should show reminder button with default text', () => {
    render(<ReminderPicker taskId={mockTaskId} reminder={null} dueDate={null} />)

    expect(screen.getByText('设置提醒')).toBeInTheDocument()
  })

  it('should show selected reminder option', () => {
    render(<ReminderPicker taskId={mockTaskId} reminder="15min" dueDate="2024-12-31T00:00:00.000Z" />)

    expect(screen.getByText(/提前15分钟/)).toBeInTheDocument()
  })

  it('should open dropdown when clicking button', () => {
    render(<ReminderPicker taskId={mockTaskId} reminder={null} dueDate="2024-12-31T00:00:00.000Z" />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('should show reminder options in dropdown', () => {
    render(<ReminderPicker taskId={mockTaskId} reminder={null} dueDate="2024-12-31T00:00:00.000Z" />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('到期时')).toBeInTheDocument()
    expect(screen.getByText('提前15分钟')).toBeInTheDocument()
    expect(screen.getByText('提前1小时')).toBeInTheDocument()
    expect(screen.getByText('提前1天')).toBeInTheDocument()
  })

  it('should call updateTask when selecting a reminder option', () => {
    render(<ReminderPicker taskId={mockTaskId} reminder={null} dueDate="2024-12-31T00:00:00.000Z" />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const option = screen.getByText('提前15分钟')
    fireEvent.click(option)

    expect(mockUpdateTask).toHaveBeenCalledWith(mockTaskId, expect.objectContaining({
      reminder: '15min',
    }))
  })

  it('should clear reminder when selecting clear option', () => {
    render(<ReminderPicker taskId={mockTaskId} reminder="15min" dueDate="2024-12-31T00:00:00.000Z" />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const clearOption = screen.getByText('清除提醒')
    fireEvent.click(clearOption)

    expect(mockUpdateTask).toHaveBeenCalledWith(mockTaskId, {
      reminder: null,
    })
  })

  it('should be disabled when no due date is set', () => {
    render(<ReminderPicker taskId={mockTaskId} reminder={null} dueDate={null} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
