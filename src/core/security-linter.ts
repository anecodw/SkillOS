import { Skill } from '../formats';

export interface SkillLintIssue {
  severity: 'error' | 'warning';
  rule: string;
  message: string;
}

const dangerousPatterns: Array<[string, RegExp]> = [
  ['shell-delete', /\b(?:rm\s+-rf|rmdir\s+\/s|del\s+\/f\s+\/s)\b/i],
  ['download-and-execute', /\b(?:curl|wget)\b[^\n|]*\|\s*(?:sh|bash|zsh|powershell)\b/i],
  ['privileged-shell', /\b(?:sudo|runas)\b/i],
  ['dynamic-eval', /\b(?:eval|exec)\s*\(/i],
  ['secret-access', /(?:\.env|id_rsa|credentials\.json|api[_-]?key)\b/i]
];

export function lintSkill(skill: Skill): SkillLintIssue[] {
  const issues: SkillLintIssue[] = [];
  const text = `${skill.instructions}\n${JSON.stringify(skill.capabilities ?? [])}`;
  const permissions = new Set(skill.permissions ?? []);
  for (const [rule, pattern] of dangerousPatterns) {
    if (pattern.test(text)) {
      const allowed = rule === 'shell-delete' || rule === 'download-and-execute' || rule === 'privileged-shell' || rule === 'dynamic-eval'
        ? skill.security?.allowShell === true && permissions.has('system')
        : false;
      issues.push({ severity: allowed ? 'warning' : 'error', rule, message: allowed
        ? `Potentially dangerous pattern '${rule}' requires explicit review.`
        : `Potentially dangerous pattern '${rule}' found without an explicitly granted matching permission.` });
    }
  }
  const security = skill.security ?? {};
  if (permissions.has('system') && security.allowShell !== true) {
    issues.push({ severity: 'error', rule: 'permission-mismatch', message: 'Permission system is declared, but security.allowShell is not enabled.' });
  }
  if (permissions.has('network') && security.allowNetwork !== true) {
    issues.push({ severity: 'error', rule: 'permission-mismatch', message: 'Permission network is declared, but security.allowNetwork is not enabled.' });
  }
  if (permissions.has('write') && security.allowFileWrite !== true) {
    issues.push({ severity: 'error', rule: 'permission-mismatch', message: 'Permission write is declared, but security.allowFileWrite is not enabled.' });
  }
  if (permissions.has('network') && !/\b(?:web|search|http|api|network|online|internet)\b/i.test(text)) {
    issues.push({ severity: 'warning', rule: 'excess-permission', message: 'Permission network is declared but no network-related capability was detected.' });
  }
  if (permissions.has('system') && !/\b(?:shell|command|terminal|execute|script)\b/i.test(text)) {
    issues.push({ severity: 'warning', rule: 'excess-permission', message: 'Permission system is declared but no shell-related capability was detected.' });
  }
  return issues;
}
