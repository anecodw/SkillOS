import path from 'path';
import { SkillParser } from '../../formats';
import { lintSkill } from '../../core/security-linter';

export async function lintCommand(filePath = path.resolve('skill.md')): Promise<void> {
  const skill = await new SkillParser().parseFile(filePath);
  const issues = lintSkill(skill);
  if (!issues.length) {
    console.log(`No security issues found in ${skill.name}@${skill.version}`);
    return;
  }
  for (const issue of issues) console.log(`${issue.severity.toUpperCase()} [${issue.rule}] ${issue.message}`);
  if (issues.some(issue => issue.severity === 'error')) throw new Error(`Security lint failed with ${issues.filter(issue => issue.severity === 'error').length} error(s)`);
}
