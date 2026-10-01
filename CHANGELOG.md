# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-01

### Added
- Initial MVP release of SkillOS
- CLI commands: init, install, publish, list, search, edit
- Local JSON-based registry for skill storage
- Skill parser with markdown + YAML front matter + JSON Schema validation
- Sandbox with Node.js vm isolation for basic execution isolation
- Dependency resolver for skill dependency management
- Custom error classes for better error handling
- 5 template skills: research, code-review, content-creation, data-analysis, personal-assistant
- Unit tests (13/13 passing)
- TypeScript implementation with full type safety
- Skill format specification with required and optional fields
- Runtime compatibility metadata (claude-code, codex, openhands, aider, custom)
- Permission system (read, write, network, system, database)
- Eval scenario support for skill testing
- Security policy declarations
- Core module with useful exports (DependencyResolver, error classes, Sandbox)

### Known Limitations
- Sandbox uses Node.js vm for basic isolation but is NOT production-ready
- No actual AI execution - sandbox returns simulated output
- Dependency resolver implemented but not yet integrated into CLI commands
- Runtime compatibility is metadata only - no actual integration
- No skill composition - skills cannot depend on or call other skills
- Local registry only - no cloud registry
- Basic security - vm isolation is not sufficient for untrusted code

### Documentation
- README.md with installation and usage instructions
- ARCHITECTURE.md with system design and decisions
- PROJECT_STRUCTURE.md with file organization
- ROADMAP.md with development plans
- CONTRIBUTING.md with contribution guidelines

## [Unreleased]

### Planned for v0.2.0
- Integrate dependency resolver into CLI commands
- Registry enhancements (update, upgrade, uninstall commands)
- CLI UX improvements (better error messages, progress indicators)
- Integration tests for end-to-end workflows
- Test coverage for new modules (errors, dependency-resolver, sandbox)
- Skill execution with actual AI runtime integration

### Planned for v0.3.0
- Cloud registry implementation
- Authentication and authorization
- Skill rating and review system
- Download statistics

### Planned for v0.4.0
- Docker-based sandbox isolation
- Runtime-specific execution adapters
- Advanced security policies
- Resource limiting

### Planned for v0.5.0+
- Skill Studio (web-based editor)
- Skill graph and composition
- Skill marketplace
- Enterprise features

---

[0.1.0]: https://github.com/skillos/skillos/releases/tag/v0.1.0
