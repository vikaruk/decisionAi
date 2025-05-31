import { useEffect, useState } from 'react';

export default function ThinkingDots() {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length < 3 ? prev + '.' : ''));
        }, 500); // Кожні 500 мс змінюється кількість крапок
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-left text-fifth dark:text-eighth font-medium">
            Думаю{dots}
        </div>
    );
}
