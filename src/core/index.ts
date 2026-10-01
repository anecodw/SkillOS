/**
 * Core library exports for SkillOS
 * 
 * This module provides the core functionality for working with skills:
 * - Skill parsing and validation
 * - Dependency resolution
 * - Error handling
 * - Registry clients
 */

// Skill format and parsing
export { SkillParser, Skill } from '../formats';
export { default as skillSchema } from '../formats/skill-schema.json';

// Dependency resolution
export { DependencyResolver } from './dependency-resolver';
export type { DependencyNode, ResolutionResult } from './dependency-resolver';

// Error handling
export {
  SkillOSError,
  ParseError,
  ValidationError,
  RegistryError,
  SkillNotFoundError,
  VersionConflictError,
  DependencyError,
  CircularDependencyError,
  DependencyNotFoundError,
  SandboxError,
  PermissionDeniedError,
  ExecutionTimeoutError,
  SecurityError
} from './errors';

// Registry clients
export { LocalRegistry } from '../registry/local-registry';
export { CloudRegistry } from '../registry/cloud-registry';
export type { RegistryClient, SkillPackage, SkillSearchResult, RegistryConfig } from '../registry/types';

// Sandbox
export { BasicSandbox } from '../sandbox/basic-sandbox';
export type { Sandbox, SandboxConfig, EvalScenario, EvalResult } from '../sandbox/types';
