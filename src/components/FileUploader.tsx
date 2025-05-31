import React, { useState, type ChangeEvent } from 'react';
import Spinner from './Spinner';

interface Props {
    addFilesToExistingSession: (files: FileList) => Promise<void>;
    onFinish: () => void;
    disable: boolean;
}

export default function FileUploader({
    addFilesToExistingSession,
    onFinish,
    disable,
}: Props) {
    const [fileLoading, setFileLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleAddFiles = async (files: FileList) => {
        setFileLoading(true);
        try {
            await addFilesToExistingSession(files);
        } catch (err) {
            console.error(err);
            alert('Не вдалося обробити файл(и).');
        } finally {
            setFileLoading(false);
            setDragActive(false);
            onFinish();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!fileLoading && !disable) setDragActive(true);
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
        const files = e.dataTransfer.files;
        if (!files || files.length === 0 || disable) return;
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (isValidFile(file.name, file.type)) {
                validFiles.push(file);
            } else {
                invalidFiles.push(file.name);
            }
        }
        if (invalidFiles.length > 0) {
            alert(
                `Файли з недопустимими розширеннями:\n${invalidFiles.join(
                    ', '
                )}\nДозволені лише .pdf, .txt`
            );
        }
        if (validFiles.length > 0) {
            const dataTransfer = new DataTransfer();
            validFiles.forEach((f) => dataTransfer.items.add(f));
            handleAddFiles(dataTransfer.files);
        }

    };

    const isValidFile = (filename: string, mimeType: string): boolean => {
        const lowerName = filename.toLowerCase();
        const extOk = lowerName.endsWith('.pdf') || lowerName.endsWith('.txt');
        const mimeOk =
            mimeType === 'application/pdf' || mimeType === 'text/plain';
        console.log(extOk, mimeOk)
        return extOk && mimeOk;
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || disable) return;
        handleAddFiles(files)
        e.target.value = '';
    };

    return (
        <div className="mb-4 w-[90%]">
            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                htmlFor="file-input"
                className={` relative flex flex-col items-center justify-center transition-colors p-8 text-center border-2 
                    border-dashed border-primary rounded-lg select-none  
                     ${disable ? 'opacity-50 cursor-no-drop' : `cursor-pointer ${dragActive ? '!bg-primary/25' : ''} 
                    ${fileLoading ? 'opacity-50 cursor-wait' : 'hover:bg-sixth dark:hover:bg-sixth'} bg-third `}
        `}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.txt"
                    multiple
                    onChange={handleInputChange}
                    disabled={disable || fileLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {!fileLoading ? (
                    <span className="text-fifth">
                        Завантажити <strong>PDF</strong> або <strong>TXT</strong>
                        <br />
                        або перетягніть файли сюди
                    </span>
                ) : (
                    <Spinner />
                )}
            </label>
        </div>
    );
}
