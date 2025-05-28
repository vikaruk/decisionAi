import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import FileUploader from './components/FileUploader';
import ChatHeader from './components/Chat/ChatHeader';
import ChatMain from './components/Chat/ChatMain';
import ChatFooter from './components/Chat/ChatFooter';
import { useSessions } from './hooks/useSessions';
import { useChat } from './hooks/useChat';

export default function App() {
  const { sessions, currentSessionId, currentSession, addSession, updateSession, setCurrentSessionId, deleteSession } = useSessions();
  const { history, sendMessage, sending } = useChat({ currentSession, updateSession });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelect={id => { setCurrentSessionId(id); setSidebarOpen(false); }}
        onDelete={deleteSession}
        onNew={() => { setCurrentSessionId(null); setSidebarOpen(false); }}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col relative">
        <ChatHeader onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 p-4 overflow-y-auto space-y-4 max-w-5xl mx-auto max-md:w-screen w-full mb-18 bg-surface">
          <FileUploader addSession={addSession} setCurrentSessionId={setCurrentSessionId} history={history} currentSession={currentSession} />
          <ChatMain history={history} sending={sending} />
        </main>
        <ChatFooter onSend={sendMessage} disabled={sending || !history.length} />
      </div>
    </div>
  );
}