# SkillOS Roadmap

This document outlines the development roadmap for SkillOS. The roadmap focuses on practical priorities that bring the most value to users.

## Current Status: v0.1.0 MVP

### ✅ Completed (v0.1.0)
- [x] Core architecture design
- [x] Skill format specification (markdown + JSON schema)
- [x] Basic CLI with init/install/publish/list/search/edit
- [x] Local JSON-based registry (not SQLite for simplicity)
- [x] Basic sandbox (simulation/placeholder)
- [x] Template skills (research, code-review, content-creation, data-analysis, personal-assistant)
- [x] Unit tests (13/13 passing)
- [x] Build system and TypeScript compilation

### ⚠️ Known Limitations in v0.1.0
- Sandbox is a simulation - no actual AI execution
- Dependencies declared but not resolved
- Runtime compatibility is metadata only
- No skill composition
- Local registry only
- Basic security (no real isolation)

## Near-Term Priorities (v0.2.0 - Next Release)

### High Priority
These are the most impactful improvements for the next release:

1. **Dependency Resolver**
   - Parse and validate skill dependencies
   - Resolve dependency versions
   - Detect circular dependencies
   - Install dependencies from local registry
   - Dependency tree visualization

2. **Real Sandbox with Basic Isolation**
   - Replace simulation with actual execution
   - Add Node.js vm module for basic isolation
   - Permission enforcement (shell, network, file access)
   - Resource limiting (timeout, memory)
   - Clear warnings about security limitations

3. **Error Handling**
   - Custom error classes for better error messages
   - Validation errors with clear context
   - Registry errors (not found, version conflict)
   - Sandbox errors (permission denied, timeout)
   - CLI error formatting

4. **Core Module Improvements**
   - Export DependencyResolver
   - Export SkillExecutor interface
   - Export error classes
   - Better API documentation

### Medium Priority

5. **Registry Enhancements**
   - Skill update/upgrade commands
   - Skill uninstall with dependency cleanup
   - Version conflict resolution
   - Better search indexing

6. **CLI UX Improvements**
   - Better error messages
   - Progress indicators
   - Interactive prompts for choices
   - Auto-completion support

7. **Testing**
   - Integration tests for CLI
   - End-to-end skill lifecycle tests
   - Better test coverage

## Medium-Term Plans (v0.3.0 - v0.4.0)

### Cloud Registry (v0.3.0)
- Design and implement cloud registry API
- Authentication and authorization
- Skill rating and review system
- Download statistics
- Private skill repositories

### Advanced Sandbox (v0.4.0)
- Docker-based isolation
- Runtime-specific execution adapters
- Network access control
- File system sandboxing
- Security policy enforcement

## Long-Term Vision (v0.5.0+)

### Skill Studio (Web-Based Editor)
- Visual + text editor with live preview
- Real-time validation
- Template picker
- Skill version comparison
- Dependency graph visualization

### Skill Graph & Composition
- Skills can depend on and call each other
- Skill chaining and pipelines
- Skill orchestration
- Dependency graph visualization
- Impact analysis

### Ecosystem Features
- Official skill marketplace
- Skill verification program
- Community templates
- AI-powered skill recommendation
- Enterprise features (SSO, private registries)

## Release Schedule

- **v0.1.0** - Current (MVP) ✅
- **v0.2.0** - Next (Dependency resolver, real sandbox, error handling)
- **v0.3.0** - Cloud registry
- **v0.4.0** - Advanced sandbox with Docker
- **v0.5.0** - Skill Studio
- **v1.0.0** - Skill graph, composition, ecosystem polish

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Priority Areas for Contribution
- Dependency resolver implementation
- Sandbox improvements
- Additional template skills
- Documentation improvements
- Bug fixes
- Test coverage

### Good First Issues
- Add more template skills
- Improve error messages
- Add CLI auto-completion
- Add integration tests
- Improve search in registry

## Questions or Suggestions?

Open an issue or start a discussion on GitHub. We value community input in shaping the roadmap.

## Notes

This roadmap is flexible and will evolve based on:
- Community feedback and needs
- Technical challenges discovered
- Changes in the AI agent ecosystem
- Resource availability

The focus is on delivering practical value incrementally rather than building everything at once.
