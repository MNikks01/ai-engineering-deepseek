import OpenAI from 'openai';
import { Response } from 'express';
import { pool } from '../config/db';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

type SSEPayload = { type: string; content?: string; message?: string };

function sendSSE(res: Response, data: SSEPayload) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  // Force flush to send immediately
  if (typeof (res as any).flush === 'function') {
    (res as any).flush();
  }
}

export async function streamChatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  res: Response,
  threadId?: string // 👈 new parameter
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let isAborted = false;
  res.on('close', () => {
    isAborted = true;
    console.log('Client disconnected, stopping stream...');
  });

  let fullResponse = ''; // 👈 accumulate the full answer

  try {
    const client = getOpenAIClient();

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      if (isAborted) {
        await stream.controller.abort();
        break;
      }

      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content; // 👈 accumulate
        sendSSE(res, { type: 'token', content });
      }

      if (chunk.choices[0]?.finish_reason === 'stop') {
        sendSSE(res, { type: 'done' });
      }
    }

    // 👇 Save assistant message if threadId is provided
    if (threadId && fullResponse) {
      await pool.query('INSERT INTO messages (thread_id, role, content) VALUES ($1, $2, $3)', [
        threadId,
        'assistant',
        fullResponse,
      ]);
    }

    res.end();
  } catch (error: unknown) {
    console.error('OpenAI Stream Error:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong';
    sendSSE(res, { type: 'error', message });
    res.end();
  }
}
