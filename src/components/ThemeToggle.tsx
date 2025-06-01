import { useTheme } from '../context/ThemeContext';
import LightThemeIcon from './icons/LightThemeIcon';
import NightThemeIcon from './icons/NightThemeIcon';

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();
    return (
        <button
            onClick={toggle}
            className="p-2 flex items-center gap-2 bg-transparent rounded border border-sixth text-fifth dark:text-eighth dark:bg-[#253A33] dark:border-none cursor-pointer hover:bg-sixth dark:hover:bg-sixth active:opacity-75"
        >
            {theme === 'light' ?

                <><NightThemeIcon className='text-primary dark:text-[#5CA28F]' />Dark</>
                :
                <><LightThemeIcon className='text-primary dark:text-[#5CA28F]' />Light</>

            }
        </button>
    );
}