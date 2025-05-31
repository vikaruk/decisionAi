import { useState, useEffect } from 'react';
import { createChat, extractTitleFromFile } from '../api/gemini';
import type { Chat, Content, Part } from '@google/genai';
import type { Session } from '../types';
import { v4 as uuid } from 'uuid';
import { extractFilePart } from '../utils/transform';

interface Props {
    currentSession: Session | null;
    updateSession: (id: string, history: Session['history']) => void;
    setCurrentSessionId: React.Dispatch<React.SetStateAction<string | null>>
    addSession: (session: Session) => void
}

export function useChat({ currentSession, updateSession, addSession, setCurrentSessionId }: Props) {
    const [history, setHistory] = useState<Content[]>([]);
    const [chat, setChat] = useState<Chat | null>(null);
    const [sending, setSending] = useState(false);

    const [pendingFileParts, setPendingFileParts] = useState<(Part & { fileName?: string })[]>([]);

    useEffect(() => {
        if (currentSession) {
            setHistory(currentSession.history);
            setChat(createChat(currentSession.history.map(h => ({ role: h.role, parts: h.parts }))));
            setPendingFileParts([]); // при перемиканні сесії чистимо pending
        } else {
            setHistory([]);
            setChat(null);
            setPendingFileParts([]);
        }
    }, [currentSession?.id]);

    const removePendingFile = (fileUri?: string) => {
        if (!fileUri) return
        setPendingFileParts(prev => prev.filter(s => s.fileData?.fileUri !== fileUri));
    }

    const addPendingFiles = (fileParts: Part[]) => {
        setPendingFileParts(prev => [...prev, ...fileParts]);
    };

    const updateOrCreateSession = async (finalHistory: Content[]) => {
        if (currentSession) {
            updateSession(currentSession.id, finalHistory);
        } else {
            const id = uuid();
            const filePart = extractFilePart(pendingFileParts[0]) || null
            const titleSession = await extractTitleFromFile(filePart) || 'Новий чат'
            const session: Session = { id, title: titleSession, history: finalHistory };
            addSession(session);
            setCurrentSessionId(id);
        }
    }

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        const localChat = chat ? chat : createChat()
        const userContent = { role: 'user', parts: [{ text }, ...pendingFileParts.map(p => extractFilePart(p))], fileNames: pendingFileParts.map(p => p.fileName) };
        setHistory(prev => [...prev, userContent]);

        setHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

        setSending(true);
        let accumulated = '';

        try {
            const userPart = userContent.parts.map(p => extractFilePart(p))
            const stream = await localChat.sendMessageStream({ message: userPart });

            for await (const part of stream) {
                accumulated += part.text;
                setHistory(prev => {
                    const copy = [...prev];
                    copy[copy.length - 1] = { role: 'model', parts: [{ text: accumulated }] };
                    return copy;
                });
            }

            const botMsg: Content = { role: 'model', parts: [{ text: accumulated }] };

            const finalHistory = [
                ...currentSession?.history || [],
                userContent,
                botMsg
            ];

            await updateOrCreateSession(finalHistory)
        } catch {
            const errorMsg: Content = {
                role: 'model',
                parts: [{ text: '❌ Помилка при зверненні до API' }],
            };
            setHistory(prev => [...prev, errorMsg]);
        } finally {
            setPendingFileParts([]);
            setSending(false);
        }
    };

    return { sendMessage, sending, history, pendingFileParts, addPendingFiles, removePendingFile };
}
