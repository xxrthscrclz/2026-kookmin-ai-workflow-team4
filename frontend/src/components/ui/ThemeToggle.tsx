import { useThemeStore } from '@/stores/themeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      onClick={toggleTheme}
      className="theme-switch"
    >
      <span className="theme-switch-track">
        <span className="theme-switch-icon theme-switch-icon-light" aria-hidden="true">
          ☀️
        </span>
        <span className="theme-switch-icon theme-switch-icon-dark" aria-hidden="true">
          🌙
        </span>
        <span
          className={`theme-switch-thumb ${isDark ? 'theme-switch-thumb-dark' : ''}`}
          aria-hidden="true"
        />
      </span>
    </button>
  );
}
