import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const config = {
  runtime: 'edge', // This is the secret to 0 timeouts!
};

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

export default async function handler(req: Request) {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // or gpt-4
    stream: true,
    messages: [{ role: 'user', content: prompt }],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
