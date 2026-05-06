import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDialog from './ConfirmDialog'

describe('ConfirmDialog', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    isOpen: true,
    title: '确认删除',
    message: '确定要删除此任务吗？',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render when isOpen is true', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('确认删除')).toBeInTheDocument()
    expect(screen.getByText('确定要删除此任务吗？')).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('确认删除')).not.toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)

    const confirmButton = screen.getByText('确认')
    fireEvent.click(confirmButton)

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)

    const cancelButton = screen.getByText('取消')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when overlay is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)

    // 点击遮罩层（overlay）
    const overlay = screen.getByTestId('confirm-dialog-overlay')
    fireEvent.click(overlay)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('should not call onConfirm when overlay is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />)

    const overlay = screen.getByTestId('confirm-dialog-overlay')
    fireEvent.click(overlay)

    expect(mockOnConfirm).not.toHaveBeenCalled()
  })
})
