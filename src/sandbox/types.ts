import { Skill } from '../formats';

export interface SandboxConfig {
  allowShell: boolean;
  allowNetwork: boolean;
  allowFileWrite: boolean;
  restrictedPaths?: string[];
  timeoutMs?: number;
  maxInputBytes?: number;
  maxOutputBytes?: number;
  env?: NodeJS.ProcessEnv;
}

export interface EvalScenario {
  name: string;
  input: string;
  expected: string;
}

export interface EvalResult {
  scenario: string;
  passed: boolean;
  output: string;
  error?: string;
}

export interface LLMRequest {
  instructions: string;
  input: string;
  model?: string;
}

export interface LLMProvider {
  generate(request: LLMRequest): Promise<string>;
}

export interface Sandbox {
  configure(config: Partial<SandboxConfig>): void;
  execute(skill: Skill, input: string): Promise<string>;
  eval(skill: Skill, scenarios: EvalScenario[]): Promise<EvalResult[]>;
}
