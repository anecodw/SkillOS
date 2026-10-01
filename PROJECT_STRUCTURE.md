# SkillOS Project Structure

```text
skillos/
├── .github/                 CI, release workflow, issue/PR templates, security policy
├── examples/templates/      Eight valid Markdown/YAML skill templates
├── src/
│   ├── cli/                 Commander CLI and command lifecycle tests
│   ├── core/                Dependency resolver, lockfile, errors, security linter
│   ├── formats/             Skill interface, parser, schema, template tests
│   ├── registry/            Local JSON registry and cloud read client
│   ├── runtimes/            Claude Code, Codex, Aider, OpenHands adapters
│   ├── sandbox/             LLM providers, child-process runner, eval tests
│   └── index.ts             Public TypeScript API
├── .gitignore
├── ARCHITECTURE.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── jest.config.js
├── package.json
├── package-lock.json
├── README.md
├── ROADMAP.md
└── tsconfig.json
```

## Public package

- `dist/index.js` and `dist/index.d.ts` expose the library.
- `dist/cli/index.js` exposes the `skillos` binary.
- `dist/sandbox/llm-worker.js` is the child-process entrypoint.
- `npm pack --dry-run` includes only `dist/`, README, changelog, and license; tests and source-only development files are excluded.

## Development

Install with `npm ci`. Run `npm run typecheck`, `npm run lint`, `npm run test:coverage`, and `npm run build`. Generated `dist/`, coverage output, and `tsconfig.tsbuildinfo` are ignored by Git.
