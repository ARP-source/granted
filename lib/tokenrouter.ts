import { OpenAI } from 'openai';
import { searchActions, getActionByAreaId, actionbookTools } from './actionbook';

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

/**
 * Executes a browser automation objective using the LLM and Actionbook tools.
 * It will automatically call searchActions to find the right action, then getActionByAreaId to retrieve the selectors,
 * and finally return the instructions for what browser action to take.
 */
export async function executeBrowserActionAgent(objective: string): Promise<string> {
  const model = 'openai/gpt-4o';
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are an autonomous browser automation agent. Your goal is to figure out how to execute the user's objective on the web.
Before taking any action, you MUST:
1. Call searchActions to find the relevant action manual for the website/task.
2. Call getActionByAreaId with the ID of the most relevant action to get the verified DOM selectors.
3. Once you have the selectors, explain exactly what you would do to execute the browser action using those selectors.`,
    },
    { role: 'user', content: objective },
  ];

  let iterations = 0;
  const maxIterations = 5;

  while (iterations < maxIterations) {
    iterations++;

    const response = await openai.chat.completions.create({
      model,
      messages,
      tools: actionbookTools as any, // Cast to any to satisfy OpenAI type constraints if needed
      tool_choice: 'auto',
    });

    const responseMessage = response.choices[0].message;
    messages.push(responseMessage);

    if (responseMessage.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        let toolResult = '';

        try {
          const args = JSON.parse(toolCall.function.arguments);

          if (toolCall.function.name === 'searchActions') {
            const results = await searchActions(args.query || args);
            toolResult = JSON.stringify(results);
          } else if (toolCall.function.name === 'getActionByAreaId') {
            // Some models pass id, some pass areaId based on the schema
            const areaId = args.area_id || args.areaId || args.id || args;
            const result = await getActionByAreaId(areaId);
            toolResult = JSON.stringify(result);
          } else {
            toolResult = `Error: Unknown tool ${toolCall.function.name}`;
          }
        } catch (err: any) {
          toolResult = `Error executing tool: ${err.message}`;
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: toolResult,
        });
      }
    } else {
      // The model returned a final text response without calling tools
      return responseMessage.content || 'Action executed successfully.';
    }
  }

  return 'Agent reached maximum iterations without completing the objective.';
}
