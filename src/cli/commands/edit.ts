import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';
import { SkillParser } from '../../formats';

export async function editCommand(filePath = path.resolve('skill.md')): Promise<void> {
  if (!(await fs.pathExists(filePath))) throw new Error(`Skill file not found: ${filePath}`);
  const parser = new SkillParser();
  const skill = await parser.parseFile(filePath);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (question: string): Promise<string> => new Promise(resolve => rl.question(question, resolve));
  try {
    const choice = await ask('Edit 1) name 2) version 3) description 4) instructions 5) exit: ');
    if (choice === '1') skill.name = await ask('New name: ');
    else if (choice === '2') skill.version = await ask('New version: ');
    else if (choice === '3') skill.description = await ask('New description: ');
    else if (choice === '4') skill.instructions = await ask('New instructions (single line): ');
    else if (choice === '5') return;
    else throw new Error('Choose a number from 1 to 5');
    await parser.writeToFile(skill, filePath);
    console.log(`Updated ${skill.name}@${skill.version}`);
  } finally {
    rl.close();
  }
}
