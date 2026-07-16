import { encoding_for_model, TiktokenModel } from 'tiktoken';

/**
 * Count the number of tokens in a text string for a given model.
 * IMPORTANT: Always call enc.free() after encoding to avoid memory leaks.
 */
export function countTokens(text: string, model: TiktokenModel = 'gpt-4o-mini') {
  const enc = encoding_for_model(model);
  const tokens = enc.encode(text);
  enc.free();
  return tokens.length;
}

/**
 * Truncate a message array to fit within the token limit.
 * Keeps the system prompt (if present) and the most recent messages.
 */
export function truncateMessages(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  maxTokens: number = 4000,
  model: TiktokenModel = 'gpt-4o-mini'
) {
  // 1. Extract system message (if any)
  const systemMsg = messages[0]?.role === 'system' ? messages[0] : null;
  const remaining = messages.filter((m) => m.role !== 'system');

  // 2. Start with system message token count
  const result: typeof messages = [];
  let currentTokens = systemMsg ? countTokens(systemMsg.content, model) : 0;

  // 3. Add messages from newest to oldest (reverse order)
  for (let i = remaining.length - 1; i >= 0; i--) {
    const msg = remaining[i];
    const msgTokens = countTokens(msg.content, model);
    // If adding this message would exceed the limit, stop
    if (currentTokens + msgTokens > maxTokens) {
      break;
    }
    // Insert at the beginning to maintain chronological order
    result.unshift(msg);
    currentTokens += msgTokens;
  }

  // 4. Return system prompt (if any) + truncated messages
  return systemMsg ? [systemMsg, ...result] : result;
}
