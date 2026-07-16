import React, { useState, useRef } from 'react';
import { useChatStream } from './hooks/useChatStream';

function App() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [input, setInput] = useState('');
  const { streamingText, isStreaming, error, sendMessage } = useChatStream();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    // Add user message to state
    const userMsg = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');

    // Send to backend – the hook will populate streamingText
    await sendMessage(updatedMessages);
  };

  // When streaming finishes, append the assistant message to history
  React.useEffect(() => {
    if (!isStreaming && streamingText) {
      setMessages((prev) => [...prev, { role: 'assistant', content: streamingText }]);
    }
  }, [isStreaming, streamingText]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h1>🧠 Chater</h1>
      <div
        style={{
          border: '1px solid #ccc',
          height: 400,
          overflowY: 'auto',
          padding: 10,
          marginBottom: 20,
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
