import { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import type { Session } from '../types';

const STORAGE_KEY = 'geminiChatSessions';

export function useSessions() {
    const [sessions, setSessions] = useState<Session[]>(() => getStorage(STORAGE_KEY) || []);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessions[0]?.id || null);

    useEffect(() => {
        setStorage(STORAGE_KEY, sessions);
    }, [sessions]);

    const addSession = (session: Session) => setSessions(prev => [session, ...prev]);
    const updateSession = (id: string, history: Session['history']) =>
        setSessions(prev => prev.map(s => s.id === id ? { ...s, history } : s));
    const deleteSession = (id: string) => {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (id === currentSessionId) setCurrentSessionId(() => {
            const others = sessions.filter(s => s.id !== id);
            return others[0]?.id || null;
        });
    };

    const currentSession = sessions.find(s => s.id === currentSessionId) ?? null;
    return { sessions, currentSessionId, setCurrentSessionId, currentSession, addSession, updateSession, deleteSession };
}