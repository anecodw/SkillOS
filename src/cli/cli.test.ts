import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { createProgram } from './index';
import { Skill, SkillParser } from '../formats';

const fixture: Skill = {
  name: 'test-skill', version: '1.0.0', description: 'A sufficiently descriptive integration skill', author: 'Test Author',
  runtime: { primary: 'claude-code', compatible: ['codex', 'aider', 'openhands'] },
  instructions: '# Test Skill\n\nInstructions that are long enough to pass the schema and describe a test skill.',
  permissions: ['read'], security: { allowShell: false, allowNetwork: false, allowFileWrite: false },
  eval: { scenarios: [{ name: 'simple', input: 'hello', expected: 'hello' }] }
};

describe('CLI integration', () => {
  let root: string;
  let oldCwd: string;
  let oldHome: string | undefined;
  let output: jest.SpyInstance;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'skillos-cli-'));
    oldCwd = process.cwd();
    oldHome = process.env.HOME;
    process.env.HOME = root;
    process.chdir(root);
    process.exitCode = 0;
    output = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(async () => {
    process.chdir(oldCwd);
    if (oldHome === undefined) delete process.env.HOME;
    else process.env.HOME = oldHome;
    output.mockRestore();
    jest.restoreAllMocks();
    process.exitCode = 0;
    await fs.remove(root);
  });

  const run = async (...args: string[]): Promise<void> => {
    await createProgram().parseAsync(args, { from: 'user' });
  };

  it('initializes, validates, bumps and lints a skill', async () => {
    await run('init', 'new-skill');
    const file = path.join(root, 'new-skill', 'skill.md');
    expect(await fs.pathExists(file)).toBe(true);
    await run('validate', file);
    await run('version', 'patch', file);
    expect((await new SkillParser().parseFile(file)).version).toBe('0.1.1');
    await run('lint', file);
  });

  it('publishes, searches, lists and describes a skill in JSON mode', async () => {
    await new SkillParser().writeToFile(fixture, path.join(root, 'skill.md'));
    await run('publish', 'skill.md');
    await run('list', '--json');
    expect(JSON.parse(output.mock.calls.at(-1)?.[0] as string)[0].name).toBe('test-skill');
    await run('search', 'integration', '--json');
    expect(JSON.parse(output.mock.calls.at(-1)?.[0] as string)[0].name).toBe('test-skill');
    await run('info', 'test-skill', '--json');
    expect(JSON.parse(output.mock.calls.at(-1)?.[0] as string).version).toBe('1.0.0');
  });

  it('installs a registered skill to a runtime and uninstalls it safely', async () => {
    await new SkillParser().writeToFile(fixture, path.join(root, 'skill.md'));
    await run('publish', 'skill.md');
    await run('install', 'test-skill@^1.0.0', '--runtime', 'claude-code');
    expect(await fs.pathExists(path.join(root, '.claude', 'skills', 'test-skill', 'SKILL.md'))).toBe(true);
    expect((await fs.readJson(path.join(root, 'skillos.lock'))).root).toBe('test-skill@1.0.0');
    await run('uninstall', 'test-skill', '--runtime', 'claude-code');
    expect(await fs.pathExists(path.join(root, '.claude', 'skills', 'test-skill'))).toBe(false);
  });
});
