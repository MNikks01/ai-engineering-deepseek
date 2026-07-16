import { describe, it, expect } from 'vitest';
import { truncateMessages, countTokens } from '../tokenizer';

describe('Truncation - truncateMessages (with real tokenizer)', () => {
  it('should keep the system prompt and drop older messages when token limit is exceeded', () => {
    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is AI?' },
      { role: 'assistant', content: 'AI stands for Artificial Intelligence.' },
      { role: 'user', content: 'Tell me more.' },
    ];

    // Use a smaller limit to guarantee truncation (10 tokens)
    const truncated = truncateMessages(messages, 10);
    const totalTokens = truncated.reduce((sum, msg) => sum + countTokens(msg.content), 0);
    // Total tokens must not exceed the limit
    expect(totalTokens).toBeLessThanOrEqual(10);
    // System prompt must be kept
    expect(truncated[0].role).toBe('system');
    // At least one message should have been dropped
    expect(truncated.length).toBeLessThan(messages.length);
  });

  it('should return all messages if under the token limit', () => {
    const messages = [
      { role: 'system', content: 'Hi' },
      { role: 'user', content: 'Hello' },
    ];
    const truncated = truncateMessages(messages, 100);
    expect(truncated).toEqual(messages);
  });

  it('should handle cases where there is no system prompt', () => {
    const messages = [
      { role: 'user', content: 'First question' },
      { role: 'assistant', content: 'First answer' },
      { role: 'user', content: 'Second question' },
    ];
    const truncated = truncateMessages(messages, 5);
    expect(truncated.length).toBeGreaterThan(0);
    expect(truncated.every((m) => m.role !== 'system')).toBe(true);
    // The token count should be within 5
    const totalTokens = truncated.reduce((sum, msg) => sum + countTokens(msg.content), 0);
    expect(totalTokens).toBeLessThanOrEqual(5);
  });

  it('should keep only the system prompt if even the newest message exceeds the limit', () => {
    const messages = [
      { role: 'system', content: 'Sys' },
      { role: 'user', content: 'A'.repeat(1000) },
    ];
    const truncated = truncateMessages(messages, 10);
    expect(truncated).toEqual([{ role: 'system', content: 'Sys' }]);
  });

  it('should handle an empty messages array', () => {
    expect(truncateMessages([], 10)).toEqual([]);
  });
});
