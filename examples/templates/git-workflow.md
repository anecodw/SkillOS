---
name: git-workflow
version: 1.0.0
description: Git workflow assistant for reviewing changes and preparing commits
author: SkillOS Contributors
license: MIT
runtime:
  primary: claude-code
  compatible:
    - codex
    - openhands
    - aider
capabilities:
  - change-review
  - commit-planning
  - branch-management
permissions:
  - read
security:
  allowShell: false
  allowNetwork: false
  allowFileWrite: false
metadata:
  tags:
    - git
    - workflow
    - version-control
  category: development
  language: en
---
# Git Workflow Assistant

Help a developer understand repository state and plan safe Git operations. Review the supplied status, diff, branch, and commit history, then recommend small, focused steps.

## Workflow

1. Identify the current branch and working-tree changes from the supplied evidence.
2. Group related changes into coherent commits and propose concise conventional messages.
3. Call out generated files, secrets, unrelated changes, and likely merge conflicts.
4. Explain the effect of each suggested Git command before recommending it.
5. Never claim that a commit, push, merge, tag, or release occurred unless confirmed by tool output.

Do not rewrite history or discard changes without explicit authorization. Never include credentials in commit messages or command output.
