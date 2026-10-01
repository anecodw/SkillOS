import fs from 'fs-extra';
import path from 'path';
import { Skill, SkillParser } from '../../formats';
import { isSafeSkillName } from '../../registry/local-registry';

export async function initCommand(skillName: string): Promise<void> {
  if (!isSafeSkillName(skillName)) throw new Error('Skill name must contain lowercase letters, numbers, and single hyphens only');
  const root = path.resolve(process.cwd());
  const skillDir = path.resolve(root, skillName);
  if (!skillDir.startsWith(`${root}${path.sep}`)) throw new Error('Skill directory escapes the current working directory');
  if (await fs.pathExists(skillDir)) throw new Error(`Directory ${skillName} already exists`);
  const skill: Skill = {
    name: skillName,
    version: '0.1.0',
    description: 'A new skill for AI agents',
    author: 'Your Name',
    license: 'MIT',
    runtime: { primary: 'claude-code', compatible: ['codex', 'openhands', 'aider'] },
    instructions: `# ${skillName}\n\nDescribe what this skill does and how the AI agent should use it.\n\n## Purpose\nExplain the main purpose of this skill.\n\n## Usage\nDescribe when and how this skill should be invoked.`,
    capabilities: ['general-purpose'],
    permissions: ['read'],
    security: { allowShell: false, allowNetwork: false, allowFileWrite: false },
    metadata: { tags: ['ai', 'agent', 'skill'], category: 'general', language: 'en' }
  };
  const parser = new SkillParser();
  await fs.ensureDir(skillDir);
  try {
    await parser.writeToFile(skill, path.join(skillDir, 'skill.md'));
  } catch (error) {
    await fs.remove(skillDir);
    throw error;
  }
  console.log(`Created skill ${skillName} at ${skillDir}`);
}
