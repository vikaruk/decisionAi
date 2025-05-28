import { useState, useEffect } from 'react';
import { createChat } from '../api/gemini';
import type { Chat, Content } from '@google/genai';
import type { Session } from '../types';

interface Props {
    currentSession: Session | null;
    updateSession: (id: string, history: Session["history"]) => void
}
export function useChat({ currentSession, updateSession }: Props) {
    const [history, setHistory] = useState<Content[]>([]);
    const [chat, setChat] = useState<Chat | null>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (currentSession) {
            setHistory(currentSession.history);
            setChat(createChat(currentSession.history));
        } else {
            setHistory([]);
            setChat(null);
        }
    }, [currentSession?.history]);

    const sendMessage = async (text: string) => {
        if (!chat || !text.trim() || !currentSession) return;
        const userMsg: Content = { role: 'user', parts: [{ text }] };
        setHistory(prev => [...prev, userMsg]);
        setSending(true);
        setHistory(prev => {
            if (!prev) return prev;
            return ([
                ...prev,
                { role: 'model', parts: [{ text: '' }] },
            ]);
        });

        let accumulated = '';
        try {
            const stream = await chat.sendMessageStream({ message: text });
            for await (const part of stream) {
                accumulated += part.text;
                setHistory(prev => {
                    if (!prev) return prev;
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: accumulated }] };
                    return [...newHistory];
                });
            }
            const botMsg: Content = { role: 'model', parts: [{ text: accumulated }] };
            updateSession(currentSession.id, [...currentSession.history, userMsg, botMsg]);
        } catch {
            const errorMsg: Content = { role: 'model', parts: [{ text: '❌ Помилка при зверненні до API' }] };
            setHistory(prev => [...prev, errorMsg]);
        } finally {
            setSending(false);
        }
    };

    return { sendMessage, sending, history };
}