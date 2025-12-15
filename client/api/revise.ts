
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
});

export default async function handler(req: Request) {
  const { prompt, currentCode } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are an expert Frontend Developer. You are task is to modify the existing HTML code based on the user's request.
        
        Rules:
        1. Return ONLY the updated raw HTML code. Do not wrap it in markdown.
        2. Preserve the existing structure and Tailwind CSS unless asked to change.
        3. Ensure the code remains valid HTML.
        4. Do not include any conversion text.
        `
      },
      {
        role: 'user',
        content: `Current Code:\n${currentCode}\n\nRevision Request: ${prompt}`
      }
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}