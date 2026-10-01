import { fork, ChildProcess } from 'child_process';
import path from 'path';
import { Skill } from '../formats';
import { PermissionDeniedError, ExecutionTimeoutError, SandboxError } from '../core/errors';
import { LLMProvider, LLMRequest, Sandbox, SandboxConfig, EvalScenario, EvalResult } from './types';
import { createLLMProvider } from './llm-provider';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_OUTPUT_LIMIT = 1024 * 1024;
const DEFAULT_INPUT_LIMIT = 1024 * 1024;

export class BasicSandbox implements Sandbox {
  private config: SandboxConfig = {
    allowShell: false,
    allowNetwork: false,
    allowFileWrite: false,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    maxInputBytes: DEFAULT_INPUT_LIMIT,
    maxOutputBytes: DEFAULT_OUTPUT_LIMIT
  };

  constructor(private readonly provider?: LLMProvider) {}

  configure(config: Partial<SandboxConfig>): void {
    if (config.timeoutMs !== undefined && (!Number.isSafeInteger(config.timeoutMs) || config.timeoutMs < 1 || config.timeoutMs > 10 * 60_000)) {
      throw new RangeError('Timeout must be an integer between 1 and 600000 milliseconds');
    }
    for (const [name, value] of [['maxInputBytes', config.maxInputBytes], ['maxOutputBytes', config.maxOutputBytes]] as const) {
      if (value !== undefined && (!Number.isSafeInteger(value) || value < 1 || value > 10 * 1024 * 1024)) {
        throw new RangeError(`${name} must be an integer between 1 and 10485760`);
      }
    }
    for (const restrictedPath of config.restrictedPaths ?? []) {
      if (!path.isAbsolute(restrictedPath)) throw new SandboxError(`Restricted path must be absolute: ${restrictedPath}`);
    }
    this.config = { ...this.config, ...config };
  }

  async execute(skill: Skill, input: string): Promise<string> {
    if (typeof input !== 'string') throw new TypeError('Sandbox input must be a string');
    const inputLimit = this.config.maxInputBytes ?? DEFAULT_INPUT_LIMIT;
    if (Buffer.byteLength(input, 'utf8') > inputLimit) throw new SandboxError(`Input exceeds configured limit of ${inputLimit} bytes`);
    if (!this.provider) createLLMProvider(this.config.env ?? process.env);
    this.checkPermissions(skill);
    const request: LLMRequest = { instructions: skill.instructions, input };
    const result = this.provider
      ? await this.provider.generate(request)
      : await this.executeInChild(request);
    const limit = this.config.maxOutputBytes ?? DEFAULT_OUTPUT_LIMIT;
    if (Buffer.byteLength(result, 'utf8') > limit) throw new SandboxError(`Response exceeds configured limit of ${limit} bytes`);
    return result;
  }

  async eval(skill: Skill, scenarios: EvalScenario[]): Promise<EvalResult[]> {
    const results: EvalResult[] = [];
    for (const scenario of scenarios) {
      try {
        const output = await this.execute(skill, scenario.input);
        results.push({
          scenario: scenario.name,
          passed: output.toLowerCase().includes(scenario.expected.toLowerCase()),
          output
        });
      } catch (error) {
        results.push({ scenario: scenario.name, passed: false, output: '', error: error instanceof Error ? error.message : String(error) });
      }
    }
    return results;
  }

  setTimeout(timeoutMs: number): void {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10 * 60_000) {
      throw new RangeError('Timeout must be an integer between 1 and 600000 milliseconds');
    }
    this.config.timeoutMs = timeoutMs;
  }

  getConfig(): SandboxConfig {
    return { ...this.config };
  }

  private checkPermissions(skill: Skill): void {
    const declared = new Set(skill.permissions ?? []);
    const requestsShell = skill.security?.allowShell === true || declared.has('system');
    const requestsNetwork = skill.security?.allowNetwork === true || declared.has('network');
    const requestsWrite = skill.security?.allowFileWrite === true || declared.has('write');
    if (requestsShell && !this.config.allowShell) throw new PermissionDeniedError('shell execution');
    if (requestsNetwork && !this.config.allowNetwork) throw new PermissionDeniedError('network access; opt in with allowNetwork');
    if (requestsWrite && !this.config.allowFileWrite) throw new PermissionDeniedError('file write; opt in with allowFileWrite');
    if (!this.provider && !requestsNetwork) {
      throw new PermissionDeniedError('network access is required for the configured remote LLM provider');
    }
  }

  private executeInChild(request: LLMRequest): Promise<string> {
    const workerPath = path.join(__dirname, 'llm-worker.js');
    const envKeys = ['ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL', 'OPENAI_API_KEY', 'OPENAI_MODEL', 'SKILLOS_LLM_PROVIDER'];
    const childEnv: NodeJS.ProcessEnv = {};
    for (const key of envKeys) {
      const value = (this.config.env ?? process.env)[key];
      if (value) childEnv[key] = value;
    }
    if (process.env.PATH) childEnv.PATH = process.env.PATH;
    if (process.env.SystemRoot) childEnv.SystemRoot = process.env.SystemRoot;
    const timeoutMs = this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const child: ChildProcess = fork(workerPath, [], {
      env: childEnv,
      execArgv: ['--max-old-space-size=128'],
      stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
      serialization: 'json'
    });
    return new Promise((resolve, reject) => {
      let finished = false;
      const finish = (error?: Error, output?: string): void => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        child.removeAllListeners();
        if (error) reject(error);
        else resolve(output ?? '');
      };
      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        finish(new ExecutionTimeoutError(timeoutMs));
      }, timeoutMs);
      child.once('message', (message: { result?: unknown; error?: unknown }) => {
        if (typeof message.error === 'string') finish(new SandboxError(message.error));
        else if (typeof message.result === 'string') finish(undefined, message.result);
        else finish(new SandboxError('LLM worker returned an invalid response'));
      });
      child.once('error', error => finish(new SandboxError(`Could not start worker: ${error.message}`)));
      child.once('exit', (code, signal) => {
        if (!finished) finish(new SandboxError(`LLM worker exited unexpectedly (code ${code}, signal ${signal})`));
      });
      child.send(request, error => {
        if (error) finish(new SandboxError(`Could not send request to worker: ${error.message}`));
      });
    });
  }
}
