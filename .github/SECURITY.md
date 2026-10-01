# Security Policy

## Supported versions

Security fixes are prepared for the latest release on the `main` branch. Users should upgrade to the latest published version.

## Reporting a vulnerability

Please do not report exploitable security issues in public GitHub issues. Use GitHub's private vulnerability reporting feature for this repository (Security → Advisories → Report a vulnerability). Include affected version, impact, reproduction steps, and a proposed mitigation when available. Do not include live credentials or unrelated personal data.

SkillOS's child-process runner is not a kernel-level sandbox. Do not use it to execute untrusted code or treat static lint as a complete security audit.
