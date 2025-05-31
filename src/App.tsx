// src/App.tsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import FileUploader from './components/FileUploader';
import ChatHeader from './components/Chat/ChatHeader';
import ChatMain from './components/Chat/ChatMain';
import ChatFooter from './components/Chat/ChatFooter';
import { useSessions } from './hooks/useSessions';
import { useChat } from './hooks/useChat';
import { uploadFile, pollFileStatus } from './api/gemini';
import { createPartFromUri } from '@google/genai';

export default function App() {
  const {
    sessions,
    currentSessionId,
    currentSession,
    updateSession,
    setCurrentSessionId,
    deleteSession,
    addSession
  } = useSessions();

  const { history, sendMessage, sending, pendingFileParts, addPendingFiles, removePendingFile } = useChat({
    currentSession,
    setCurrentSessionId,
    addSession,
    updateSession,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fileUploaderVisible, setFileUploaderVisible] = useState(false);

  const disableInput = !currentSession && pendingFileParts.length === 0;

  const addFilesToExistingSession = async (files: FileList) => {
    const fileParts = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploaded = await uploadFile(file);
      const status = await pollFileStatus(uploaded.name!);
      const part = createPartFromUri(status.uri!, file.type);
      fileParts.push({ ...part, fileName: file.name });
    }
    addPendingFiles(fileParts);
  };


  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setFileUploaderVisible(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const current = e.currentTarget;
    const related = e.relatedTarget as Node | null;
    if (!related || !current.contains(related)) {
      setFileUploaderVisible(false);
    }
  };


  const handleFileUploaderFinish = () => {
    setFileUploaderVisible(false);
  };

  const handleAttachClick = () => {
    setFileUploaderVisible(prev => !prev);
  };

  const handleSend = (text: string) => {
    sendMessage(text);
  };

  return (
    <div className="flex h-screen bg-fourth">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelect={id => {
          setCurrentSessionId(id);
          setSidebarOpen(false);
        }}
        onDelete={deleteSession}
        onNew={() => {
          setCurrentSessionId(null);
          setSidebarOpen(false);
        }}
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col relative min-w-0"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <ChatHeader onMenuClick={() => setSidebarOpen(o => !o)} />

        <main className="relative flex-1 p-4 overflow-y-auto space-y-4 max-w-5xl mx-auto max-md:w-screen w-full mb-18 bg-fourth">
          <ChatMain history={history} sending={sending} pendingFileParts={pendingFileParts} />
        </main>
        {fileUploaderVisible && (
          <div className={`absolute ${pendingFileParts.length ? 'bottom-30' : 'bottom-15'} w-full flex justify-center z-10`}>
            <FileUploader
              addFilesToExistingSession={addFilesToExistingSession}
              onFinish={handleFileUploaderFinish}
              disable={sending}
            />
          </div>
        )}
        <ChatFooter
          onSend={handleSend}
          disabled={disableInput || sending}
          onAttachClick={handleAttachClick}
          removePendingFile={removePendingFile}
          pendingFileParts={pendingFileParts}
        />
      </div>
    </div>
  );
}
