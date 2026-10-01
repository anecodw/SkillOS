import { createLLMProvider } from './llm-provider';
import { LLMRequest } from './types';

process.on('message', async (message: LLMRequest) => {
  try {
    const result = await createLLMProvider(process.env).generate(message);
    if (Buffer.byteLength(result, 'utf8') > 1024 * 1024) throw new Error('LLM response exceeds the 1 MiB worker limit');
    process.send?.({ result });
  } catch (error) {
    process.send?.({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    process.disconnect?.();
  }
});
