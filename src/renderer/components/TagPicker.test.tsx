import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TagPicker from './TagPicker'
import { useTagStore } from '../store/tagStore'

vi.mock('../store/tagStore', () => ({
  useTagStore: vi.fn(),
}))

describe('TagPicker', () => {
  const mockTaskId = 'task-1'
  const mockOnChange = vi.fn()
  const mockAddTagToTask = vi.fn().mockResolvedValue(undefined)
  const mockRemoveTagFromTask = vi.fn().mockResolvedValue(undefined)
  const mockCreateTag = vi.fn().mockResolvedValue({ success: true })

  const mockTags = [
    { id: 'tag-1', name: '工作', color: '#FF5722', usageCount: 3, createdAt: '2024-01-01' },
    { id: 'tag-2', name: '生活', color: '#4CAF50', usageCount: 1, createdAt: '2024-01-02' },
    { id: 'tag-3', name: '紧急', color: '#E91E63', usageCount: 5, createdAt: '2024-01-03' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useTagStore as any).mockImplementation((selector: any) => {
      const store = {
        tags: mockTags,
        addTagToTask: mockAddTagToTask,
        removeTagFromTask: mockRemoveTagFromTask,
        createTag: mockCreateTag,
      }
      if (selector) return selector(store)
      return store
    })
  })

  it('should show add tag button', () => {
    render(<TagPicker taskId={mockTaskId} currentTagIds={[]} onChange={mockOnChange} />)

    expect(screen.getByText(/添加标签/)).toBeInTheDocument()
  })

  it('should show existing tags when opened', () => {
    render(<TagPicker taskId={mockTaskId} currentTagIds={[]} onChange={mockOnChange} />)

    const button = screen.getByText(/添加标签/)
    fireEvent.click(button)

    expect(screen.getByText('工作')).toBeInTheDocument()
    expect(screen.getByText('生活')).toBeInTheDocument()
    expect(screen.getByText('紧急')).toBeInTheDocument()
  })

  it('should show selected tags with remove buttons', () => {
    render(<TagPicker taskId={mockTaskId} currentTagIds={['tag-1']} onChange={mockOnChange} />)

    expect(screen.getByText('工作')).toBeInTheDocument()
  })

  it('should add a tag when clicking existing tag', async () => {
    render(<TagPicker taskId={mockTaskId} currentTagIds={[]} onChange={mockOnChange} />)

    const button = screen.getByText(/添加标签/)
    fireEvent.click(button)

    const tagButton = screen.getByText('工作')
    fireEvent.click(tagButton)

    await waitFor(() => {
      expect(mockAddTagToTask).toHaveBeenCalledWith(mockTaskId, 'tag-1')
    })
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  it('should remove a tag when clicking remove button', async () => {
    render(<TagPicker taskId={mockTaskId} currentTagIds={['tag-1']} onChange={mockOnChange} />)

    const removeButtons = screen.getAllByTitle('移除标签')
    expect(removeButtons.length).toBeGreaterThan(0)

    fireEvent.click(removeButtons[0])

    await waitFor(() => {
      expect(mockRemoveTagFromTask).toHaveBeenCalledWith(mockTaskId, 'tag-1')
    })
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  it('should create new tag when typing new name', async () => {
    render(<TagPicker taskId={mockTaskId} currentTagIds={[]} onChange={mockOnChange} />)

    const button = screen.getByText(/添加标签/)
    fireEvent.click(button)

    const input = screen.getByPlaceholderText(/搜索或创建标签/)
    fireEvent.change(input, { target: { value: '新标签' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(mockCreateTag).toHaveBeenCalledWith('新标签', expect.any(String))
    })
  })

  it('should not create tag with empty name', () => {
    render(<TagPicker taskId={mockTaskId} currentTagIds={[]} onChange={mockOnChange} />)

    const button = screen.getByText(/添加标签/)
    fireEvent.click(button)

    const input = screen.getByPlaceholderText(/搜索或创建标签/)
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockCreateTag).not.toHaveBeenCalled()
  })

  it('should limit tags to 10 maximum', () => {
    const tenTagIds = ['tag-1', 'tag-2', 'tag-3', 'tag-4', 'tag-5', 'tag-6', 'tag-7', 'tag-8', 'tag-9', 'tag-10']

    render(<TagPicker taskId={mockTaskId} currentTagIds={tenTagIds} onChange={mockOnChange} />)

    const button = screen.getByText(/10 标签/)
    fireEvent.click(button)

    expect(screen.getByText(/已达上限/)).toBeInTheDocument()
  })

  it('should filter tags when searching', () => {
    render(<TagPicker taskId={mockTaskId} currentTagIds={[]} onChange={mockOnChange} />)

    const button = screen.getByText(/添加标签/)
    fireEvent.click(button)

    const input = screen.getByPlaceholderText(/搜索或创建标签/)
    fireEvent.change(input, { target: { value: '工作' } })

    expect(screen.getByText('工作')).toBeInTheDocument()
  })
})
