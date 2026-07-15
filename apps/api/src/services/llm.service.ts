import OpenAI from 'openai';
import { Response } from 'express';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// We manually format SSE events
function sendSSE(res: Response, data: any) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export async function streamChatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  res: Response
) {
  // --- 1. Setup SSE Headers ---
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Important: send headers immediately

  // --- 2. Handle client disconnection (stop paying for tokens) ---
  let isAborted = false;
  res.on('close', () => {
    isAborted = true;
    console.log('Client disconnected, stopping stream...');
  });

  try {
    // --- 3. Call OpenAI with `stream: true` ---
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      temperature: 0.7,
    });

    // --- 4. Iterate over the async generator ---
    for await (const chunk of stream) {
      if (isAborted) {
        // Destroy the stream to stop API calls
        await stream.controller.abort();
        break;
      }

      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        // Send token to frontend as a Server-Sent Event
        sendSSE(res, { type: 'token', content });
      }

      // Check if this is the last chunk (finish_reason)
      if (chunk.choices[0]?.finish_reason === 'stop') {
        sendSSE(res, { type: 'done' });
      }
    }

    // --- 5. Clean up ---
    res.end();
  } catch (error: any) {
    console.error('OpenAI Stream Error:', error);
    sendSSE(res, { type: 'error', message: error.message || 'Something went wrong' });
    res.end();
  }
}