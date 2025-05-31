import React, { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import AddFileIcon from '../icons/AddFileIcon';
import type { Part } from '@google/genai';
import FileIcon from '../icons/FileIcon';

interface Props {
    onSend: (text: string) => void;
    disabled: boolean;
    onAttachClick: () => void;
    pendingFileParts: (Part & {
        fileName?: string;
    })[]
    removePendingFile: (fileUri?: string) => void
}

export default function ChatFooter({ onSend, disabled, pendingFileParts, onAttachClick, removePendingFile }: Props) {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !disabled) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <footer className="p-4 bg-surface shadow-inner absolute bottom-0 w-full">
            <div className='flex gap-3 max-w-full overflow-x-auto'>
                {pendingFileParts?.map(file =>
                    <div className='flex flex-col items-center text-text cursor-pointer hover:text-border' onClick={() => removePendingFile(file.fileData?.fileUri)}>
                        <FileIcon />
                        {file.fileName}
                    </div>
                )}
            </div>
            <div className="max-w-5xl mx-auto flex gap-2">
                <button
                    onClick={onAttachClick}
                    className="text-text hover:text-border cursor-pointer"
                >
                    <AddFileIcon />
                </button>
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
                    onClick={() => {
                        if (!disabled) {
                            onSend(input);
                            setInput('');
                        }
                    }}
                    disabled={disabled}
                    className="bg-primary text-white dark:text-gray-950 px-4 py-2 rounded hover:opacity-75 active:opacity-50 disabled:opacity-50 cursor-pointer"
                >
                    Надіслати
                </button>
            </div>
        </footer>
    );
}
