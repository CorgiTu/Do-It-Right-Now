import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useListStore } from './listStore'

const mockInitDB = vi.fn()
const mockGetAllFromIndex = vi.fn()

vi.mock('../db/lists', () => ({
  createList: vi.fn(() => Promise.resolve({
    id: 'test-list-id',
    name: '测试分组',
    color: '#3B82F6',
    icon: 'list',
    order: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  })),
  getAllLists: vi.fn(() => Promise.resolve([])),
  updateList: vi.fn(),
  deleteList: vi.fn(),
  listExists: vi.fn(() => Promise.resolve(false)),
  createDefaultList: vi.fn(() => Promise.resolve({
    id: 'default-list-id',
    name: '默认分组',
    color: '#3B82F6',
    icon: 'inbox',
    order: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  })),
}))

vi.mock('../db/tasks', () => ({
  initDB: () => mockInitDB(),
  LISTS_STORE_NAME: 'lists',
}))

describe('listStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInitDB.mockResolvedValue({
      getAllFromIndex: mockGetAllFromIndex.mockResolvedValue([]),
    })
    useListStore.setState({
      lists: [],
      selectedListId: 'all',
      loading: false,
      error: null,
    })
  })

  it('should initialize with empty lists', () => {
    expect(useListStore.getState().lists).toEqual([])
  })

  it('should add a new list successfully', async () => {
    const result = await useListStore.getState().addList('测试分组', '#3B82F6', 'list')

    expect(result.success).toBe(true)
    expect(useListStore.getState().lists).toHaveLength(1)
    expect(useListStore.getState().lists[0].name).toBe('测试分组')
  })

  it('should reject empty list name', async () => {
    const result = await useListStore.getState().addList('   ', '#3B82F6', 'list')

    expect(result.success).toBe(false)
    expect(result.error).toBe('分组名称不能为空')
  })

  it('should reject duplicate list name', async () => {
    const { listExists } = await import('../db/lists')
    vi.mocked(listExists).mockResolvedValueOnce(true)

    const result = await useListStore.getState().addList('已存在', '#3B82F6', 'list')

    expect(result.success).toBe(false)
    expect(result.error).toBe('分组名称已存在')
  })

  it('should select a list', () => {
    useListStore.getState().selectList('test-id')

    expect(useListStore.getState().selectedListId).toBe('test-id')
  })

  it('should remove a list with no tasks', async () => {
    mockGetAllFromIndex.mockResolvedValueOnce([])
    useListStore.setState({
      lists: [{
        id: 'test-list-id',
        name: '测试分组',
        color: '#3B82F6',
        icon: 'list',
        order: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      }],
    })

    const result = await useListStore.getState().removeList('test-list-id')

    expect(result).toBe(true)
    expect(useListStore.getState().lists).toHaveLength(0)
  })

  it('should not remove a list with tasks', async () => {
    mockGetAllFromIndex.mockResolvedValueOnce([{ id: 'task-1' }])
    useListStore.setState({
      lists: [{
        id: 'test-list-id',
        name: '测试分组',
        color: '#3B82F6',
        icon: 'list',
        order: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      }],
    })

    const result = await useListStore.getState().removeList('test-list-id')

    expect(result).toBe(false)
  })

  it('should reset selection to all when removing selected list', async () => {
    mockGetAllFromIndex.mockResolvedValueOnce([])
    useListStore.setState({
      lists: [{
        id: 'selected-list-id',
        name: '选中分组',
        color: '#10B981',
        icon: 'list',
        order: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      }],
      selectedListId: 'selected-list-id',
    })

    await useListStore.getState().removeList('selected-list-id')

    expect(useListStore.getState().selectedListId).toBe('all')
  })
})
