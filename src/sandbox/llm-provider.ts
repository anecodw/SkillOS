import { LLMProvider, LLMRequest } from './types';

export class AnthropicProvider implements LLMProvider {
  constructor(private readonly apiKey: string, private readonly model = 'claude-3-5-haiku-latest') {}

  async generate(request: LLMRequest): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: request.model || this.model,
        max_tokens: 2048,
        system: request.instructions,
        messages: [{ role: 'user', content: request.input }]
      })
    });
    const payload = await response.json() as { content?: Array<{ type: string; text?: string }>; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message || `Anthropic request failed (${response.status})`);
    const text = payload.content?.filter(part => part.type === 'text').map(part => part.text || '').join('');
    if (!text) throw new Error('Anthropic returned an empty response');
    return text;
  }
}

export class OpenAIProvider implements LLMProvider {
  constructor(private readonly apiKey: string, private readonly model = 'gpt-4o-mini') {}

  async generate(request: LLMRequest): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: request.model || this.model,
        messages: [
          { role: 'system', content: request.instructions },
          { role: 'user', content: request.input }
        ]
      })
    });
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message || `OpenAI request failed (${response.status})`);
    const text = payload.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenAI returned an empty response');
    return text;
  }
}

export class MockLLMProvider implements LLMProvider {
  constructor(private readonly response = 'mock response') {}

  async generate(_request: LLMRequest): Promise<string> {
    return this.response;
  }
}

export function createLLMProvider(env: NodeJS.ProcessEnv = process.env): LLMProvider {
  const selection = (env.SKILLOS_LLM_PROVIDER || (env.ANTHROPIC_API_KEY ? 'anthropic' : env.OPENAI_API_KEY ? 'openai' : '')).toLowerCase();
  if (selection === 'anthropic' && env.ANTHROPIC_API_KEY) {
    return new AnthropicProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL);
  }
  if (selection === 'openai' && env.OPENAI_API_KEY) {
    return new OpenAIProvider(env.OPENAI_API_KEY, env.OPENAI_MODEL);
  }
  if (selection === 'mock') throw new Error('The mock provider is test-only; inject MockLLMProvider directly.');
  if (selection === 'anthropic') throw new Error('ANTHROPIC_API_KEY is required for the Anthropic provider.');
  if (selection === 'openai') throw new Error('OPENAI_API_KEY is required for the OpenAI provider.');
  throw new Error('No LLM provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY and optionally SKILLOS_LLM_PROVIDER.');
}
