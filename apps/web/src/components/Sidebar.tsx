import React, { useState } from 'react';
import { Thread } from '../services/api';

interface SidebarProps {
  threads: Thread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onNewChat: () => void;
  onUpdateSystemPrompt: (threadId: string, prompt: string) => void;
}

export function Sidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onDeleteThread,
  onNewChat,
  onUpdateSystemPrompt,
}: SidebarProps) {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const handleEditClick = (thread: Thread) => {
    setEditingThreadId(thread.id);
    setEditPrompt(thread.system_prompt || 'You are a helpful assistant.');
  };

  const handleSavePrompt = (threadId: string) => {
    onUpdateSystemPrompt(threadId, editPrompt);
    setEditingThreadId(null);
  };

  return (
    <div style={styles.sidebar}>
      <button onClick={onNewChat} style={styles.newChatButton}>
        ✨ New Chat
      </button>
      <div style={styles.threadList}>
        {threads.map((thread) => (
          <div
            key={thread.id}
            style={{
              ...styles.threadItem,
              ...(thread.id === activeThreadId ? styles.threadItemActive : {}),
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingThreadId === thread.id ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    style={{ flex: 1, fontSize: '12px', padding: '4px' }}
                    autoFocus
                  />
                  <button onClick={() => handleSavePrompt(thread.id)} style={styles.saveButton}>
                    💾
                  </button>
                  <button onClick={() => setEditingThreadId(null)} style={styles.cancelButton}>
                    ✕
                  </button>
                </div>
              ) : (
                <span style={styles.threadTitle} onClick={() => onSelectThread(thread.id)}>
                  {thread.title || 'New Chat'}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {thread.id === activeThreadId && editingThreadId !== thread.id && (
                <button onClick={() => handleEditClick(thread)} style={styles.editButton}>
                  ⚙️
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this conversation?')) {
                    onDeleteThread(thread.id);
                  }
                }}
                style={styles.deleteButton}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 260,
    height: '100vh',
    backgroundColor: '#f7f7f8',
    borderRight: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    overflowY: 'auto',
    flexShrink: 0,
  },
  newChatButton: {
    padding: '10px 16px',
    backgroundColor: '#10a37f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '16px',
  },
  threadList: {
    flex: 1,
    overflowY: 'auto',
  },
  threadItem: {
    padding: '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2px',
    transition: 'background-color 0.2s',
  },
  threadItemActive: {
    backgroundColor: '#e0e0e0',
  },
  threadTitle: {
    fontSize: '14px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  editButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    fontSize: '14px',
    padding: '4px 6px',
    borderRadius: '4px',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#888',
    fontSize: '14px',
    padding: '4px 6px',
    borderRadius: '4px',
  },
  saveButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px 6px',
    borderRadius: '4px',
  },
  cancelButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px 6px',
    borderRadius: '4px',
  },
};
