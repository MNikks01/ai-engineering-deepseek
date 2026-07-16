import { describe, it, expect, vi } from 'vitest';
import { streamChatCompletion } from '../llm.service';

// Mock the OpenAI module
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            // Mock stream async iterator
            [Symbol.asyncIterator]: vi.fn().mockReturnValue({
              next: vi.fn().mockResolvedValue({ done: true }),
            }),
          }),
        },
      },
    })),
  };
});

describe('LLM Service', () => {
  it('should initialize OpenAI client', () => {
    // Basic sanity test to ensure the module loads
    expect(streamChatCompletion).toBeDefined();
  });
});
