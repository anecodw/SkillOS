import { AnthropicProvider, OpenAIProvider, MockLLMProvider, createLLMProvider } from './llm-provider';

const request = { instructions: 'Follow the instructions', input: 'Answer this' };

describe('LLM providers', () => {
  afterEach(() => jest.restoreAllMocks());

  it('calls Anthropic and extracts text blocks', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify({ content: [{ type: 'text', text: 'answer' }] }), { status: 200 }));
    await expect(new AnthropicProvider('secret', 'model-x').generate(request)).resolves.toBe('answer');
    expect(fetchMock).toHaveBeenCalledWith('https://api.anthropic.com/v1/messages', expect.objectContaining({ method: 'POST' }));
  });

  it('surfaces Anthropic and OpenAI API errors and rejects empty responses', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: 'bad request' } }), { status: 400 }));
    await expect(new AnthropicProvider('secret').generate(request)).rejects.toThrow('bad request');
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ choices: [] }), { status: 200 }));
    await expect(new OpenAIProvider('secret').generate(request)).rejects.toThrow('empty response');
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ error: { message: 'unauthorized' } }), { status: 401 }));
    await expect(new OpenAIProvider('secret').generate(request)).rejects.toThrow('unauthorized');
  });

  it('selects provider from environment and uses the explicit mock implementation', async () => {
    expect(createLLMProvider({ ANTHROPIC_API_KEY: 'a' })).toBeInstanceOf(AnthropicProvider);
    expect(createLLMProvider({ SKILLOS_LLM_PROVIDER: 'openai', OPENAI_API_KEY: 'b' })).toBeInstanceOf(OpenAIProvider);
    await expect(new MockLLMProvider('local').generate(request)).resolves.toBe('local');
    expect(() => createLLMProvider({ SKILLOS_LLM_PROVIDER: 'openai' })).toThrow('OPENAI_API_KEY is required');
  });
});
