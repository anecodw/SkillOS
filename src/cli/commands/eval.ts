import path from 'path';
import { SkillParser } from '../../formats';
import { BasicSandbox } from '../../sandbox';

export interface TestOptions {
  allowNetwork?: boolean;
  allowShell?: boolean;
  allowFileWrite?: boolean;
  timeout?: string;
}

export async function testCommand(filePath = path.resolve('skill.md'), options: TestOptions = {}, sandbox = new BasicSandbox()): Promise<void> {
  const skill = await new SkillParser().parseFile(filePath);
  const scenarios = skill.eval?.scenarios ?? [];
  if (!scenarios.length) throw new Error(`Skill '${skill.name}' has no eval scenarios`);
  sandbox.configure({
    allowNetwork: Boolean(options.allowNetwork),
    allowShell: Boolean(options.allowShell),
    allowFileWrite: Boolean(options.allowFileWrite),
    timeoutMs: options.timeout ? Number(options.timeout) : undefined
  });
  const results = await sandbox.eval(skill, scenarios);
  for (const result of results) {
    console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.scenario}${result.error ? `: ${result.error}` : ''}`);
  }
  const failed = results.filter(result => !result.passed).length;
  if (failed) throw new Error(`${failed} of ${results.length} eval scenario(s) failed`);
}
