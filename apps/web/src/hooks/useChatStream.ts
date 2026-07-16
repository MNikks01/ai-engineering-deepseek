import { useState } from 'react';

export function useChatStream() {
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (messages: { role: string; content: string }[]) => {
    setStreamingText('');
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';
      let done = false;

      // Replace while (true) with a loop that checks the `done` flag
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (done) break;

        const chunk = result.value;
        buffer += decoder.decode(chunk, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          if (!event.trim()) continue;
          const lines = event.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const payload = line.substring(6);
              try {
                const data = JSON.parse(payload);
                if (data.type === 'token') {
                  setStreamingText((prev) => prev + data.content);
                } else if (data.type === 'done') {
                  setIsStreaming(false);
                } else if (data.type === 'error') {
                  setError(data.message);
                  setIsStreaming(false);
                }
              } catch (_e) {
                // Ignore parse errors for incomplete JSON
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      // 👈 Use `unknown` instead of `any`
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setIsStreaming(false);
    }
  };

  return { streamingText, isStreaming, error, sendMessage };
}
