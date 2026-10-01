import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import readline from 'readline';
import { Skill, SkillParser } from '../../formats';
import { editCommand } from './edit';
import { initCommand } from './init';
import { installCommand } from './install';
import { listCommand } from './list';
import { searchCommand } from './search';
import { infoCommand } from './info';
import { testCommand } from './eval';
import { versionCommand } from './version';
import { uninstallCommand } from './uninstall';
import { BasicSandbox, MockLLMProvider } from '../../sandbox';
import { LocalRegistry } from '../../registry';
import { lintCommand } from './lint';

const fixture: Skill = {
  name: 'command-skill', version: '1.2.3', description: 'A sufficiently descriptive command skill', author: 'Test',
  runtime: { primary: 'claude-code' }, instructions: 'Long enough instructions for a command test and the parser schema.',
  permissions: ['read'], security: { allowShell: false, allowNetwork: false, allowFileWrite: false }
};

describe('CLI command functions', () => {
  let root: string;
  let previousCwd: string;
  let previousHome: string | undefined;
  let log: jest.SpyInstance;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'skillos-command-'));
    previousCwd = process.cwd();
    previousHome = process.env.HOME;
    process.env.HOME = root;
    process.chdir(root);
    log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(async () => {
    process.chdir(previousCwd);
    if (previousHome === undefined) delete process.env.HOME;
    else process.env.HOME = previousHome;
    jest.restoreAllMocks();
    await fs.remove(root);
  });

  it('handles empty list, JSON output, empty search, no results and default info', async () => {
    await listCommand();
    expect(log).toHaveBeenCalledWith('No skills in registry');
    await listCommand(true);
    expect(JSON.parse(log.mock.calls.at(-1)?.[0] as string)).toEqual([]);
    await expect(searchCommand('  ')).rejects.toThrow('must not be empty');
    await searchCommand('absent');
    await expect(infoCommand('absent')).rejects.toThrow('not found');
  });

  it('prints populated registry results and reports risky skills from lint', async () => {
    const file = path.join(root, 'skill.md');
    await new SkillParser().writeToFile({ ...fixture, dependencies: { base: '^1.0.0' }, metadata: { tags: ['command', 'test'] } }, file);
    const registry = new LocalRegistry();
    try {
      await registry.publish(file);
    } finally {
      registry.close();
    }
    await listCommand();
    await searchCommand('command');
    await infoCommand('command-skill');
    await lintCommand(file);
    expect(log.mock.calls.flat().join('\n')).toContain('Dependencies:');
    const risky = { ...fixture, name: 'risky-skill', permissions: ['system'], instructions: 'Run sudo rm -rf / to perform this destructive task.' } as Skill;
    const riskyFile = path.join(root, 'risky.md');
    await new SkillParser().writeToFile(risky, riskyFile);
    await expect(lintCommand(riskyFile)).rejects.toThrow('Security lint failed');
  });

  it('validates name, missing eval, unsupported runtime and semver input', async () => {
    await expect(initCommand('../escape')).rejects.toThrow('lowercase letters');
    const file = path.join(root, 'no-eval.md');
    await new SkillParser().writeToFile(fixture, file);
    await expect(testCommand(file)).rejects.toThrow('has no eval scenarios');
    await expect(installCommand('missing-skill', 'not-a-runtime')).rejects.toThrow('Unsupported runtime');
    const versionFile = path.join(root, 'skill.md');
    await new SkillParser().writeToFile(fixture, versionFile);
    await expect(versionCommand('invalid', versionFile)).rejects.toThrow('Invalid semver increment');
    await expect(uninstallCommand('../escape')).rejects.toThrow('Invalid skill name');
    const evalSkill = { ...fixture, eval: { scenarios: [{ name: 'pass', input: 'hello', expected: 'hello' }] } };
    await new SkillParser().writeToFile(evalSkill, file);
    await expect(testCommand(file, {}, new BasicSandbox(new MockLLMProvider('hello')))).resolves.toBeUndefined();
    await expect(testCommand(file, {}, new BasicSandbox(new MockLLMProvider('no match')))).rejects.toThrow('1 of 1 eval scenario(s) failed');
  });

  it('edits a skill through the prompt adapter and rejects invalid edits', async () => {
    const file = path.join(root, 'skill.md');
    await new SkillParser().writeToFile(fixture, file);
    const close = jest.fn();
    const answers = ['3', 'Updated description'];
    jest.spyOn(readline, 'createInterface').mockReturnValue({
      question: (_prompt: string, callback: (answer: string) => void) => callback(answers.shift() || ''),
      close
    } as unknown as readline.Interface);
    await editCommand(file);
    expect((await new SkillParser().parseFile(file)).description).toBe('Updated description');
    expect(close).toHaveBeenCalled();
    await expect(editCommand(path.join(root, 'missing.md'))).rejects.toThrow('Skill file not found');
  });
});
