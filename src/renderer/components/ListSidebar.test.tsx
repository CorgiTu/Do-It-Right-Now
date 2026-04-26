import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ListSidebar from './ListSidebar'
import { useListStore } from '../store/listStore'

vi.mock('../store/listStore', () => ({
  useListStore: vi.fn(),
}))

vi.mock('./ListManager', () => ({
  default: () => <div data-testid="list-manager">ListManager</div>,
}))

const mockSelectList = vi.fn()

describe('ListSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockLists = [
    { id: 'list-1', name: '工作', color: '#3B82F6', icon: 'briefcase', order: 0, createdAt: '2024-01-01' },
    { id: 'list-2', name: '个人', color: '#10B981', icon: 'home', order: 1, createdAt: '2024-01-01' },
  ]

  it('should render "全部任务" option', () => {
    ;(useListStore as any).mockReturnValue({
      lists: mockLists,
      selectedListId: 'all',
      selectList: mockSelectList,
    })

    render(<ListSidebar onListSelect={vi.fn()} />)

    expect(screen.getByText('全部任务')).toBeInTheDocument()
  })

  it('should render all lists', () => {
    ;(useListStore as any).mockReturnValue({
      lists: mockLists,
      selectedListId: 'all',
      selectList: mockSelectList,
    })

    render(<ListSidebar onListSelect={vi.fn()} />)

    expect(screen.getByText('工作')).toBeInTheDocument()
    expect(screen.getByText('个人')).toBeInTheDocument()
  })

  it('should highlight selected list', () => {
    ;(useListStore as any).mockReturnValue({
      lists: mockLists,
      selectedListId: 'list-1',
      selectList: mockSelectList,
    })

    render(<ListSidebar onListSelect={vi.fn()} />)

    const 全部任务 = screen.getByText('全部任务').closest('div')!
   expect(全部任务).not.toHaveClass('bg-[var(--color-accent-light)]')

    fireEvent.click(screen.getByText('工作'))

    const 工作 = screen.getByText('工作').closest('div')!
    expect(工作).toHaveClass('bg-[var(--color-accent-light)]')
    expect(工作).toHaveClass('font-medium')
  })

  it('should call onListSelect when list is clicked', () => {
    const mockOnListSelect = vi.fn()
    ;(useListStore as any).mockReturnValue({
      lists: mockLists,
      selectedListId: 'all',
      selectList: mockSelectList,
    })

    render(<ListSidebar onListSelect={mockOnListSelect} />)

    fireEvent.click(screen.getByText('工作'))

    expect(mockSelectList).toHaveBeenCalledWith('list-1')
    expect(mockOnListSelect).toHaveBeenCalledWith('list-1')
  })

  it('should render ListManager component', () => {
    ;(useListStore as any).mockReturnValue({
      lists: mockLists,
      selectedListId: 'all',
      selectList: mockSelectList,
    })

    render(<ListSidebar onListSelect={vi.fn()} />)

    expect(screen.getByTestId('list-manager')).toBeInTheDocument()
  })

  it('should show list color indicators', () => {
    ;(useListStore as any).mockReturnValue({
      lists: mockLists,
      selectedListId: 'all',
      selectList: mockSelectList,
    })

    render(<ListSidebar onListSelect={vi.fn()} />)

    const colorSpans = screen.getAllByRole('generic').filter(
      (el) => el.style.backgroundColor !== ''
    )
    expect(colorSpans.length).toBeGreaterThanOrEqual(2)
  })
})
