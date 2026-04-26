import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import TaskInput from './TaskInput'
import { useTaskStore } from '../store/taskStore'

describe('TaskInput', () => {
  beforeEach(async () => {
    // Clear the store before each test
    const tasks = useTaskStore.getState().tasks
    for (const task of tasks) {
      await useTaskStore.getState().deleteTask(task.id)
    }
  })

  it('should render input and button', () => {
    render(<TaskInput />)

    expect(screen.getByPlaceholderText('添加新任务...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent('添加')
  })

  it('should create task on Enter key press with valid content', async () => {
    render(<TaskInput />)
    const input = screen.getByPlaceholderText('添加新任务...')

    fireEvent.change(input, { target: { value: '测试任务' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      const { tasks } = useTaskStore.getState()
      expect(tasks).toHaveLength(1)
      expect(tasks[0].content).toBe('测试任务')
    })

    expect(input).toHaveValue('')
  })

  it('should not create task on empty content', async () => {
    render(<TaskInput />)
    const input = screen.getByPlaceholderText('添加新任务...')

    fireEvent.keyDown(input, { key: 'Enter' })

    const { tasks } = useTaskStore.getState()
    expect(tasks).toHaveLength(0)
  })

  it('should not create task on whitespace only', async () => {
    render(<TaskInput />)
    const input = screen.getByPlaceholderText('添加新任务...')

    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    const { tasks } = useTaskStore.getState()
    expect(tasks).toHaveLength(0)
  })

  it('should show character count when approaching limit', async () => {
    render(<TaskInput />)
    const input = screen.getByPlaceholderText('添加新任务...')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'a'.repeat(190) } })
    })

    expect(screen.getByText(/10/)).toBeInTheDocument()
  })

  it('should prevent input over 200 characters', async () => {
    render(<TaskInput />)
    const input = screen.getByPlaceholderText('添加新任务...')

    await act(async () => {
      fireEvent.change(input, { target: { value: 'a'.repeat(201) } })
    })

    expect((input as HTMLInputElement).value.length).toBeLessThanOrEqual(200)
  })

  it('should keep focus after creating task', async () => {
    render(<TaskInput />)
    const input = screen.getByPlaceholderText('添加新任务...') as HTMLInputElement

    fireEvent.change(input, { target: { value: '测试任务' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(document.activeElement).toBe(input)
    })
  })
})
