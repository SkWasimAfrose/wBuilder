
import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_API_KEY,
});

export default async function handler(req: Request) {
  const { prompt } = await req.json();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      {
        role: 'system',
        content: `You are an expert Frontend Developer and UI/UX Designer. 
        Your task is to generate a single-file HTML/TailwindCSS website based on the user's prompt.
        
        Rules:
        1. Return ONLY the raw HTML code. Do not wrap it in markdown / code blocks.
        2. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
        3. Make it look modern, premium, and beautiful (Glassmorphism, gradients, clean typography).
        4. Use 'https://source.unsplash.com/random/800x600' for placeholders if needed.
        5. Ensure the code is a complete, valid HTML document (<!DOCTYPE html>...</html>).
        6. Do not include any explanations or extra text. Just the code.
        `
      },
      { role: 'user', content: prompt }
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
