export default function TitleBar() {
  return (
    <div
      className="h-9 flex items-center justify-between px-4 select-none"
      style={{
        WebkitAppRegion: 'drag',
        backgroundColor: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center">
        <span className="text-sm font-medium text-[var(--color-text)]">Todo</span>
      </div>

      <div
        className="flex items-center"
        style={{ WebkitAppRegion: 'no-drag' }}
      >
        <button
          onClick={() => (window as any).electronAPI?.minimizeWindow()}
          className="w-12 h-9 flex items-center justify-center hover:bg-[var(--color-hover)] transition-colors"
          title="最小化"
        >
          <svg className="w-4 h-4 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        </button>
        <button
          onClick={() => (window as any).electronAPI?.maximizeWindow()}
          className="w-12 h-9 flex items-center justify-center hover:bg-[var(--color-hover)] transition-colors"
          title="最大化"
        >
          <svg className="w-4 h-4 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="4" width="16" height="16" rx="1" />
          </svg>
        </button>
        <button
          onClick={() => (window as any).electronAPI?.closeWindow()}
          className="w-12 h-9 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
          title="关闭"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
