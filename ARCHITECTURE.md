# SkillOS Architecture

## Scope

SkillOS v0.2.0 is a Node.js CLI and TypeScript library for validating, storing, resolving, and installing agent skill documents. The registry remains local JSON; hosted registry publishing is outside this release.

## Components

- `src/cli/`: Commander commands for init, publish, list, search, install, edit, validate, lint, test, info, version, and uninstall.
- `src/formats/`: Markdown/YAML parser and JSON Schema validation.
- `src/registry/`: local JSON registry and a read-only cloud API client; cloud installation/publishing is not implemented.
- `src/core/`: public errors, semver dependency resolution, lockfile generation, and security lint rules.
- `src/sandbox/`: provider interface, Anthropic/OpenAI adapters, and a child-process worker with timeout, bounded heap, permission checks, and response-size limits.
- `src/runtimes/`: file adapters for Claude Code, Codex, Aider, and OpenHands.

## Data and install flow

`publish` parses and validates a skill before storing its name, version, metadata, and document in `~/.skillos/registry/registry.json`. `install` resolves semver ranges recursively, detects cycles, rejects missing or conflicting dependencies before writing, installs dependencies in topological order, writes runtime files, and records exact resolved versions in `skillos.lock`.

Runtime destinations are `.claude/skills/<name>/SKILL.md`, managed sections in `AGENTS.md` and `CONVENTIONS.md`, and `.openhands/microagents/<name>.md`. Codex/Aider sections use markers so updates preserve surrounding user content. Names and destination paths are validated; symbolic-link targets are rejected.

## Skill execution and security model

Skills are Markdown instructions, not executable programs. `skillos test` sends each manifest eval scenario to a configured LLM provider. Provider API calls execute in a child process, launched with a bounded V8 heap, a timeout, restricted environment variables, and capped output. Provider credentials are copied only into this process through environment variables.

Manifest-requested network, shell, and file-write permissions are compared with host opt-in settings. The current implementation does not expose shell or filesystem tools to the LLM. The child process provides process separation and resource bounds, but not a kernel-enforced security boundary. Untrusted code execution and Docker isolation are not supported.

## Public API

`src/index.ts` re-exports parser/schema, registry types and clients, dependency resolver and lockfile helpers, sandbox/provider interfaces, security lint rules, runtime adapters, and error classes. CommonJS output and declarations are built into `dist/`.

## Validation and tests

The CI matrix runs install, typecheck, lint, Jest with 80% statement/line/function coverage thresholds, and build on Node 18/20/22 and Ubuntu/Windows/macOS. Unit tests cover resolver, parser, registry, provider adapters, process lifecycle, and runtime adapters. CLI lifecycle tests use temporary home/project directories.
