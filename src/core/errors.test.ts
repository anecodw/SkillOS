import {
  SkillOSError, ParseError, ValidationError, RegistryError, SkillNotFoundError, VersionConflictError,
  DependencyError, CircularDependencyError, DependencyNotFoundError, SandboxError,
  PermissionDeniedError, ExecutionTimeoutError, SecurityError
} from './errors';

describe('SkillOS errors', () => {
  it('preserves useful messages and class names for every public error', () => {
    const errors = [
      new SkillOSError('root'), new ParseError('bad'), new ValidationError('bad'), new RegistryError('bad'),
      new SkillNotFoundError('alpha', '1.0.0'), new VersionConflictError('alpha', '^2', '1'),
      new DependencyError('bad'), new CircularDependencyError('alpha'), new DependencyNotFoundError('beta'),
      new SandboxError('bad'), new PermissionDeniedError('shell'), new ExecutionTimeoutError(10), new SecurityError('bad')
    ];
    expect(errors.map(error => error.name)).toEqual(expect.arrayContaining(['ParseError', 'CircularDependencyError', 'PermissionDeniedError']));
    expect(errors.every(error => error instanceof Error && error.message.length > 0)).toBe(true);
  });
});
