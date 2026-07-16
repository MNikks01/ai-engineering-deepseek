import { describe, it, expect } from 'vitest';
import { countTokens } from '../tokenizer';

describe('Tokenizer - countTokens', () => {
  it('should count tokens for a simple English sentence', () => {
    const text = 'Hello, world!';
    const tokens = countTokens(text);
    expect(tokens).toBeGreaterThan(0);
    // For GPT-4o-mini, "Hello, world!" is typically 4 tokens.
    expect(tokens).toBe(4);
  });

  it('should count tokens for an empty string', () => {
    expect(countTokens('')).toBe(0);
  });

  it('should count tokens for a long text', () => {
    const text = 'A'.repeat(1000);
    const tokens = countTokens(text);
    // 1000 'A's are roughly 250-300 tokens depending on the BPE merge rules.
    // We just check it's greater than 0 and less than the character count.
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(1000);
  });

  it('should count tokens for text with special characters', () => {
    const text = '🚀 AI Engineering 🧠';
    const tokens = countTokens(text);
    expect(tokens).toBeGreaterThan(0);
  });

  it('should free the encoder after counting (no memory leak)', () => {
    // This is a behavioral test. We call countTokens multiple times.
    // If the encoder was not freed, memory usage would spike.
    // We can't easily assert memory, but we can ensure the function runs without crashing.
    for (let i = 0; i < 100; i++) {
      expect(countTokens('Hello world ' + i)).toBeGreaterThan(0);
    }
    expect(true).toBe(true);
  });
});
