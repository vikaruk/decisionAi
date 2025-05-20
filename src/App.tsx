import { useState, useRef, useEffect, type ChangeEvent, } from 'react';
import { Chat, GoogleGenAI, createPartFromUri } from '@google/genai';
import Spinner from './components/Spinner';
import ThinkingDots from './components/ThinkingDots';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY });

export default function GeminiChatWithUploadedPDF() {
  const [chat, setChat] = useState<null | Chat>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [fileReady, setFileReady] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleCancel = () => {
    setChat(null);
    setMessages([]);
    setInput('');
    setFileReady(false);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    setFileReady(false);
    setChat(null);
    setMessages([]);

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
      const newChat = ai.chats.create({
        model: 'gemini-2.0-flash',
        history: [
          { role: 'user', parts: [{ text: 'Будь ласка, проаналізуй цей документ:' }, filePart] },
        ],
      });

      setChat(newChat);
      setFileReady(true);
    } catch (err) {
      console.error(err);
      alert('Не вдалося обробити файл.');
    } finally {
      setFileLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!chat || !input.trim()) return;

    const userMsg = { role: 'user' as const, text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const response = await chat.sendMessage({ message: input });
      setMessages((prev) => [...prev, { role: 'bot', text: response.text || '' }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'bot', text: '❌ Помилка при зверненні до API' }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-700 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Чат-помічник - Система підтримки рішень</h1>
        <button
          onClick={handleCancel}
          disabled={!chat && !fileReady}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-3 py-1 rounded"
        >
          Скинути чат
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4 max-w-5xl mx-auto w-full pb-24">
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            disabled={fileReady || fileLoading}
            className="border p-2 rounded bg-white disabled:opacity-50"
          />
          {fileLoading && <Spinner />}
        </div>

        {!fileReady && !fileLoading && (
          <p className="text-sm text-gray-500 italic">
            Завантажте файл, щоб почати спілкування.
          </p>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`px-4 py-2 rounded-lg max-w-[80%] shadow ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'shadow-xl text-gray-800'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {sending && <ThinkingDots />}

        {/* Dummy div to scroll into view */}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 bg-white shadow-inner fixed bottom-0 w-full">
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Надіслати
          </button>
        </div>
      </footer>
    </div>
  );
}
