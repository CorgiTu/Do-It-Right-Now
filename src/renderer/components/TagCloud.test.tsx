import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TagCloud from './TagCloud'
import * as tagStoreModule from '../store/tagStore'

vi.mock('../store/tagStore', () => {
  const mockFn = vi.fn()
  return {
    useTagStore: mockFn,
  }
})

describe('TagCloud', () => {
  const mockTags = [
    { id: 'tag-1', name: '工作', color: '#FF5722', usageCount: 5, createdAt: '2024-01-01' },
    { id: 'tag-2', name: '生活', color: '#4CAF50', usageCount: 2, createdAt: '2024-01-02' },
    { id: 'tag-3', name: '紧急', color: '#E91E63', usageCount: 8, createdAt: '2024-01-03' },
  ]

  const mockSelectTag = vi.fn()
  const mockClearTagFilter = vi.fn()
  const mockUpdateTag = vi.fn()
  const mockDeleteTag = vi.fn()
  const mockGetTaskTags = vi.fn(() => [])

  beforeEach(() => {
    vi.clearAllMocks()
    ;(tagStoreModule.useTagStore as any).mockImplementation((selector?: any) => {
      const state = {
        tags: mockTags,
        selectedTagIds: [],
        selectTag: mockSelectTag,
        clearTagFilter: mockClearTagFilter,
        updateTag: mockUpdateTag,
        deleteTag: mockDeleteTag,
        getTaskTags: mockGetTaskTags,
      }
      return selector ? selector(state) : state
    })
  })

  it('should render tag cloud title', () => {
    render(<TagCloud />)

    expect(screen.getByText(/标签/)).toBeInTheDocument()
  })

  it('should display all tags', () => {
    render(<TagCloud />)

    expect(screen.getByText('工作')).toBeInTheDocument()
    expect(screen.getByText('生活')).toBeInTheDocument()
    expect(screen.getByText('紧急')).toBeInTheDocument()
  })

  it('should display tag usage count', () => {
    render(<TagCloud />)

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('should call selectTag when a tag is clicked', () => {
    render(<TagCloud />)

    const workTag = screen.getByText('工作').closest('button')
    fireEvent.click(workTag!)

    expect(mockSelectTag).toHaveBeenCalledWith('tag-1')
  })

  it('should highlight selected tag', () => {
    ;(tagStoreModule.useTagStore as any).mockImplementation((selector?: any) => {
      const state = {
        tags: mockTags,
        selectedTagIds: ['tag-1'],
        selectTag: mockSelectTag,
        clearTagFilter: mockClearTagFilter,
      }
      return selector ? selector(state) : state
    })

    render(<TagCloud />)

    const workTag = screen.getByText('工作').closest('button')
    expect(workTag).toHaveClass('ring-2')
  })

  it('should call clearTagFilter when clear button is clicked', () => {
    ;(tagStoreModule.useTagStore as any).mockImplementation((selector?: any) => {
      const state = {
        tags: mockTags,
        selectedTagIds: ['tag-1'],
        selectTag: mockSelectTag,
        clearTagFilter: mockClearTagFilter,
      }
      return selector ? selector(state) : state
    })

    render(<TagCloud />)

    const clearButton = screen.getByText(/清除筛选/)
    fireEvent.click(clearButton!)

    expect(mockClearTagFilter).toHaveBeenCalled()
  })

  it('should show empty state when no tags exist', () => {
    ;(tagStoreModule.useTagStore as any).mockImplementation((selector?: any) => {
      const state = {
        tags: [],
        selectedTagIds: [],
        selectTag: mockSelectTag,
        clearTagFilter: mockClearTagFilter,
        updateTag: mockUpdateTag,
        deleteTag: mockDeleteTag,
        getTaskTags: mockGetTaskTags,
      }
      return selector ? selector(state) : state
    })

    render(<TagCloud />)

    expect(screen.getByText(/暂无标签/)).toBeInTheDocument()
  })

  it('should show context menu on right click', () => {
    render(<TagCloud />)

    const workTag = screen.getByText('工作').closest('button')
    fireEvent.contextMenu(workTag!)

    expect(screen.getByText('编辑标签')).toBeInTheDocument()
    expect(screen.getByText('删除标签')).toBeInTheDocument()
  })

  it('should call updateTag when editing a tag', async () => {
    render(<TagCloud />)

    const workTag = screen.getByText('工作').closest('button')
    fireEvent.contextMenu(workTag!)

    const editButton = screen.getByText('编辑标签')
    fireEvent.click(editButton)

    expect(screen.getByPlaceholderText(/标签名称/)).toBeInTheDocument()
  })

  it('should call deleteTag when deleting a tag with no tasks', async () => {
    mockGetTaskTags.mockReturnValue([])

    render(<TagCloud />)

    const lifeTag = screen.getByText('生活').closest('button')
    fireEvent.contextMenu(lifeTag!)

    const deleteButton = screen.getByText('删除标签')
    fireEvent.click(deleteButton)

    expect(mockDeleteTag).toHaveBeenCalledWith('tag-2')
  })

  it('should show confirmation when deleting a tag with tasks', async () => {
    mockGetTaskTags.mockReturnValue(['task-1', 'task-2', 'task-3'])

    render(<TagCloud />)

    const workTag = screen.getByText('工作').closest('button')
    fireEvent.contextMenu(workTag!)

    const deleteButton = screen.getByText('删除标签')
    fireEvent.click(deleteButton)

    expect(screen.getByText(/此标签关联 3 个任务/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '确认删除' })).toBeInTheDocument()
  })

  it('should confirm delete tag with tasks', async () => {
    mockGetTaskTags.mockReturnValue(['task-1', 'task-2'])

    render(<TagCloud />)

    const workTag = screen.getByText('工作').closest('button')
    fireEvent.contextMenu(workTag!)

    const deleteButton = screen.getByText('删除标签')
    fireEvent.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: '确认删除' })
    fireEvent.click(confirmButton)

    expect(mockDeleteTag).toHaveBeenCalledWith('tag-1')
  })
})
