import { BasicSandbox, MockLLMProvider, createLLMProvider } from './index';
import { Skill } from '../formats';

const skill: Skill = {
  name: 'fixture', version: '1.0.0', description: 'A sufficiently descriptive fixture skill', author: 'Test',
  runtime: { primary: 'claude-code' }, instructions: 'Instructions that are long enough for schema checks and describe the skill.',
  permissions: ['read'], security: { allowShell: false, allowNetwork: false, allowFileWrite: false },
  eval: { scenarios: [{ name: 'greeting', input: 'hello', expected: 'hello' }] }
};

describe('BasicSandbox', () => {
  it('runs requests through an injected provider and evaluates scenarios', async () => {
    const sandbox = new BasicSandbox(new MockLLMProvider('hello there'));
    await expect(sandbox.execute(skill, 'hello')).resolves.toBe('hello there');
    await expect(sandbox.eval(skill, skill.eval?.scenarios ?? [])).resolves.toMatchObject([{ passed: true, scenario: 'greeting' }]);
  });

  it('denies requested permissions unless the host opted in', async () => {
    const networkSkill = { ...skill, permissions: ['network'], security: { allowNetwork: true } } as Skill;
    await expect(new BasicSandbox(new MockLLMProvider()).execute(networkSkill, 'input')).rejects.toThrow('network access');
    const enabled = new BasicSandbox(new MockLLMProvider());
    enabled.configure({ allowNetwork: true });
    await expect(enabled.execute(networkSkill, 'input')).resolves.toBe('mock response');
  });

  it('enforces output limits and bounded timeout configuration', async () => {
    const sandbox = new BasicSandbox(new MockLLMProvider('long answer'));
    sandbox.configure({ maxOutputBytes: 3 });
    await expect(sandbox.execute(skill, 'input')).rejects.toThrow('exceeds configured limit');
    expect(() => sandbox.setTimeout(0)).toThrow('Timeout must be an integer');
    expect(() => sandbox.setTimeout(1_000_000)).toThrow('Timeout must be an integer');
    expect(() => sandbox.configure({ maxOutputBytes: 0 })).toThrow('maxOutputBytes must be an integer');
    expect(() => sandbox.configure({ timeoutMs: Number.NaN })).toThrow('Timeout must be an integer');
    expect(() => sandbox.configure({ restrictedPaths: ['relative/path'] })).toThrow('Restricted path must be absolute');
    sandbox.configure({ maxInputBytes: 2 });
    await expect(sandbox.execute(skill, 'long input')).rejects.toThrow('Input exceeds configured limit');
  });

  it('requires a configured real provider key and rejects mock-mode environment settings', () => {
    expect(() => createLLMProvider({})).toThrow('No LLM provider configured');
    expect(() => createLLMProvider({ SKILLOS_LLM_PROVIDER: 'anthropic' })).toThrow('ANTHROPIC_API_KEY is required');
    expect(() => createLLMProvider({ SKILLOS_LLM_PROVIDER: 'mock' })).toThrow('test-only');
  });

  it('reports missing provider credentials before network permission checks', async () => {
    const withoutCredentials = new BasicSandbox();
    withoutCredentials.configure({ env: {} });
    await expect(withoutCredentials.execute(skill, 'hello')).rejects.toThrow('No LLM provider configured');
    const sandbox = new BasicSandbox(new MockLLMProvider());
    await expect(sandbox.execute(skill, 'x'.repeat(1024 * 1024 + 1))).rejects.toThrow('Input exceeds configured limit');
  });
});
