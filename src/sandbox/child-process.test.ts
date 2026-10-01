import { EventEmitter } from 'events';
import { fork } from 'child_process';
import { BasicSandbox } from './basic-sandbox';
import { Skill } from '../formats';

jest.mock('child_process', () => ({ fork: jest.fn() }));
const mockedFork = jest.mocked(fork);

class FakeChild extends EventEmitter {
  killed = false;
  constructor(private readonly reply?: { result?: string; error?: string }, private readonly shouldHang = false) { super(); }
  send(_payload: unknown, callback?: (error: Error | null) => void): void {
    callback?.(null);
    if (!this.shouldHang) queueMicrotask(() => this.emit('message', this.reply));
  }
  kill(): boolean { this.killed = true; return true; }
  disconnect(): void {}
}

const skill: Skill = {
  name: 'remote-skill', version: '1.0.0', description: 'A sufficiently descriptive remote skill', author: 'Test',
  runtime: { primary: 'claude-code' }, instructions: 'Run the configured model using these instructions.',
  permissions: ['network'], security: { allowNetwork: true, allowShell: false, allowFileWrite: false }
};

describe('sandbox child process execution', () => {
  beforeEach(() => mockedFork.mockReset());

  it('returns responses from the isolated LLM worker', async () => {
    mockedFork.mockReturnValue(new FakeChild({ result: 'isolated response' }) as never);
    const sandbox = new BasicSandbox();
    sandbox.configure({ allowNetwork: true, env: { OPENAI_API_KEY: 'test-key' } });
    await expect(sandbox.execute(skill, 'hello')).resolves.toBe('isolated response');
    expect(mockedFork).toHaveBeenCalledWith(expect.stringContaining('llm-worker.js'), [], expect.objectContaining({ execArgv: ['--max-old-space-size=128'] }));
  });

  it('surfaces worker errors', async () => {
    mockedFork.mockReturnValue(new FakeChild({ error: 'provider key missing' }) as never);
    const sandbox = new BasicSandbox();
    sandbox.configure({ allowNetwork: true });
    await expect(sandbox.execute(skill, 'hello')).rejects.toThrow('provider key missing');
  });

  it('kills a stalled worker when its deadline expires', async () => {
    const child = new FakeChild(undefined, true);
    mockedFork.mockReturnValue(child as never);
    const sandbox = new BasicSandbox();
    sandbox.configure({ allowNetwork: true, timeoutMs: 10 });
    await expect(sandbox.execute(skill, 'hello')).rejects.toThrow('Execution timeout after 10ms');
    expect(child.killed).toBe(true);
  });
});
