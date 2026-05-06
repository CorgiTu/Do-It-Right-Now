import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SubtaskItem from './SubtaskItem'
import type { Subtask } from '../db/types'

describe('SubtaskItem Component', () => {
  const createMockSubtask = (overrides = {}): Subtask => ({
    id: 'subtask-1',
    taskId: 'task-1',
    content: 'Test subtask',
    completed: false,
    order: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  })

  it('should render subtask content', () => {
    const subtask = createMockSubtask()
    render(
      <SubtaskItem
        subtask={subtask}
        onToggle={() => {}}
        onDelete={() => {}}
      />
    )

    expect(screen.getByText('Test subtask')).toBeDefined()
  })

  it('should show completed state when subtask is completed', () => {
    const subtask = createMockSubtask({ completed: true })
    render(
      <SubtaskItem
        subtask={subtask}
        onToggle={() => {}}
        onDelete={() => {}}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('should call onToggle when checkbox is clicked', () => {
    const toggleFn = vi.fn()
    const subtask = createMockSubtask()
    render(
      <SubtaskItem
        subtask={subtask}
        onToggle={toggleFn}
        onDelete={() => {}}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(toggleFn).toHaveBeenCalled()
  })

  it('should enter edit mode on double click', () => {
    const subtask = createMockSubtask()
    render(
      <SubtaskItem
        subtask={subtask}
        onToggle={() => {}}
        onDelete={() => {}}
      />
    )

    const content = screen.getByText('Test subtask')
    fireEvent.doubleClick(content)

    const input = screen.getByRole('textbox')
    expect(input).toBeDefined()
    expect(input).toHaveValue('Test subtask')
  })
})
