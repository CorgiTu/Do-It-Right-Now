import { themes } from '../config/themes'
import { useThemeStore } from '../store/themeStore'
import type { ThemeId } from '../types/theme'

export default function ThemeSwitcher() {
  const { themeId, setTheme } = useThemeStore()

  return (
    <div>
      <h3 className="text-sm font-semibold text-coinbase-ink mb-3 px-1">主题</h3>
      <div className="flex gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id as ThemeId)}
            className={`
              flex-1 px-3 py-2 rounded-coinbase-sm text-sm font-medium transition-all duration-200
              ${themeId === theme.id
                ? 'bg-coinbase-primary text-coinbase-on-primary shadow-sm'
                : 'bg-coinbase-surface-strong text-coinbase-body hover:bg-coinbase-hover'
              }
            `}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  )
}
