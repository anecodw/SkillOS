# SkillOS Roadmap

## v0.2.0 — Release scope

- [x] Semver dependency resolution, transitive graph, cycle detection, and missing-range reporting.
- [x] Exact resolved versions written to `skillos.lock`; installation refuses missing/conflicting dependencies.
- [x] Local install resolves and installs dependencies in dependency order.
- [x] Child-process LLM runner with timeout, heap/output limits, permission checks, and explicit API-key errors.
- [x] Anthropic and OpenAI providers plus injectable mock provider for tests.
- [x] Runtime installation adapters for Claude Code, Codex, Aider, and OpenHands.
- [x] CLI `test`, `validate`, `lint`, `version`, `uninstall`, and `info` commands; JSON output for list/search/info.
- [x] Public TypeScript API, template validation, three additional templates, CLI integration tests, and 80% coverage gate.
- [x] Cross-platform CI matrix and tagged npm/GitHub release workflow.

### Limitations retained

- The registry is local JSON only; the hosted CloudRegistry is read-only for search/list/get.
- Skill documents are LLM instructions, not executable programs. The child process is not a kernel-level sandbox, and shell/file tools are not exposed.
- A Docker isolation backend, hosted marketplace, and skill composition are deferred.
- Runtime files are generated for each supported format; this does not install or configure the runtime application itself.

## v0.3.0 — Registry and compatibility

- [ ] Hosted registry with authentication, publishing, download statistics, and private namespaces.
- [ ] Registry update/upgrade commands and richer dependency conflict strategies.
- [ ] Runtime compatibility tests against supported agent applications.
- [ ] Registry integrity metadata and signature verification.

## v0.4.0 — Execution isolation

- [ ] Optional Docker/OCI execution backend with filesystem and network policy controls.
- [ ] Resource and process limits enforced at the operating-system/container level.
- [ ] Auditable tool adapters with per-tool permissions.

## v0.5.0+ — Ecosystem

- [ ] Skill Studio with live validation and version comparison.
- [ ] Skill composition and dependency graph visualization.
- [ ] Community marketplace, verification, and recommendations.

See [ARCHITECTURE.md](ARCHITECTURE.md) for implementation boundaries and [CONTRIBUTING.md](CONTRIBUTING.md) for development guidance.
