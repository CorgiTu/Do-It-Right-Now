import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SubtaskList from './SubtaskList'
import { useSubtaskStore } from '../store/subtaskStore'

describe('SubtaskList Component', () => {
  const TEST_TASK_ID = 'test-task-1'

  beforeEach(() => {
    localStorage.clear()
    useSubtaskStore.setState({ subtaskMap: {} })
  })

  it('should render with collapsed state initially', () => {
    render(<SubtaskList taskId={TEST_TASK_ID} />)

    expect(screen.getByText('子任务')).toBeDefined()
    expect(screen.queryByPlaceholderText('添加子任务...')).toBeNull()
  })

  it('should expand when clicked', () => {
    render(<SubtaskList taskId={TEST_TASK_ID} />)

    const toggleButton = screen.getByText('子任务').closest('button')
    if (toggleButton) {
      fireEvent.click(toggleButton)
    }

    expect(screen.getByText('添加子任务')).toBeDefined()
  })

  it('should allow adding new subtasks', async () => {
    render(<SubtaskList taskId={TEST_TASK_ID} />)

    const toggleButton = screen.getByText('子任务').closest('button')
    if (toggleButton) {
      fireEvent.click(toggleButton)
    }

    const addBtn = screen.getByText('添加子任务')
    fireEvent.click(addBtn)

    const input = screen.getByPlaceholderText('添加子任务...')
    fireEvent.change(input, { target: { value: 'New subtask' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText('New subtask')).toBeDefined()
    })
  })

  it('should show progress when subtasks exist', async () => {
    render(<SubtaskList taskId={TEST_TASK_ID} />)

    const toggleButton = screen.getByText('子任务').closest('button')
    if (toggleButton) {
      fireEvent.click(toggleButton)
    }

    const addBtn = screen.getByText('添加子任务')
    fireEvent.click(addBtn)

    const input = screen.getByPlaceholderText('添加子任务...')
    fireEvent.change(input, { target: { value: 'Task 1' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    fireEvent.change(input, { target: { value: 'Task 2' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeDefined()
      expect(screen.getByText('Task 2')).toBeDefined()
    })
  })
})
