import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { Skill } from '../formats';
import { installForRuntime, uninstallFromRuntime } from './adapters';

const skill: Skill = {
  name: 'test-skill', version: '1.0.0', description: 'A sufficiently descriptive runtime test skill', author: 'Test',
  runtime: { primary: 'claude-code' }, instructions: '# Test\n\nInstructions for the runtime adapter.'
};

describe('runtime adapters', () => {
  let root: string;
  beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'skillos-runtime-')); });
  afterEach(async () => { await fs.remove(root); });

  it('writes Claude Code skill files and removes them', async () => {
    const target = await installForRuntime(skill, 'claude-code', root);
    expect(await fs.readFile(target, 'utf8')).toContain('# Test');
    await uninstallFromRuntime(skill.name, 'claude-code', root);
    expect(await fs.pathExists(target)).toBe(false);
  });

  it('merges Codex and Aider sections without overwriting other content', async () => {
    await fs.writeFile(path.join(root, 'AGENTS.md'), 'Project instructions\n');
    await installForRuntime(skill, 'codex', root);
    await installForRuntime(skill, 'codex', root);
    expect(await fs.readFile(path.join(root, 'AGENTS.md'), 'utf8')).toContain('Project instructions');
    expect((await fs.readFile(path.join(root, 'AGENTS.md'), 'utf8').then(text => text.match(/skillos:test-skill:begin/g) ?? [])).length).toBe(1);
    await uninstallFromRuntime(skill.name, 'codex', root);
    expect(await fs.readFile(path.join(root, 'AGENTS.md'), 'utf8')).toContain('Project instructions');
    await installForRuntime(skill, 'aider', root);
    expect(await fs.readFile(path.join(root, 'CONVENTIONS.md'), 'utf8')).toContain('Instructions for the runtime adapter.');
  });

  it('writes OpenHands microagents and rejects path traversal or unknown runtimes', async () => {
    const target = await installForRuntime(skill, 'openhands', root);
    expect(await fs.readFile(target, 'utf8')).toContain('name: test-skill');
    await expect(installForRuntime({ ...skill, name: '../escape' }, 'claude-code', root)).rejects.toThrow('Invalid skill name');
    await expect(installForRuntime(skill, 'unknown', root)).rejects.toThrow('Unsupported runtime');
    await expect(uninstallFromRuntime(skill.name, 'unknown', root)).rejects.toThrow('Unsupported runtime');
  });

  it('refuses to write through a symlinked runtime directory', async () => {
    if (process.platform === 'win32') return;
    const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'skillos-outside-'));
    try {
      await fs.symlink(outside, path.join(root, '.claude'));
      await expect(installForRuntime(skill, 'claude-code', root)).rejects.toThrow('symbolic link');
    } finally {
      await fs.remove(outside);
    }
  });
});
