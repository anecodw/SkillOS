# SkillOS Architecture

## Overview

SkillOS is a comprehensive platform for managing AI agent skills. This document describes the system architecture, component interactions, and design decisions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Layer                           │
│  (init, install, publish, list, search, edit)              │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│                      Core Library                            │
│  (SkillParser, SkillValidator, DependencyResolver)         │
└────┬───────────────┬───────────────┬────────────────────────┘
     │               │               │
┌────┴────┐    ┌────┴────┐    ┌────┴────┐
│ Registry│    │ Sandbox │    │ Formats │
└─────────┘    └─────────┘    └─────────┘
```

## Components

### 1. CLI Layer (`src/cli/`)

**Purpose**: User interface for interacting with SkillOS

**Commands**:
- `init <name>` - Initialize a new skill project
- `install <skill>` - Install a skill from registry
- `publish [path]` - Publish a skill to registry
- `list` - List all available skills
- `search <query>` - Search for skills
- `edit [path]` - Edit a skill file

**Implementation**: Uses Commander.js for command parsing

### 2. Core Library (`src/core/`)

**Purpose**: Core functionality shared across components

**Modules**:
- Skill parser and validator
- Dependency resolver (new in v0.2.0)
- Custom error classes (new in v0.2.0)
- Core exports for library usage

### 3. Formats (`src/formats/`)

**Purpose**: Define and validate skill file format

**Components**:
- `skill-schema.json` - JSON Schema for validation
- `skill-parser.ts` - Parser for markdown + YAML front matter
- Validation using AJV

**Skill Format**:
```markdown
---
name: skill-name
version: 1.0.0
description: Skill description
author: Author name
runtime:
  primary: claude-code
  compatible:
    - codex
instructions: |
# Skill instructions

Detailed instructions for the AI agent.
```

### 4. Registry (`src/registry/`)

**Purpose**: Store and manage skills

**Implementations**:
- `LocalRegistry` - JSON file-based local registry
- `CloudRegistry` - REST API client for cloud registry (placeholder)

**Features**:
- Skill versioning (semver)
- Search and indexing
- Download tracking
- Dependency management

**Design Decision**: Using JSON file instead of SQLite for simplicity and better cross-platform compatibility without native dependencies.

### 5. Sandbox (`src/sandbox/`)

**Purpose**: Isolated execution environment for testing skills

**Components**:
- `BasicSandbox` - Sandbox with Node.js vm isolation
- Security policy enforcement
- Eval scenario execution

**Features**:
- Permission checking (shell, network, file write)
- Eval scenario testing
- Basic vm isolation using Node.js vm module
- Execution timeout support

**⚠️ Security Note**: The current sandbox uses Node.js vm module for basic isolation but is NOT production-ready. It does not provide complete security isolation. For production use, consider Docker containers, vm2, or other proper isolation solutions. This is intended for development and testing purposes only.

## Data Flow

### Publishing a Skill

```
User → CLI → SkillParser → Validation → LocalRegistry → JSON File
```

1. User runs `skillos publish`
2. CLI reads skill file
3. SkillParser parses and validates
4. LocalRegistry stores skill
5. Registry updates index

### Installing a Skill

```
User → CLI → LocalRegistry → SkillParser → File System
```

1. User runs `skillos install skill-name`
2. LocalRegistry retrieves skill
3. SkillParser writes to installation directory
4. Registry increments download count

### Testing a Skill

```
User → CLI → Sandbox → Skill Execution → Results
```

1. User runs `skillos test skill`
2. Sandbox loads skill and eval scenarios
3. Sandbox executes each scenario
4. Results reported to user

## Design Decisions

### 1. JSON vs SQLite for Registry

**Decision**: JSON file-based registry

**Rationale**:
- No native dependencies required
- Simpler cross-platform compatibility
- Easier to debug and inspect
- Sufficient for MVP scale
- Can migrate to SQLite later if needed

### 2. Markdown + YAML Front Matter

**Decision**: Extended markdown with YAML front matter

**Rationale**:
- Human-readable and editable
- Supports rich content (headers, lists, code blocks)
- YAML provides structured metadata
- Familiar to developers (Jekyll, Hugo, etc.)
- Easy to version control

### 3. TypeScript

**Decision**: Full TypeScript implementation

**Rationale**:
- Type safety for complex skill schemas
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring
- Industry standard for CLI tools

### 4. CommonJS Modules

**Decision**: CommonJS instead of ES Modules

**Rationale**:
- Better compatibility with existing Node.js ecosystem
- Simpler build process
- Easier to publish to npm
- Wider tooling support

### 5. Validation-First Approach

**Decision**: Strict validation on parse and publish

**Rationale**:
- Prevents invalid skills in registry
- Catches errors early
- Ensures quality standards
- Better user experience

## Security Considerations

### 1. Skill Execution

- Skills declare required permissions
- Sandbox enforces security policies
- File system access is restricted
- Network access is opt-in
- Shell execution is disabled by default

### 2. Registry Security

- Skills are validated before publishing
- Metadata is sanitized
- File paths are restricted
- Dependencies are tracked

### 3. Data Privacy

- Local registry stores data locally
- No telemetry in MVP
- Cloud registry will require authentication

## Extensibility

### 1. Runtime Support

**Current**: claude-code, codex, openhands, aider, custom

**Extension**: Add new runtime to schema enum

### 2. Permission System

**Current**: read, write, network, system, database

**Extension**: Add granular permissions (e.g., specific URLs, directories)

### 3. Skill Composition

**Planned**: Skills can depend on and call other skills

**Implementation**: Dependency graph resolver in Phase 5

### 4. Cloud Registry

**Current**: Local registry only

**Extension**: CloudRegistry client with authentication

## Performance Considerations

### 1. Registry Search

**Current**: Linear search through JSON array

**Optimization**: Add indexing for large registries

### 2. Skill Parsing

**Current**: Parse on every read

**Optimization**: Cache parsed skills

### 3. File Operations

**Current**: Synchronous for simplicity

**Optimization**: Async operations for better performance

## Future Enhancements

### Phase 2 (Month 2)
- Dependency resolution
- Version management
- Cloud registry

### Phase 3 (Month 3)
- Web-based Skill Studio
- Live preview
- Visual editor

### Phase 4 (Month 4)
- Docker-based sandbox
- Advanced security
- Benchmarking

### Phase 5 (Month 5)
- Skill graph
- Composition
- Orchestration

### Phase 6 (Month 6)
- Performance optimization
- Community features
- Ecosystem polish

## Testing Strategy

### Unit Tests
- Skill parser validation
- Registry operations
- Sandbox execution

### Integration Tests
- CLI command flows
- End-to-end skill lifecycle

### Manual Testing
- Template skills
- Real-world scenarios

## Deployment

### Local Installation
```bash
npm install -g skillos
```

### Development
```bash
npm run build
npm link
```

### Distribution
- npm package
- GitHub releases
- Docker images (future)

## Monitoring and Logging

**Current**: Console output only

**Planned**: Structured logging, error tracking, usage analytics

## Conclusion

SkillOS is designed with simplicity, extensibility, and developer experience in mind. The architecture supports gradual enhancement from MVP to full-featured platform while maintaining backward compatibility.
