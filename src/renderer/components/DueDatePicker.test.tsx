import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DueDatePicker from './DueDatePicker'
import * as taskStoreModule from '../store/taskStore'

vi.mock('../store/taskStore', () => ({
  useTaskStore: vi.fn(),
}))

describe('DueDatePicker', () => {
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

  it('should show date picker button when no due date set', () => {
    render(<DueDatePicker taskId={mockTaskId} dueDate={null} />)

    expect(screen.getByText(/设置日期/)).toBeInTheDocument()
  })

  it('should show selected date when due date is set', () => {
    const dueDate = '2024-12-31T00:00:00.000Z'
    render(<DueDatePicker taskId={mockTaskId} dueDate={dueDate} />)

    expect(screen.getByText(/12月31日/)).toBeInTheDocument()
  })

  it('should open date picker when clicking button', () => {
    render(<DueDatePicker taskId={mockTaskId} dueDate={null} />)

    const button = screen.getByText(/设置日期/)
    fireEvent.click(button)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('should disable past dates', () => {
    render(<DueDatePicker taskId={mockTaskId} dueDate={null} />)

    const button = screen.getByText(/设置日期/)
    fireEvent.click(button)

    const calendar = screen.getByRole('dialog')
    const allButtons = calendar.querySelectorAll('button[type="button"]')

    let foundDisabled = false
    allButtons.forEach(btn => {
      const dayText = btn.textContent?.trim()
      if (dayText && !isNaN(Number(dayText))) {
        const day = Number(dayText)
        if (day <= 15 && btn.disabled) {
          foundDisabled = true
          expect(btn).toBeDisabled()
        }
      }
    })
    expect(foundDisabled).toBe(true)
  })

  it('should call updateTask when selecting a future date', () => {
    render(<DueDatePicker taskId={mockTaskId} dueDate={null} />)

    const button = screen.getByText(/设置日期/)
    fireEvent.click(button)

    const dialog = screen.getByRole('dialog')
    const futureButtons = dialog.querySelectorAll('button[type="button"]')

    let futureButton: HTMLButtonElement | undefined
    futureButtons.forEach(btn => {
      const dayText = btn.textContent?.trim()
      if (dayText && !isNaN(Number(dayText))) {
        const day = Number(dayText)
        if (day >= 27 && !btn.disabled) {
          futureButton = btn as HTMLButtonElement
        }
      }
    })

    if (futureButton) {
      fireEvent.click(futureButton)
      expect(mockUpdateTask).toHaveBeenCalledWith(mockTaskId, expect.objectContaining({
        dueDate: expect.any(String),
      }))
    }
  })

  it('should show overdue indicator for past due dates', () => {
    const pastDate = '2020-01-01T00:00:00.000Z'
    render(<DueDatePicker taskId={mockTaskId} dueDate={pastDate} />)

    expect(screen.getByText(/已到期/)).toBeInTheDocument()
  })

  it('should clear due date when clicking clear button', () => {
    const dueDate = '2024-12-31T00:00:00.000Z'
    render(<DueDatePicker taskId={mockTaskId} dueDate={dueDate} />)

    const button = screen.getByText(/12月31日/)
    fireEvent.click(button)

    const clearButton = screen.getByText(/清除日期/)
    fireEvent.click(clearButton)

    expect(mockUpdateTask).toHaveBeenCalledWith(mockTaskId, {
      dueDate: null,
    })
  })
})
