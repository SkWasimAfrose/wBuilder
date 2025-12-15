import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export const config = {
  runtime: 'edge',
};

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY, // Using your specific variable
});

export default async function handler(req: Request) {
  const { prompt, currentCode } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // or gpt-4-turbo for better coding
    stream: true,
    messages: [
      {
        role: 'system',
        content: 'You are an expert web developer. You will receive a request to modify existing HTML/React code. Output ONLY the updated full code. Do not output markdown or explanations.'
      },
      {
        role: 'user',
        content: `Here is the current code:\n\n${currentCode}\n\nRequest: ${prompt}\n\nReturn the updated code:`
      }
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}