import { OpenAI } from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || process.env.TOKENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': 'https://grantforge.zeabur.app',
    'X-Title': 'GrantForge',
  },
});

export type RouteType = 'fast' | 'deep';

export async function routePrompt(
  task: RouteType,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const model = task === 'fast' ? 'openai/gpt-4o-mini' : 'openai/gpt-4o';

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: task === 'fast' ? 0.1 : 0.3,
    max_tokens: 1024,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error(`TokenRouter returned empty response for ${task} task`);
  }
  return content.trim();
}
