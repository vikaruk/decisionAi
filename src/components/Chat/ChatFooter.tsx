import { useState, type ChangeEvent, type KeyboardEvent } from 'react';

interface Props { onSend: (text: string) => void; disabled: boolean; }

export default function ChatFooter({ onSend, disabled }: Props) {
    const [input, setInput] = useState('');
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !disabled) { onSend(input); setInput(''); }
    };

    return (
        <footer className="p-4 bg-surface shadow-inner absolute bottom-0 w-full">
            <div className="max-w-5xl mx-auto flex gap-2">
                <input
                    type="text"
                    className="flex-1 placeholder-placeholder text-text border border-border bg-white dark:bg-background rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Ваше запитання..."
                    value={input}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />
                <button
                    onClick={() => { onSend(input); setInput(''); }}
                    disabled={disabled}
                    className="bg-primary text-white dark:text-gray-950 px-4 py-2 rounded hover:opacity-75 active:opacity-50 disabled:opacity-50 cursor-pointer"
                >
                    Надіслати
                </button>
            </div>
        </footer>
    );
}