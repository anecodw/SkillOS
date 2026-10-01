# SkillOS

**CLI и библиотека для создания, проверки, версионирования и установки навыков ИИ-агентов.** Навык — это переносимый Markdown-файл с YAML front matter; локальный реестр хранит опубликованные версии в JSON.

[![npm version](https://img.shields.io/npm/v/skillos)](https://www.npmjs.com/package/skillos)
[![CI](https://github.com/anecodw/SkillOS/actions/workflows/ci.yml/badge.svg)](https://github.com/anecodw/SkillOS/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Быстрый старт

```bash
npm install -g skillos
skillos init my-research-skill
skillos validate my-research-skill/skill.md
```

Пример вывода:

```text
$ skillos validate my-research-skill/skill.md
Valid skill: my-research-skill@0.1.0
```

Чтобы опубликовать навык в локальный JSON-реестр и установить его для Claude Code:

```bash
cd my-research-skill
skillos publish skill.md
skillos install my-research-skill --runtime claude-code
```

## Возможности v0.2.0

- Валидация Markdown + YAML front matter по JSON Schema.
- Локальный JSON-реестр, semver-зависимости, транзитивное разрешение и `skillos.lock`.
- Установка в Claude Code, Codex, Aider и OpenHands.
- Статические проверки безопасности и eval-сценарии.
- Библиотечный API для TypeScript/Node.js.
- Провайдеры LLM Anthropic и OpenAI с ключами только из переменных окружения.

## Команды CLI

| Команда | Назначение |
| --- | --- |
| `skillos init <name>` | Создать заготовку навыка |
| `skillos validate [path]` | Проверить файл навыка |
| `skillos lint [path]` | Проверить опасные шаблоны и несогласованные разрешения |
| `skillos publish [path]` | Добавить версию навыка в локальный реестр |
| `skillos install <name[@range]> [--runtime <name>]` | Установить навык и его зависимости |
| `skillos list [--json]` | Показать навыки локального реестра |
| `skillos search <query> [--json]` | Найти навык |
| `skillos info <name[@version]> [--json]` | Показать манифест навыка |
| `skillos test [path] [--allow-network] [--timeout <ms>]` | Запустить eval-сценарии через настроенный LLM |
| `skillos version <major\|minor\|patch\|semver> [path]` | Обновить semver-версию файла |
| `skillos uninstall <name> [--runtime <name>]` | Удалить локальную и runtime-установку |
| `skillos edit [path]` | Интерактивно изменить основные поля |

Справка для любой команды доступна через `skillos <command> --help`.

## Формат навыка

```markdown
---
name: research
version: 1.0.0
description: Research assistant for technical topics and source synthesis
author: Example Team
license: MIT
runtime:
  primary: claude-code
  compatible:
    - codex
permissions:
  - read
  - network
security:
  allowShell: false
  allowNetwork: true
  allowFileWrite: false
dependencies:
  source-checker: ^1.2.0
eval:
  scenarios:
    - name: cite-sources
      input: Summarize the provided sources
      expected: Sources
---
# Research assistant

Instructions for the AI agent go here. They must contain at least 50 characters.
```

The front matter is validated against [`src/formats/skill-schema.json`](src/formats/skill-schema.json). Dependency ranges use npm semver syntax. Installed dependency versions are recorded in `skillos.lock` in the current project.

## Runtime integration

- `claude-code`: `.claude/skills/<name>/SKILL.md`
- `codex`: a managed section in `AGENTS.md`
- `aider`: a managed section in `CONVENTIONS.md`
- `openhands`: `.openhands/microagents/<name>.md`

Managed Codex/Aider sections are updated without replacing unrelated file content. The adapter refuses symbolic-link targets and unsafe skill names.

## LLM configuration and security

`skillos test` sends the skill instructions and each eval input to the selected provider. Configure credentials in the environment, never in a skill manifest or repository:

- Anthropic: `ANTHROPIC_API_KEY`; optional `ANTHROPIC_MODEL`.
- OpenAI: `OPENAI_API_KEY`; optional `OPENAI_MODEL`.
- Optional provider selector: `SKILLOS_LLM_PROVIDER=anthropic|openai`.

The request runs in a child Node.js process with a bounded heap, response-size limit, and timeout. Network, shell, and file-write permissions are checked against both the skill manifest and host opt-in flags. Network execution requires `--allow-network`; the sandbox does not expose a shell or filesystem tool to the model.

**Security boundary:** a child process and Node heap limit are not an operating-system sandbox. Skill instructions are sent to an LLM; SkillOS does not execute arbitrary code from the Markdown file. Review skills before use, keep API keys private, and do not treat the static linter as a complete security audit. The cloud registry and a Docker isolation backend are not part of v0.2.0.

## Local registry

The registry is stored at `~/.skillos/registry/registry.json` (or the platform home directory equivalent). It is local-only; publishing to it does not publish to npm or a hosted marketplace. Installation copies skills under `~/.skillos/skills/` and writes runtime-specific files in the current project.

## Use as a library

```typescript
import { DependencyResolver, LocalRegistry, SkillParser } from 'skillos';

const parser = new SkillParser();
const skill = await parser.parseFile('skill.md');
const registry = new LocalRegistry();
const dependencies = await new DependencyResolver(registry).resolve(skill.name, skill.version);
console.log(dependencies.order.map(item => `${item.name}@${item.version}`));
```

The public entry point exports parsers, registry clients, dependency tools, runtime adapters, sandbox types/providers, errors, and security lint helpers.

## Development

```bash
npm ci
npm run typecheck
npm run lint
npm run test:coverage
npm run build
npm pack --dry-run
```

Supported runtime: Node.js 18, 20, and 22. See [ARCHITECTURE.md](ARCHITECTURE.md), [CONTRIBUTING.md](CONTRIBUTING.md), and [ROADMAP.md](ROADMAP.md).

## License and links

MIT — see [LICENSE](LICENSE).

- Repository: https://github.com/anecodw/SkillOS
- Issues: https://github.com/anecodw/SkillOS/issues
- npm: https://www.npmjs.com/package/skillos
