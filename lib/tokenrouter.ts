import { OpenAI } from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.tokenrouter.ai/v1',
  apiKey: process.env.TOKENROUTER_API_KEY || '',
});

export type RouteType = 'fast' | 'deep';

export async function routePrompt(
  task: RouteType,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const model = task === 'fast' ? 'gpt-4o-mini' : 'gpt-4o';

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
