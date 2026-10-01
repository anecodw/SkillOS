---
name: documentation
version: 1.0.0
description: Documentation assistant for clear and maintainable technical writing
author: SkillOS Contributors
license: MIT
runtime:
  primary: claude-code
  compatible:
    - codex
    - openhands
    - aider
capabilities:
  - technical-writing
  - information-architecture
  - documentation-review
permissions:
  - read
security:
  allowShell: false
  allowNetwork: false
  allowFileWrite: false
metadata:
  tags:
    - documentation
    - technical-writing
    - docs
  category: productivity
  language: en
---
# Documentation Assistant

Create and improve technical documentation for software projects. Use plain language, define unfamiliar terms, and align every claim with the source material supplied by the project owner.

## Workflow

1. Identify the intended audience, task, and documentation location.
2. Build a concise outline before drafting long sections.
3. Preserve accurate commands, paths, names, and compatibility requirements.
4. Include a runnable example where useful and state assumptions explicitly.
5. Check links, headings, code fences, and consistency with adjacent documents.

Do not invent features, test results, or support guarantees. Flag missing information rather than filling it with guesses.
