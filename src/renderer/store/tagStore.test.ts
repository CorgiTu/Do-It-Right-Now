import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTagStore } from './tagStore'

vi.mock('../db/tags', () => ({
  createTag: vi.fn((input) => Promise.resolve({
    id: 'test-tag-id',
    name: input.name,
    color: input.color || '#FF5722',
    usageCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  })),
  getAllTags: vi.fn(() => Promise.resolve([])),
  getTagById: vi.fn(),
  updateTag: vi.fn((id, updates) => Promise.resolve({
    id,
    name: updates.name || '工作',
    color: updates.color || '#FF5722',
    usageCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  })),
  deleteTag: vi.fn(),
  tagExists: vi.fn(() => Promise.resolve(false)),
  addTagToTask: vi.fn(() => Promise.resolve({
    id: 'tt-1',
    taskId: 'task-1',
    tagId: 'test-tag-id',
    createdAt: '2024-01-01T00:00:00.000Z',
  })),
  removeTagFromTask: vi.fn(),
  getTagsByTaskId: vi.fn(() => Promise.resolve([])),
  getTasksByTagId: vi.fn(() => Promise.resolve([])),
  deleteAllTaskTags: vi.fn(),
}))

describe('tagStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useTagStore.setState({
      tags: [],
      taskTagMap: {},
      selectedTagIds: [],
    })
  })

  it('should initialize with empty tags', () => {
    expect(useTagStore.getState().tags).toEqual([])
    expect(useTagStore.getState().selectedTagIds).toEqual([])
  })

  it('should create a new tag successfully', async () => {
    await useTagStore.getState().createTag('工作', '#FF5722')

    expect(useTagStore.getState().tags).toHaveLength(1)
    expect(useTagStore.getState().tags[0].name).toBe('工作')
  })

  it('should use default color if not provided', async () => {
    await useTagStore.getState().createTag('默认标签')

    expect(useTagStore.getState().tags[0].color).toBe('#FF5722')
  })

  it('should reject empty tag name', async () => {
    const result = await useTagStore.getState().createTag('   ')

    expect(result.success).toBe(false)
    expect(result.error).toBe('标签名称不能为空')
  })

  it('should reject duplicate tag name', async () => {
    const { tagExists } = await import('../db/tags')
    vi.mocked(tagExists).mockResolvedValueOnce(true)

    const result = await useTagStore.getState().createTag('已存在')

    expect(result.success).toBe(false)
    expect(result.error).toBe('标签名称已存在')
  })

  it('should update a tag successfully', async () => {
    useTagStore.setState({
      tags: [{
        id: 'tag-1',
        name: '旧名称',
        color: '#FF5722',
        usageCount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      }],
    })

    await useTagStore.getState().updateTag('tag-1', { name: '新名称' })

    expect(useTagStore.getState().tags[0].name).toBe('新名称')
  })

  it('should delete a tag and clean up associations', async () => {
    useTagStore.setState({
      tags: [{
        id: 'tag-to-delete',
        name: '删除标签',
        color: '#FF5722',
        usageCount: 2,
        createdAt: '2024-01-01T00:00:00.000Z',
      }],
    })

    await useTagStore.getState().deleteTag('tag-to-delete')

    expect(useTagStore.getState().tags).toHaveLength(0)
  })

  it('should add a tag to a task', async () => {
    useTagStore.setState({
      tags: [{
        id: 'tag-1',
        name: '工作',
        color: '#FF5722',
        usageCount: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      }],
      taskTagMap: {},
    })

    await useTagStore.getState().addTagToTask('task-1', 'tag-1')

    expect(useTagStore.getState().taskTagMap['task-1']).toContain('tag-1')
  })

  it('should remove a tag from a task', async () => {
    useTagStore.setState({
      tags: [{
        id: 'tag-1',
        name: '工作',
        color: '#FF5722',
        usageCount: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
      }],
      taskTagMap: {
        'task-1': ['tag-1'],
      },
    })

    await useTagStore.getState().removeTagFromTask('task-1', 'tag-1')

    expect(useTagStore.getState().taskTagMap['task-1']).not.toContain('tag-1')
  })

  it('should select a tag for filtering', () => {
    useTagStore.getState().selectTag('tag-1')

    expect(useTagStore.getState().selectedTagIds).toContain('tag-1')
  })

  it('should deselect a tag', () => {
    useTagStore.setState({ selectedTagIds: ['tag-1', 'tag-2'] })
    useTagStore.getState().deselectTag('tag-1')

    expect(useTagStore.getState().selectedTagIds).not.toContain('tag-1')
    expect(useTagStore.getState().selectedTagIds).toContain('tag-2')
  })

  it('should clear all tag filters', () => {
    useTagStore.setState({ selectedTagIds: ['tag-1', 'tag-2'] })
    useTagStore.getState().clearTagFilter()

    expect(useTagStore.getState().selectedTagIds).toEqual([])
  })

  it('should toggle tag selection', () => {
    useTagStore.getState().selectTag('tag-1')
    expect(useTagStore.getState().selectedTagIds).toContain('tag-1')

    useTagStore.getState().selectTag('tag-1')
    expect(useTagStore.getState().selectedTagIds).not.toContain('tag-1')
  })
})
