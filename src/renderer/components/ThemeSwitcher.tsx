import { useThemeStore } from '../store/themeStore'
import { themes } from '../config/themes'

export default function ThemeSwitcher() {
  const { currentThemeId, switchTheme } = useThemeStore()

  return (
    <div className="flex flex-col gap-3">
      {themes.map((theme) => {
        const isSelected = currentThemeId === theme.id

        return (
          <button
            key={theme.id}
            onClick={() => switchTheme(theme.id)}
            aria-pressed={isSelected}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
              isSelected
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] bg-opacity-30'
                : 'border-[var(--color-border)] hover:border-[var(--color-accent-light)] hover:bg-[var(--color-hover)]'
            }`}
          >
            <div
              data-testid="color-swatch"
              className="w-8 h-8 rounded-full border border-[var(--color-border)] shadow-sm"
              style={{ backgroundColor: theme.accent }}
            />
            <span className="text-sm font-medium text-[var(--color-text)]">
              {theme.name}
            </span>
            {isSelected && (
              <span className="ml-auto text-[var(--color-accent)] font-semibold">
                ✓
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
