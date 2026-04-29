import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ListManager from './ListManager'
import { useListStore } from '../store/listStore'

vi.mock('../store/listStore', () => ({
  useListStore: vi.fn(),
}))

const mockAddList = vi.fn()

describe('ListManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useListStore as any).mockReturnValue({
      addList: mockAddList,
    })
  })

  const mockOnOpen = vi.fn()
  const mockOnClose = vi.fn()

  const renderListManager = (props: { isOpen?: boolean } = {}) => {
    const { isOpen = false } = props
    return render(<ListManager isOpen={isOpen} onClose={mockOnClose} onOpen={mockOnOpen} />)
  }

  it('should show create button initially', () => {
    renderListManager()

    expect(screen.getByText('+ 新建分组')).toBeInTheDocument()
  })

  it('should show create form when button is clicked', () => {
    renderListManager()

    fireEvent.click(screen.getByText('+ 新建分组'))

    expect(screen.getByPlaceholderText('分组名称')).toBeInTheDocument()
  })

  it('should call addList on confirm', () => {
    mockAddList.mockResolvedValue({ success: true })
    renderListManager()

    fireEvent.click(screen.getByText('+ 新建分组'))
    fireEvent.change(screen.getByPlaceholderText('分组名称'), { target: { value: '新分组' } })
    fireEvent.click(screen.getByText('确认'))

    expect(mockAddList).toHaveBeenCalledWith('新分组', '#3B82F6', 'list')
  })

  it('should close form on cancel', () => {
    renderListManager()

    fireEvent.click(screen.getByText('+ 新建分组'))
    fireEvent.click(screen.getByText('取消'))

    expect(screen.queryByPlaceholderText('分组名称')).not.toBeInTheDocument()
    expect(screen.getByText('+ 新建分组')).toBeInTheDocument()
  })

  it('should show error message when addList fails', async () => {
    mockAddList.mockResolvedValue({ success: false, error: '分组名称已存在' })
    renderListManager()

    fireEvent.click(screen.getByText('+ 新建分组'))
    fireEvent.change(screen.getByPlaceholderText('分组名称'), { target: { value: '重复分组' } })
    fireEvent.click(screen.getByText('确认'))

    expect(await screen.findByText('分组名称已存在')).toBeInTheDocument()
  })

  it('should allow selecting colors', () => {
    renderListManager()

    fireEvent.click(screen.getByText('+ 新建分组'))

    const input = screen.getByPlaceholderText('分组名称')
    expect(input).toBeInTheDocument()

    const container = input.closest('div')
    expect(container).toBeInTheDocument()

    const colorButtons = container!.querySelectorAll('button')
    expect(colorButtons.length).toBeGreaterThanOrEqual(6)
  })
})
