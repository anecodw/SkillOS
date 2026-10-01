import { Skill } from '../formats';

export interface SandboxConfig {
  allowShell: boolean;
  allowNetwork: boolean;
  allowFileWrite: boolean;
  restrictedPaths?: string[];
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

export interface Sandbox {
  configure(config: SandboxConfig): void;
  execute(skill: Skill, input: string): Promise<string>;
  eval(skill: Skill, scenarios: EvalScenario[]): Promise<EvalResult[]>;
}
