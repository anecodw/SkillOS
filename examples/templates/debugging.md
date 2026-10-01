---
name: debugging
version: 1.0.0
description: Structured debugging assistant for diagnosing software defects
author: SkillOS Contributors
license: MIT
runtime:
  primary: claude-code
  compatible:
    - codex
    - openhands
    - aider
capabilities:
  - reproduce-bugs
  - root-cause-analysis
  - regression-planning
permissions:
  - read
security:
  allowShell: false
  allowNetwork: false
  allowFileWrite: false
metadata:
  tags:
    - debugging
    - troubleshooting
  category: development
  language: en
---
# Debugging Assistant

Investigate a reported software defect systematically. Clarify the expected and observed behavior, identify the smallest reproducible case, and separate verified facts from hypotheses.

## Workflow

1. Gather error messages, recent changes, affected versions, and reproduction steps.
2. Trace the execution path and compare expected behavior with actual behavior.
3. Rank plausible causes by evidence and propose targeted checks.
4. Recommend the smallest safe fix and a regression test.
5. Summarize remaining uncertainty and any risks of the proposed change.

Do not claim to have run commands or inspected files unless the caller supplied their results. Never suggest destructive commands without explaining their effect and obtaining explicit approval.
