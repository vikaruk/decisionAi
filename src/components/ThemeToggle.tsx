import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();
    return (
        <button
            onClick={toggle}
            className="p-2 rounded border border-border text-primary cursor-pointer hover:bg-border dark:hover:bg-gray-700 active:opacity-75"
        >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
    );
}