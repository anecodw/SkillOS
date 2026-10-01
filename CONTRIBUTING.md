# Contributing to SkillOS

Contributions are welcome. Please use focused changes, add or update tests, and keep the skill document format backward-compatible.

## Setup

- Node.js 18, 20, or 22
- Git and npm

```bash
git clone https://github.com/anecodw/SkillOS.git
cd SkillOS
npm ci
npm run typecheck
npm run lint
npm run test:coverage
npm run build
```

## Workflow

Create a feature branch from `main`, make a small change, and run all four checks before opening a pull request. Conventional commit prefixes are recommended: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, and `chore:`.

Pull requests should explain user-visible behavior, list validation commands and results, update `CHANGELOG.md` when appropriate, and include focused tests. GitHub Actions checks Node 18/20/22 on Ubuntu, Windows, and macOS.

## Skill templates

Templates live in `examples/templates/`. Each template must parse and validate with `SkillParser`; add an integration assertion when behavior is changed. Keep permissions least-privilege, include eval cases where meaningful, and do not place credentials in YAML or instructions.

## Security reports

Do not report exploitable vulnerabilities in public issues. Follow [SECURITY.md](.github/SECURITY.md) for private reporting. Static lint is heuristic and should not be treated as a complete security review.

## License

By contributing, you agree that contributions are licensed under the MIT License.
