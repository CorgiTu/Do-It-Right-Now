import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RecurrencePicker from '../components/RecurrencePicker'

describe('RecurrencePicker', () => {
  const mockOnChange = vi.fn()

  const defaultProps = {
    taskId: '1',
    currentPattern: null as any,
    onChange: mockOnChange,
  }

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('should render recurrence button', () => {
    render(<RecurrencePicker {...defaultProps} />)
    expect(screen.getByText('设置重复')).toBeInTheDocument()
  })

  it('should show frequency options when opened', () => {
    render(<RecurrencePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('设置重复'))
    expect(screen.getByText('每日')).toBeInTheDocument()
    expect(screen.getByText('每周')).toBeInTheDocument()
    expect(screen.getByText('每月')).toBeInTheDocument()
    expect(screen.getByText('每年')).toBeInTheDocument()
    expect(screen.getByText('自定义')).toBeInTheDocument()
    expect(screen.getByText('不重复')).toBeInTheDocument()
  })

  it('should call onChange with null pattern when "不重复" is selected and saved', () => {
    render(<RecurrencePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('设置重复'))
    fireEvent.click(screen.getByText('不重复'))
    fireEvent.click(screen.getByText('确定'))
    expect(mockOnChange).toHaveBeenCalledWith({ pattern: null })
  })

  it('should call onChange with daily pattern when "每日" is selected and saved', () => {
    render(<RecurrencePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('设置重复'))
    fireEvent.click(screen.getByText('每日'))
    fireEvent.click(screen.getByText('确定'))
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ pattern: 'daily', interval: 1 })
    )
  })

  it('should show weekday selector when "每周" is selected', () => {
    render(<RecurrencePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('设置重复'))
    fireEvent.click(screen.getByText('每周'))
    expect(screen.getByText('选择星期')).toBeInTheDocument()
  })

  it('should show month day selector when "每月" is selected', () => {
    render(<RecurrencePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('设置重复'))
    fireEvent.click(screen.getByText('每月'))
    expect(screen.getByText('选择日期')).toBeInTheDocument()
  })

  it('should show error when weekly pattern is selected without any days', () => {
    render(<RecurrencePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('设置重复'))
    fireEvent.click(screen.getByText('每周'))
    fireEvent.click(screen.getByText('确定'))
    expect(screen.getByText('请至少选择一个星期')).toBeInTheDocument()
  })

  it('should not call onChange when cancel is clicked', () => {
    render(<RecurrencePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('设置重复'))
    fireEvent.click(screen.getByText('每日'))
    fireEvent.click(screen.getByText('取消'))
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('should show exception date section when pattern is selected', () => {
    render(<RecurrencePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('设置重复'))
    fireEvent.click(screen.getByText('每日'))
    expect(screen.getByText('例外日期')).toBeInTheDocument()
  })

  it('should show end condition section when pattern is selected', () => {
    render(<RecurrencePicker {...defaultProps} />)
    fireEvent.click(screen.getByText('设置重复'))
    fireEvent.click(screen.getByText('每日'))
    expect(screen.getByText('结束条件')).toBeInTheDocument()
  })
})
