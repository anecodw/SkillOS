# SkillOS

**Operating system for AI agent skills**

![npm version](https://img.shields.io/npm/v/skillos)
![License](https://img.shields.io/npm/l/skillos)
![Node](https://img.shields.io/node/v/skillos)

SkillOS is an open-source platform for creating, testing, versioning, and distributing Agent Skills - markdown/JSON descriptions of AI agent behaviors that are rapidly emerging on GitHub.

## Vision

Agent skills are currently just files. SkillOS transforms them into a full-featured product with:

- **Skill Studio** - Visual + text editor with live preview
- **Automated Testing** - Sandbox environment with eval sets
- **Versioning** - Semantic versioning with runtime compatibility
- **CLI** - Instant installation like npm/yarn for agent skills
- **Registry** - Local and cloud registry with search and ratings
- **Skill Graph** - Skills can depend on and call each other
- **Security** - Static analysis and isolated execution sandbox
- **Templates** - Ready-to-use skill templates for common scenarios

## Current Status (v0.1.0)

**This is an MVP release with the following limitations:**

### ✅ What Works
- **CLI Commands**: init, publish, list, search, install, edit
- **Local Registry**: JSON-based storage (not SQLite)
- **Skill Parser**: Markdown + YAML front matter + JSON Schema validation
- **Template Skills**: 5 ready-to-use templates
- **Tests**: 13/13 passing unit tests

### ⚠️ Current Limitations
- **Sandbox**: Currently a simulation/placeholder - returns a string instead of real AI execution
- **Dependencies**: Declared in schema but not resolved or installed
- **Runtime Compatibility**: Metadata only - no actual runtime integration
- **Core Module**: Minimal exports - dependency resolver not yet implemented
- **Cloud Registry**: Not implemented - local registry only
- **No Skill Composition**: Skills cannot depend on or call other skills

### 🚧 What's Coming
See [ROADMAP.md](ROADMAP.md) for detailed plans.

## Features

### Skill Format

Skills are defined in an extended markdown format with JSON front matter:

```markdown
---
name: my-skill
version: 1.0.0
description: A useful skill for AI agents
author: Your Name
runtime:
  primary: claude-code
  compatible:
    - codex
    - openhands
instructions: |
# My Skill

You are a specialized AI agent that...
```

### CLI Commands

```bash
# Initialize a new skill
skillos init my-skill

# Install a skill from registry
skillos install username/skill-name

# Publish a skill
skillos publish

# List available skills
skillos list

# Search for skills
skillos search "code review"

# Edit a skill
skillos edit my-skill
```

### Local Registry

- **JSON-based storage** for skill metadata (simple, cross-platform, no native dependencies)
- Fast search and indexing
- Version management
- Download tracking

### Sandbox Testing

> **⚠️ Note**: The sandbox is currently a simulation/placeholder. It returns a string showing what would happen, but does not actually execute AI agents. This will be replaced with a proper isolated execution environment in future versions.

- Permission checking (shell, network, file write)
- Eval scenario testing
- Security validation

## Installation

```bash
# Clone the repository
git clone https://github.com/skillos/skillos.git
cd skillos

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm link
```

## Quick Start

### Creating Your First Skill

```bash
# Initialize a new skill
skillos init my-awesome-skill

# Navigate to the skill directory
cd my-awesome-skill

# Edit skill.md
# Customize the skill according to your needs

# Publish to local registry
skillos publish
```

### Using Template Skills

SkillOS includes several template skills to get you started:

- **research** - Advanced research assistant
- **code-review** - Automated code review
- **content-creation** - Technical writing assistant
- **data-analysis** - Data processing and visualization
- **personal-assistant** - Productivity and task management

Copy a template from `examples/templates/` and customize it.

### Listing and Searching Skills

```bash
# List all installed skills
skillos list

# Search for skills
skillos search "research"
```

## Architecture

```
skillos/
├── src/
│   ├── cli/           # Command-line interface
│   ├── core/          # Core library
│   ├── formats/       # Skill format and parser
│   ├── registry/      # Local and cloud registry
│   └── sandbox/       # Execution sandbox
├── examples/
│   └── templates/     # Example skill templates
└── dist/             # Compiled output
```

### Components

- **CLI Layer** - User interface with commands: init, install, publish, list, search, edit
- **Core Library** - Skill parser, validator, executor, dependency resolver (planned)
- **Registry** - Local (JSON-based) and cloud (REST API, planned) registries
- **Sandbox** - Execution environment (currently simulation, will be isolated in future)
- **Formats** - JSON schema validation and markdown parsing

## Skill Format Reference

### Required Fields

- `name` - Skill name in kebab-case
- `version` - Semantic version (e.g., 1.0.0)
- `description` - Short description (10-500 chars)
- `author` - Author name or organization
- `runtime` - Supported AI agent runtimes
- `instructions` - Instructions for the AI agent

### Optional Fields

- `license` - License (default: MIT)
- `capabilities` - List of capabilities
- `dependencies` - Other skills this depends on (not yet resolved)
- `permissions` - Required permissions (read, write, network, system, database)
- `security` - Security policies
- `eval` - Test scenarios
- `metadata` - Tags, category, language

### Runtime Compatibility

Supported runtimes (metadata only, no actual integration):
- `claude-code` - Claude Code / Devin
- `codex` - OpenAI Codex
- `openhands` - OpenHands
- `aider` - Aider
- `custom` - Custom implementations

## Development

```bash
# Install dependencies
npm install

# Watch mode for development
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run typecheck

# Build
npm run build
```

## Limitations

This is an early MVP. Key limitations:

1. **No actual AI execution** - Sandbox is a simulation
2. **No dependency resolution** - Dependencies are declared but not installed
3. **No runtime integration** - Compatibility is metadata only
4. **Local registry only** - No cloud registry yet
5. **No skill composition** - Skills cannot call other skills
6. **Basic security** - No real isolation or sandboxing

See [ROADMAP.md](ROADMAP.md) for plans to address these limitations.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed development plans.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

We welcome contributions! Priority areas:
- Dependency resolver implementation
- Real sandbox with isolation
- Additional template skills
- Documentation improvements
- Bug fixes

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Inspired by npm, PyPI, and other package managers
- Built for the emerging AI agent ecosystem
- Community-driven skill development

## Contact

- GitHub: https://github.com/skillos/skillos
- Issues: https://github.com/skillos/skillos/issues
