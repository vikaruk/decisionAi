import { useMemo, useState, type ChangeEvent } from 'react';
import { pollFileStatus, uploadFile } from '../api/gemini';
import { createPartFromUri, type Content } from '@google/genai';
import Spinner from './Spinner';
import { v4 as uuid } from 'uuid';
import type { Session } from '../types';

interface Props {
    addSession: (session: Session) => void;
    setCurrentSessionId: React.Dispatch<React.SetStateAction<string | null>>
    history: Content[]
    currentSession: Session | null
}
export default function FileUploader({ addSession, setCurrentSessionId, history, currentSession }: Props) {
    const [fileLoading, setFileLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const disable = useMemo(() => !!history?.length, [history])

    const processFile = async (file: File) => {
        setFileLoading(true);
        try {
            const uploaded = await uploadFile(file);
            const status = await pollFileStatus(uploaded.name!);
            const filePart = createPartFromUri(status.uri!, file.type);
            const message = { role: 'user', parts: [{ text: 'Будь ласка, проаналізуй цей документ:' }, filePart] };
            const id = uuid();
            const session: Session = { id, title: file.name, history: [message] };
            addSession(session);
            setCurrentSessionId(id);
        } catch (err) {
            console.error(err);
            alert('Не вдалося обробити файл.');
        } finally {
            setFileLoading(false);
            setDragActive(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!fileLoading) setDragActive(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (fileLoading) return;
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    return (
        <div className="mb-4">
            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                htmlFor="file-input"
                className={`
                    flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-lg select-none transition-colors p-8 text-center
                    ${disable ? 'opacity-50 cursor-no-drop' : `cursor-pointer ${dragActive ? 'bg-primary/25' : ''} ${fileLoading ? 'opacity-50 cursor-wait' : 'hover:bg-primary/25'}`}
                `}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleInputChange}
                    disabled={fileLoading || disable}
                    className="sr-only"
                />
                <span className="text-gray-500 dark:text-gray-400">
                    {currentSession?.title || <>Завантажити <strong>PDF</strong> або <strong>TXT</strong></>}
                </span>
                {fileLoading && <Spinner />}
            </label>
        </div>
    );
}