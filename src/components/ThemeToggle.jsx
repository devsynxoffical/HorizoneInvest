import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

function ThemeToggle({ compact = false, className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      className={`theme-toggle ${compact ? 'theme-toggle-compact' : ''} ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {!compact ? <span>{isDark ? 'Light' : 'Dark'}</span> : null}
    </button>
  )
}

export default ThemeToggle
