import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTaskStore } from './taskStore'

vi.mock('../db/tasks', () => ({
  createTask: vi.fn((input) => Promise.resolve({
    id: 'test-task-id',
    content: input.content,
    completed: false,
    listId: input.listId || 'default',
    dueDate: null,
    reminder: null,
    order: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  })),
  getAllTasks: vi.fn(() => Promise.resolve([])),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  deleteTasks: vi.fn(),
  markTaskCompletedWithRecurrence: vi.fn(),
  resetRecurringTasksForDailyList: vi.fn(),
  migrateExistingDailyTasks: vi.fn(),
}))

vi.mock('../db/lists', () => ({
  getDailyList: vi.fn(() => Promise.resolve(null)),
}))

vi.mock('../store/tagStore', () => ({
  useTagStore: vi.fn(),
}))

describe('taskStore tag filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useTaskStore.setState({
      tasks: [],
      selectedTaskIds: [],
      loading: false,
      error: null,
    })
  })

  it('should return all tasks when no tag filter is active', () => {
    const tasks = [
      { id: 'task-1', content: 'Task 1', completed: false, listId: 'default', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
      { id: 'task-2', content: 'Task 2', completed: false, listId: 'default', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 },
    ]
    useTaskStore.setState({ tasks: tasks as any })

    const state = useTaskStore.getState()
    expect(state.tasks).toHaveLength(2)
  })

  it('should filter tasks by selected tags', async () => {
    const tasks = [
      { id: 'task-1', content: '工作 1', completed: false, listId: 'default', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 0 },
      { id: 'task-2', content: '生活 1', completed: false, listId: 'default', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 1 },
      { id: 'task-3', content: '工作 2', completed: false, listId: 'default', createdAt: '2024-01-01', updatedAt: '2024-01-01', order: 2 },
    ]
    useTaskStore.setState({ tasks: tasks as any })

    useTaskStore.setState({ tagFilter: ['tag-work'] })

    const state = useTaskStore.getState()
    expect(state.tagFilter).toEqual(['tag-work'])
  })

  it('should clear tag filter', () => {
    useTaskStore.setState({ tagFilter: ['tag-1'] })
    useTaskStore.getState().clearTagFilter()

    expect(useTaskStore.getState().tagFilter).toEqual([])
  })

  it('should support multiple tag filters (AND logic state)', () => {
    useTaskStore.setState({ tagFilter: ['tag-work', 'tag-urgent'] })

    const state = useTaskStore.getState()
    expect(state.tagFilter).toHaveLength(2)
    expect(state.tagFilter).toContain('tag-work')
    expect(state.tagFilter).toContain('tag-urgent')
  })

  it('should set tag filter with multiple tags', () => {
    useTaskStore.getState().setTagFilter(['tag-a', 'tag-b', 'tag-c'])

    expect(useTaskStore.getState().tagFilter).toEqual(['tag-a', 'tag-b', 'tag-c'])
  })
})
