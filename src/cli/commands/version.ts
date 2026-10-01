import path from 'path';
import semver from 'semver';
import { SkillParser } from '../../formats';

export async function versionCommand(increment: string, filePath = path.resolve('skill.md')): Promise<void> {
  const skill = await new SkillParser().parseFile(filePath);
  const next = semver.valid(increment) ? increment : semver.inc(skill.version, increment as semver.ReleaseType);
  if (!next) throw new Error(`Invalid semver increment '${increment}'`);
  skill.version = next;
  await new SkillParser().writeToFile(skill, filePath);
  console.log(`${skill.name}: ${next}`);
}
