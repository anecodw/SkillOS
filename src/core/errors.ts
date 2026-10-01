/**
 * Custom error classes for SkillOS
 * Provides better error messages and error handling
 */

export class SkillOSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ParseError extends SkillOSError {
  constructor(message: string) {
    super(`Parse error: ${message}`);
  }
}

export class ValidationError extends SkillOSError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
  }
}

export class RegistryError extends SkillOSError {
  constructor(message: string) {
    super(`Registry error: ${message}`);
  }
}

export class SkillNotFoundError extends RegistryError {
  constructor(skillName: string, version?: string) {
    const versionStr = version ? `@${version}` : '';
    super(`Skill '${skillName}${versionStr}' not found in registry`);
  }
}

export class VersionConflictError extends RegistryError {
  constructor(skillName: string, requested: string, installed: string) {
    super(`Version conflict for '${skillName}': requested ${requested}, but ${installed} is installed`);
  }
}

export class DependencyError extends SkillOSError {
  constructor(message: string) {
    super(`Dependency error: ${message}`);
  }
}

export class CircularDependencyError extends DependencyError {
  constructor(skillName: string) {
    super(`Circular dependency detected involving '${skillName}'`);
  }
}

export class DependencyNotFoundError extends DependencyError {
  constructor(skillName: string, version?: string) {
    const versionStr = version ? `@${version}` : '';
    super(`Dependency '${skillName}${versionStr}' not found`);
  }
}

export class SandboxError extends SkillOSError {
  constructor(message: string) {
    super(`Sandbox error: ${message}`);
  }
}

export class PermissionDeniedError extends SandboxError {
  constructor(permission: string) {
    super(`Permission denied: ${permission} not allowed`);
  }
}

export class ExecutionTimeoutError extends SandboxError {
  constructor(timeout: number) {
    super(`Execution timeout after ${timeout}ms`);
  }
}

export class SecurityError extends SkillOSError {
  constructor(message: string) {
    super(`Security error: ${message}`);
  }
}
