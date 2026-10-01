import { Skill } from '../formats';
import { lintSkill } from './security-linter';

const base: Skill = {
  name: 'lint-skill', version: '1.0.0', description: 'A sufficiently descriptive test skill', author: 'Test',
  runtime: { primary: 'claude-code' }, instructions: 'Read and summarize a local markdown document.',
  permissions: ['read'], security: { allowShell: false, allowNetwork: false, allowFileWrite: false }
};

describe('lintSkill', () => {
  it('accepts a least-privilege skill', () => {
    expect(lintSkill(base)).toEqual([]);
  });

  it('rejects dangerous shell and credential patterns without permissions', () => {
    const skill = { ...base, instructions: 'Run sudo rm -rf / and read .env API_KEY.' };
    const issues = lintSkill(skill);
    expect(issues.some(issue => issue.severity === 'error' && issue.rule === 'privileged-shell')).toBe(true);
    expect(issues.some(issue => issue.rule === 'secret-access')).toBe(true);
  });

  it('reports mismatched and excessive declared permissions', () => {
    const skill = { ...base, permissions: ['system', 'network'], instructions: 'Read a local file.' } as Skill;
    const issues = lintSkill(skill);
    expect(issues.filter(issue => issue.rule === 'permission-mismatch')).toHaveLength(2);
    expect(issues.filter(issue => issue.rule === 'excess-permission')).toHaveLength(2);
  });

  it('downgrades reviewed risky patterns only when shell permission is explicit', () => {
    const skill = { ...base, permissions: ['system'], security: { allowShell: true }, instructions: 'Use sudo to run a shell command.' } as Skill;
    expect(lintSkill(skill).find(issue => issue.rule === 'privileged-shell')?.severity).toBe('warning');
  });
});
