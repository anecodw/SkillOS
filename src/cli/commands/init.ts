import fs from 'fs-extra';
import path from 'path';
import { Skill, SkillParser } from '../../formats';

export async function initCommand(skillName: string): Promise<void> {
  const skillDir = path.join(process.cwd(), skillName);
  
  if (await fs.pathExists(skillDir)) {
    throw new Error(`Directory ${skillName} already exists`);
  }

  await fs.ensureDir(skillDir);

  const skill: Skill = {
    name: skillName,
    version: '0.1.0',
    description: 'A new skill for AI agents',
    author: 'Your Name',
    license: 'MIT',
    runtime: {
      primary: 'claude-code',
      compatible: ['codex', 'openhands']
    },
    instructions: `# ${skillName}

Describe what this skill does and how the AI agent should use it.

## Purpose
Explain the main purpose of this skill.

## Usage
Describe when and how this skill should be invoked.

## Capabilities
- List the main capabilities of this skill
- Each capability should be clearly defined

## Notes
Add any additional notes or context for the AI agent.`,
    capabilities: ['general-purpose'],
    permissions: ['read', 'write'],
    security: {
      allowShell: false,
      allowNetwork: false,
      allowFileWrite: true
    },
    metadata: {
      tags: ['ai', 'agent', 'skill'],
      category: 'general',
      language: 'en'
    }
  };

  const parser = new SkillParser();
  const content = parser.stringify(skill);
  
  await fs.writeFile(path.join(skillDir, 'skill.md'), content, 'utf-8');
  
  console.log(`✓ Created new skill: ${skillName}`);
  console.log(`✓ Directory: ${skillDir}`);
  console.log(`✓ Edit skill.md to customize your skill`);
}
