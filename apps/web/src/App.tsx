import React, { useState, useEffect, useRef } from 'react';
import { useChatStream } from './hooks/useChatStream';
import { Sidebar } from './components/Sidebar';
import { fetchThreads, fetchThreadMessages, deleteThread, Thread, Message } from './services/api';

function App() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { streamingText, isStreaming, error, sendMessage } = useChatStream();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load threads on mount
  useEffect(() => {
    loadThreads();
  }, []);

  // Load messages when active thread changes
  useEffect(() => {
    if (activeThreadId) {
      loadMessages(activeThreadId);
    } else {
      setMessages([]);
    }
  }, [activeThreadId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  async function loadThreads() {
    try {
      const data = await fetchThreads();
      setThreads(data);
      if (data.length > 0 && !activeThreadId) {
        setActiveThreadId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load threads:', err);
    }
  }

  async function loadMessages(threadId: string) {
    try {
      const data = await fetchThreadMessages(threadId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }

  async function handleDeleteThread(threadId: string) {
    try {
      await deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (activeThreadId === threadId) {
        const remaining = threads.filter((t) => t.id !== threadId);
        setActiveThreadId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  }

  function handleNewChat() {
    setActiveThreadId(null);
    setMessages([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg as Message]);
    setInput('');

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const fullMessages = [...history, userMsg];

    // Send message; if activeThreadId is null, backend creates a new thread
    await sendMessage(fullMessages, activeThreadId || undefined);

    // After streaming finishes, the useEffect below will handle reloading
  }

  // Reload data after streaming finishes
  useEffect(() => {
    if (!isStreaming && streamingText) {
      const updateAfterStream = async () => {
        if (activeThreadId) {
          // Continue existing thread: just refresh messages
          await loadMessages(activeThreadId);
        } else {
          // New thread was created: reload threads and set the latest as active
          const updatedThreads = await fetchThreads();
          if (updatedThreads.length > 0) {
            const latest = updatedThreads[0];
            setThreads(updatedThreads);
            setActiveThreadId(latest.id);
            const msgs = await fetchThreadMessages(latest.id);
            setMessages(msgs);
          }
        }
      };
      updateAfterStream();
    }
  }, [isStreaming, streamingText]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onDeleteThread={handleDeleteThread}
        onNewChat={handleNewChat}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 20,
          maxWidth: 800,
          margin: '0 auto',
        }}
      >
        <h1>🧠 Chater</h1>
        <div
          style={{
            flex: 1,
            border: '1px solid #ccc',
            overflowY: 'auto',
            padding: 10,
            marginBottom: 20,
            minHeight: 400,
          }}
        >
          {messages
            .filter((m) => m.role !== 'system')
            .map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                  marginBottom: 10,
                }}
              >
                <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> <span>{msg.content}</span>
              </div>
            ))}
          {isStreaming && (
            <div style={{ textAlign: 'left', color: '#666' }}>
              <strong>AI:</strong> {streamingText}
              <span style={{ animation: 'blink 1s infinite' }}>▌</span>
            </div>
          )}
          {error && <div style={{ color: 'red', marginTop: 10 }}>❌ Error: {error}</div>}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            style={{ flex: 1, padding: 10 }}
            disabled={isStreaming}
          />
          <button type="submit" disabled={isStreaming || !input.trim()}>
            {isStreaming ? '...' : 'Send'}
          </button>
        </form>
      </div>
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}

export default App;
