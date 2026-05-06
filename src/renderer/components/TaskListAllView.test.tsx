import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import TaskListAllView from './TaskListAllView'
import { useTaskStore } from '../store/taskStore'
import { useListStore } from '../store/listStore'
import type { Todo, TodoList } from '../db/types'

vi.mock('../store/taskStore', () => ({
  useTaskStore: vi.fn(),
}))

vi.mock('../store/listStore', () => ({
  useListStore: vi.fn(),
}))

describe('TaskListAllView', () => {
  const mockLists: TodoList[] = [
    { id: 'list1', name: '工作', color: '#3B82F6', icon: 'list', order: 0, createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 'list2', name: '生活', color: '#10B981', icon: 'list', order: 1, createdAt: '2024-01-01T00:00:00.000Z' },
  ]

  const mockTasks: Todo[] = [
    {
      id: '1',
      content: '工作任务1',
      completed: false,
      listId: 'list1',
      dueDate: null,
      reminder: null,
      order: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      content: '生活任务1',
      completed: false,
      listId: 'list2',
      dueDate: null,
      reminder: null,
      order: 0,
      createdAt: '2024-01-01T00:01:00.000Z',
      updatedAt: '2024-01-01T00:01:00.000Z',
    },
    {
      id: '3',
      content: '工作任务2',
      completed: true,
      listId: 'list1',
      dueDate: null,
      reminder: null,
      order: 1,
      createdAt: '2024-01-01T00:02:00.000Z',
      updatedAt: '2024-01-01T00:02:00.000Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show empty state when no tasks', () => {
    ;(useTaskStore as any).mockReturnValue({
      tasks: [],
      loadTasks: vi.fn(),
    })
    ;(useListStore as any).mockReturnValue({
      lists: mockLists,
      selectedListId: 'all',
    })

    render(<TaskListAllView />)

    expect(screen.getByText('暂无任务')).toBeInTheDocument()
  })

  it('should display all tasks grouped by list title', () => {
    ;(useTaskStore as any).mockReturnValue({
      tasks: mockTasks,
      loadTasks: vi.fn(),
    })
    ;(useListStore as any).mockReturnValue({
      lists: mockLists,
      selectedListId: 'all',
    })

    render(<TaskListAllView />)

    // 应该显示分组标题
    expect(screen.getByText('工作')).toBeInTheDocument()
    expect(screen.getByText('生活')).toBeInTheDocument()

    // 应该显示所有任务
    expect(screen.getByText('工作任务1')).toBeInTheDocument()
    expect(screen.getByText('生活任务1')).toBeInTheDocument()
    expect(screen.getByText('工作任务2')).toBeInTheDocument()
  })

  it('should show tasks under correct list sections', () => {
    ;(useTaskStore as any).mockReturnValue({
      tasks: mockTasks,
      loadTasks: vi.fn(),
    })
    ;(useListStore as any).mockReturnValue({
      lists: mockLists,
      selectedListId: 'all',
    })

    const { container } = render(<TaskListAllView />)

    // 获取所有分组标题
    const sections = container.querySelectorAll('section')
    expect(sections.length).toBe(2) // 2个分组

    // 第一个分组（工作）应该有2个任务（1未完成+1已完成）
    const firstSection = sections[0]
    expect(firstSection).toHaveTextContent('工作')

    // 第二个分组（生活）应该有1个任务
    const secondSection = sections[1]
    expect(secondSection).toHaveTextContent('生活')
  })

  it('should not show empty lists', () => {
    const emptyList: TodoList = {
      id: 'list3',
      name: '空分组',
      color: '#F59E0B',
      icon: 'list',
      order: 2,
      createdAt: '2024-01-01T00:00:00.000Z',
    }

    ;(useTaskStore as any).mockReturnValue({
      tasks: mockTasks,
      loadTasks: vi.fn(),
    })
    ;(useListStore as any).mockReturnValue({
      lists: [...mockLists, emptyList],
      selectedListId: 'all',
    })

    const { container } = render(<TaskListAllView />)

    // 不应该显示"空分组"标题
    expect(screen.queryByText('空分组')).not.toBeInTheDocument()

    // 应该只显示2个有任务的分组
    const sections = container.querySelectorAll('section')
    expect(sections.length).toBe(2)
  })

  it('should separate incomplete and completed tasks within each list', () => {
    ;(useTaskStore as any).mockReturnValue({
      tasks: mockTasks,
      loadTasks: vi.fn(),
    })
    ;(useListStore as any).mockReturnValue({
      lists: mockLists,
      selectedListId: 'all',
    })

    render(<TaskListAllView />)

    // 工作分组的未完成和已完成任务都应该显示
    expect(screen.getByText('工作任务1')).toBeInTheDocument()
    expect(screen.getByText('工作任务2')).toBeInTheDocument()
  })
})
