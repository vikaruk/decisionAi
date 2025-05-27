import { useState, useRef, useEffect, type ChangeEvent, } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chat, GoogleGenAI, createPartFromUri, type Content } from '@google/genai';
import Spinner from './components/Spinner';
import ThinkingDots from './components/ThinkingDots';
import { v4 as uuid } from 'uuid';
import TrashIcon from './components/icons/TrashIcon';
import MenuIcon from './components/icons/MenuIcon';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY });
const STORAGE_KEY = 'geminiChatSessions';
const MODEL = 'gemini-2.0-flash';

type Session = {
  id: string;
  title: string;
  history: Content[];
};
export default function GeminiChatWithUploadedPDF() {
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
  const [currentSession, setCurrentSession] = useState<Session | null>(
    sessions.find(session => session.id === currentSessionId) || null
  );
  const [chat, setChat] = useState<null | Chat>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [fileReady, setFileReady] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sending, currentSession]);

  // When session changes: rebuild Chat from its messages
  useEffect(() => {
    if (!currentSessionId) {
      setChat(null);
      setFileReady(false);
      setCurrentSession(null)
      return;
    }
    const session = sessions.find(s => s.id === currentSessionId)!;
    setCurrentSession(session)
    setFileReady(session.history.length > 0);

    // Recreate Chat with full history as text-only Content
    const resumed = ai.chats.create({ model: MODEL, history: session.history, });
    setChat(resumed);
  }, [currentSessionId]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    setFileReady(false);
    setChat(null);

    try {
      const uploaded = await ai.files.upload({ file, config: { displayName: file.name } });
      if (!uploaded.name) throw new Error('Не вдалось завантажити файл');
      let status = await ai.files.get({ name: uploaded.name });

      while (status.state === 'PROCESSING') {
        await new Promise((res) => setTimeout(res, 2000));
        status = await ai.files.get({ name: uploaded.name });
      }
      if (status.state === 'FAILED') throw new Error('Не вдалось завантажити файл');

      const filePart = createPartFromUri(status.uri!, file.type);
      const message = { role: 'user', parts: [{ text: 'Будь ласка, проаналізуй цей документ:' }, filePart] }
      const newChat = ai.chats.create({
        model: 'gemini-2.0-flash',
        history: [message],
      });
      const id = uuid();
      const session: Session = {
        id,
        title: file.name,
        history: [message],
      };
      setSessions(prev => [session, ...prev]);
      setCurrentSessionId(id);
      setChat(newChat);
      setFileReady(true);
    } catch (err) {
      console.error(err);
      alert('Не вдалося обробити файл.');
    } finally {
      setFileLoading(false);
    }
  };

  const addCurrentSessionMessage = (message: Content) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === currentSessionId ? { ...session, history: [...session.history, message] } : session
      )
    );
    setCurrentSession(prev => prev ? ({ ...prev, history: [...prev.history, message] }) : null)
  }

  const sendMessage = async () => {
    if (!chat || !input.trim() || !currentSessionId) return;

    const userMsg: Content = { role: 'user', parts: [{ text: input }] };
    addCurrentSessionMessage(userMsg)
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        history: [
          ...prev.history,
          { role: 'model', parts: [{ text: '' }] },
        ],
      };
    });
    setInput('');
    setSending(true);
    let accumulated = '';
    try {
      // const response = await chat.sendMessage({ message: input });
      const stream = await chat.sendMessageStream({ message: input });
      for await (const part of stream) {
        accumulated += part.text;
        // Оновлюємо тимчасово текст моделі
        setCurrentSession(prev => {
          if (!prev) return prev;
          const newHistory = [...prev.history];
          newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: accumulated }] };
          return { ...prev, history: newHistory };
        });
      }
      const botMsg: Content = { role: 'model', parts: [{ text: accumulated }] };
      addCurrentSessionMessage(botMsg)
    } catch (err) {
      console.error(err);
      const errorMsg = { role: 'bot', parts: [{ text: '❌ Помилка при зверненні до API' }] }
      setCurrentSession((prev) => prev ? ({ ...prev, history: [...prev.history, errorMsg] }) : null);
    } finally {
      setSending(false);
    }
  };

  // Delete removes session
  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (id === currentSessionId) {
      setCurrentSessionId(sessions.filter(s => s.id !== id)[0]?.id || null);
    }
  };

  // "+ Новий" clears selection so user must upload
  const handleNew = () => {
    setCurrentSessionId(null);
    setSidebarOpen(false)
  };
  const toggleSidebar = () => setSidebarOpen(o => !o);
  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && <div className="fixed inset-0 bg-transparent bg-opacity-50 z-20 md:hidden" onClick={toggleSidebar} />}
      <aside className={`fixed inset-y-0 w-64 bg-white border-r z-30 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:z-auto`}>
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-semibold">Чати</span>
          <button onClick={handleNew} className="text-blue-600 hover:text-blue-800">+ Новий</button>
        </div>
        {sessions.map(s => (
          <div key={s.id} className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100 ${s.id === currentSessionId ? 'bg-blue-50' : ''}`} onClick={() => { setCurrentSessionId(s.id); setSidebarOpen(false); }}>
            <span className="truncate">{s.title}</span>
            <button onClick={e => { e.stopPropagation(); deleteSession(s.id); }} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
          </div>
        ))}
      </aside>
      <div className="flex-1 flex flex-col relative">
        <header className="bg-blue-700 text-white p-2 md:p-4 flex items-center justify-items-start">
          <button className="md:hidden p-2 mr-2.5" onClick={toggleSidebar}>
            <MenuIcon />
          </button>
          <h1 className="text-xl font-semibold">Чат-помічник - Система підтримки рішень</h1>

        </header>

        <main className="flex-1 p-4 overflow-y-auto space-y-4 max-w-5xl mx-auto w-screen mb-18">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              disabled={fileReady || fileLoading}
              className="border p-2 rounded bg-white disabled:opacity-50 cursor-pointer"
            />
            {fileLoading && <Spinner />}
          </div>

          {!fileReady && !fileLoading && (
            <p className="text-sm text-gray-500 italic">
              Завантажте файл, щоб почати спілкування.
            </p>
          )}

          {currentSession?.history?.slice(1)?.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`px-4 py-2 rounded-lg max-w-[100%] md:max-w-[80%] shadow ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'shadow-xl text-gray-800'
                  }`}
              >
                <div className="prose prose-sm max-w-none overflow-x-auto">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                  >
                    {msg.parts?.map(p => p.text).join('')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {sending && <ThinkingDots />}

          {/* Dummy div to scroll into view */}
          <div ref={chatEndRef} />
        </main>

        <footer className="p-4 bg-white shadow-inner absolute bottom-0 w-full">
          <div className="max-w-5xl mx-auto flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ваше запитання..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={!fileReady || sending}
            />
            <button
              onClick={sendMessage}
              disabled={!fileReady || sending}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              Надіслати
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
