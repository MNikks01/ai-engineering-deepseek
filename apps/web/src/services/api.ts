const API_BASE = '/api';

export interface Thread {
  id: string;
  title: string;
  system_prompt?: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export async function fetchThreads(): Promise<Thread[]> {
  const response = await fetch(`${API_BASE}/threads`);
  if (!response.ok) throw new Error('Failed to fetch threads');
  const data = await response.json();
  return data.threads;
}

export async function fetchThreadMessages(threadId: string): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/threads/${threadId}/messages`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  const data = await response.json();
  return data.messages;
}

export async function deleteThread(threadId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/threads/${threadId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete thread');
}

export async function sendMessage(
  messages: { role: string; content: string }[],
  threadId?: string
): Promise<Response> {
  return fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, threadId }),
  });
}

export async function updateThread(
  threadId: string,
  updates: { title?: string; system_prompt?: string }
): Promise<Thread> {
  const response = await fetch(`${API_BASE}/threads/${threadId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update thread');
  const data = await response.json();
  return data.thread;
}
