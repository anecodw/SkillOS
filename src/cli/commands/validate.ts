import path from 'path';
import { SkillParser } from '../../formats';

export async function validateCommand(filePath = path.resolve('skill.md')): Promise<void> {
  const skill = await new SkillParser().parseFile(filePath);
  console.log(`Valid skill: ${skill.name}@${skill.version}`);
}
