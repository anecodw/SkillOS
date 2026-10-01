# Changelog

All notable changes are documented here. This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-10-01

### Added
- Semver-aware transitive dependency resolution, cycle detection, and `skillos.lock` generation.
- Dependency installation with explicit errors for missing or conflicting versions.
- Anthropic and OpenAI LLM providers with environment-based credentials and a test-only injectable mock.
- Child-process execution with timeout, V8 heap bound, restricted environment, and output-size limit.
- Runtime adapters for Claude Code, Codex, Aider, and OpenHands.
- CLI commands `test`, `validate`, `lint`, `version`, `uninstall`, and `info`; JSON output for `list`, `search`, and `info`.
- Public TypeScript API, eight validated templates, cross-platform CI, release automation, and GitHub community/security files.
- CLI integration tests and a Jest coverage gate of at least 80% for statements, lines, and functions.

### Changed
- Package metadata, repository links, npm entry points, and README now describe the implemented v0.2.0 behavior.
- Local registry remains JSON-based; compatibility claims now distinguish generated runtime files from runtime application installation.

### Fixed
- Skill installation validates names and refuses path traversal and symbolic-link destinations.
- Dependency resolution chooses versions using semver ranges and detects cycles before installation.
- Removed the tracked TypeScript build-info artifact and ignored generated files.

### Security
- Sandbox checks manifest permissions against explicit host opt-ins and does not execute arbitrary code from Markdown.
- Documented that child-process separation is not a kernel-level security boundary.

## [0.1.0] - 2026-10-01

### Added
- Initial MVP with a CLI, local JSON registry, Markdown/YAML skill parser, five example templates, and TypeScript build.

[0.2.0]: https://github.com/anecodw/SkillOS/releases/tag/v0.2.0
[0.1.0]: https://github.com/anecodw/SkillOS/releases/tag/v0.1.0
