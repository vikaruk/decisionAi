import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { v4 as uuid } from 'uuid';
import { Chat, GoogleGenAI, createPartFromUri, type Content } from '@google/genai';
import Spinner from './components/Spinner';
import ThinkingDots from './components/ThinkingDots';

type Message = { role: 'user' | 'bot'; text: string };
type Session = {
    id: string;
    title: string;
    messages: Message[];
};

const STORAGE_KEY = 'geminiChatSessions';
const MODEL = 'gemini-2.0-flash';

export default function GeminiChatWithMultiPDF() {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY });

    // Load sessions from localStorage
    const [sessions, setSessions] = useState<Session[]>(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    });
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(
        sessions[0]?.id || null
    );
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [fileReady, setFileReady] = useState(false);
    const [fileLoading, setFileLoading] = useState(false);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Persist sessions
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }, [sessions]);

    // When session changes: rebuild Chat from its messages
    useEffect(() => {
        if (!currentSessionId) {
            setChat(null);
            setMessages([]);
            setFileReady(false);
            return;
        }
        const sess = sessions.find(s => s.id === currentSessionId)!;
        setMessages(sess.messages);
        setFileReady(sess.messages.length > 0);

        // Recreate Chat with full history as text-only Content
        const history: Content[] = sess.messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }],
        }));
        const resumed = ai.chats.create({ model: MODEL, history });
        setChat(resumed);
    }, [currentSessionId]);

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    // "+ Новий" clears selection so user must upload
    const handleNew = () => {
        setCurrentSessionId(null);
    };

    // File upload creates a new session
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileLoading(true);
        try {
            // Upload file
            const up = await ai.files.upload({ file, config: { displayName: file.name } });
            let status = await ai.files.get({ name: up.name! });
            while (status.state === 'PROCESSING') {
                await new Promise(r => setTimeout(r, 2000));
                status = await ai.files.get({ name: up.name! });
            }
            if (status.state === 'FAILED') throw new Error();

            const part = createPartFromUri(status.uri!, file.type);
            const initText = 'Будь ласка, проаналізуй цей документ:';
            const newChat = ai.chats.create({
                model: MODEL,
                history: [{ role: 'user', parts: [{ text: initText }, part] }],
            });

            const id = uuid();
            const session: Session = {
                id,
                title: file.name,
                messages: [{ role: 'user', text: initText }],
            };
            setSessions(prev => [session, ...prev]);
            setCurrentSessionId(id);
            setChat(newChat);
            setMessages(session.messages);
            setFileReady(true);
        } catch {
            alert('Не вдалося обробити файл.');
        } finally {
            setFileLoading(false);
        }
    };

    // Cancel resets current session context
    const handleCancel = () => {
        if (!currentSessionId) return;
        setSessions(prev =>
            prev.map(s =>
                s.id === currentSessionId ? { ...s, messages: [] } : s
            )
        );
        handleNew();
    };

    // Delete removes session
    const deleteSession = (id: string) => {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (id === currentSessionId) {
            setCurrentSessionId(sessions.filter(s => s.id !== id)[0]?.id || null);
        }
    };

    // Send a message
    const sendMessage = async () => {
        if (!chat || !input.trim() || !currentSessionId) return;
        const userMsg: Message = { role: 'user', text: input.trim() };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setSessions(prev =>
            prev.map(s =>
                s.id === currentSessionId ? { ...s, messages: updated } : s
            )
        );
        setInput('');
        setSending(true);

        try {
            const res = await chat.sendMessage({ message: userMsg.text });
            const botMsg: Message = { role: 'bot', text: res.text || '' };
            const after = [...updated, botMsg];
            setMessages(after);
            setSessions(prev =>
                prev.map(s =>
                    s.id === currentSessionId ? { ...s, messages: after } : s
                )
            );
        } catch {
            const errMsg: Message = { role: 'bot', text: '❌ Помилка при зверненні до API' };
            const after = [...updated, errMsg];
            setMessages(after);
            setSessions(prev =>
                prev.map(s =>
                    s.id === currentSessionId ? { ...s, messages: after } : s
                )
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r overflow-auto">
                <div className="flex items-center justify-between p-4 border-b">
                    <span className="font-semibold">Чати</span>
                    <button
                        onClick={handleNew}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        + Новий
                    </button>
                </div>
                {sessions.map(s => (
                    <div
                        key={s.id}
                        className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 ${s.id === currentSessionId ? 'bg-blue-50' : ''
                            }`}
                        onClick={() => setCurrentSessionId(s.id)}
                    >
                        <span className="truncate">{s.title}</span>
                        <button
                            onClick={e => { e.stopPropagation(); deleteSession(s.id); }}
                            className="text-red-500 hover:text-red-700"
                        >
                            🗑
                        </button>
                    </div>
                ))}
            </aside>

            {/* Main chat */}
            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between bg-blue-700 text-white p-4">
                    <h1 className="text-xl">Чат-помічник</h1>
                    {(!currentSessionId) ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept=".pdf,.txt"
                                onChange={handleFileChange}
                                className="border p-2 rounded bg-white disabled:opacity-50"
                                disabled={fileLoading}
                            />
                            {fileLoading && <Spinner />}
                        </div>
                    ) : (
                        <button
                            onClick={handleCancel}
                            disabled={!fileReady}
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 px-3 py-1 rounded"
                        >
                            Скинути чат
                        </button>
                    )}
                </header>

                <main className="flex-1 p-4 overflow-auto space-y-4">
                    {!currentSessionId && !fileLoading && (
                        <p className="italic text-gray-500">
                            Завантажте документ або створіть новий чат.
                        </p>
                    )}
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`px-4 py-2 rounded-lg max-w-[80%] shadow ${msg.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-800'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {sending && <ThinkingDots />}
                    <div ref={chatEndRef} />
                </main>

                <footer className="p-4 bg-white shadow-inner">
                    <div className="flex gap-2 max-w-5xl mx-auto">
                        <input
                            type="text"
                            className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                            placeholder="Ваше запитання..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            disabled={!fileReady || sending}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!fileReady || sending}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Надіслати
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
