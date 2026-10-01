import fs from 'fs-extra';
import path from 'path';
import { Skill } from '../formats';
import { isSafeSkillName } from '../registry/local-registry';

export type RuntimeName = 'claude-code' | 'codex' | 'aider' | 'openhands';
export const runtimeNames: RuntimeName[] = ['claude-code', 'codex', 'aider', 'openhands'];

const managedStart = (name: string): string => `<!-- skillos:${name}:begin -->`;
const managedEnd = (name: string): string => `<!-- skillos:${name}:end -->`;

async function assertNoSymlinks(root: string, target: string): Promise<void> {
  const base = path.resolve(root);
  const absolute = path.resolve(target);
  if (absolute !== base && !absolute.startsWith(`${base}${path.sep}`)) throw new Error('Runtime path escapes project directory');
  let current = base;
  for (const part of path.relative(base, absolute).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (await fs.pathExists(current) && (await fs.lstat(current)).isSymbolicLink()) throw new Error(`Refusing to access symbolic link: ${current}`);
  }
}

async function upsertSection(file: string, skill: Skill, heading: string, root: string): Promise<void> {
  await assertNoSymlinks(root, file);
  await fs.ensureFile(file);
  const current = await fs.readFile(file, 'utf8');
  const start = managedStart(skill.name);
  const end = managedEnd(skill.name);
  const section = `${start}\n## ${heading}: ${skill.name}\n\n${skill.instructions.trim()}\n${end}`;
  const startIndex = current.indexOf(start);
  const endIndex = current.indexOf(end);
  const next = startIndex >= 0 && endIndex >= startIndex
    ? `${current.slice(0, startIndex)}${section}${current.slice(endIndex + end.length)}`
    : `${current.trimEnd()}${current.trim() ? '\n\n' : ''}${section}\n`;
  await fs.writeFile(file, next, 'utf8');
}

export async function installForRuntime(skill: Skill, runtime: string, projectRoot = process.cwd()): Promise<string> {
  if (!isSafeSkillName(skill.name)) throw new Error(`Invalid skill name '${skill.name}'`);
  if (!runtimeNames.includes(runtime as RuntimeName)) throw new Error(`Unsupported runtime '${runtime}'`);
  const root = path.resolve(projectRoot);
  if (runtime === 'claude-code') {
    const directory = path.resolve(root, '.claude', 'skills', skill.name);
    if (!directory.startsWith(`${path.resolve(root, '.claude', 'skills')}${path.sep}`)) throw new Error('Runtime path escapes project directory');
    await assertNoSymlinks(root, directory);
    await fs.ensureDir(directory);
    const file = path.join(directory, 'SKILL.md');
    await fs.writeFile(file, skill.instructions.trim() + '\n', 'utf8');
    return file;
  }
  if (runtime === 'codex') {
    const file = path.join(root, 'AGENTS.md');
    await upsertSection(file, skill, 'SkillOS skill', root);
    return file;
  }
  if (runtime === 'aider') {
    const file = path.join(root, 'CONVENTIONS.md');
    await upsertSection(file, skill, 'SkillOS convention', root);
    return file;
  }
  const directory = path.resolve(root, '.openhands', 'microagents');
  await assertNoSymlinks(root, directory);
  await fs.ensureDir(directory);
  const file = path.join(directory, `${skill.name}.md`);
  await fs.writeFile(file, `---\nname: ${skill.name}\n---\n\n${skill.instructions.trim()}\n`, 'utf8');
  return file;
}

export async function uninstallFromRuntime(skillName: string, runtime: string, projectRoot = process.cwd()): Promise<void> {
  if (!isSafeSkillName(skillName)) throw new Error(`Invalid skill name '${skillName}'`);
  if (!runtimeNames.includes(runtime as RuntimeName)) throw new Error(`Unsupported runtime '${runtime}'`);
  const root = path.resolve(projectRoot);
  if (runtime === 'claude-code') {
    const target = path.resolve(root, '.claude', 'skills', skillName);
    const base = path.resolve(root, '.claude', 'skills');
    if (!target.startsWith(`${base}${path.sep}`)) throw new Error('Runtime path escapes project directory');
    await assertNoSymlinks(root, target);
    await fs.remove(target);
    return;
  }
  if (runtime === 'openhands') {
    const target = path.join(root, '.openhands', 'microagents', `${skillName}.md`);
    await assertNoSymlinks(root, target);
    await fs.remove(target);
    return;
  }
  if (runtime === 'codex' || runtime === 'aider') {
    const file = path.join(root, runtime === 'codex' ? 'AGENTS.md' : 'CONVENTIONS.md');
    await assertNoSymlinks(root, file);
    if (!(await fs.pathExists(file))) return;
    const content = await fs.readFile(file, 'utf8');
    const start = managedStart(skillName);
    const end = managedEnd(skillName);
    const startIndex = content.indexOf(start);
    const endIndex = content.indexOf(end);
    if (startIndex >= 0 && endIndex >= startIndex) {
      const before = content.slice(0, startIndex).trimEnd();
      const after = content.slice(endIndex + end.length).trimStart();
      await fs.writeFile(file, [before, after].filter(Boolean).join('\n\n') + (before || after ? '\n' : ''), 'utf8');
    }
  }
}
