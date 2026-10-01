#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { installCommand } from './commands/install';
import { publishCommand } from './commands/publish';
import { listCommand } from './commands/list';
import { searchCommand } from './commands/search';
import { editCommand } from './commands/edit';
import { validateCommand } from './commands/validate';
import { lintCommand } from './commands/lint';
import { testCommand } from './commands/eval';
import { infoCommand } from './commands/info';
import { versionCommand } from './commands/version';
import { uninstallCommand } from './commands/uninstall';

function handle(action: () => Promise<void>): Promise<void> {
  return action().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

export function createProgram(): Command {
  const program = new Command();
  program.name('skillos').description('CLI for creating, validating, testing, and distributing AI agent skills').version('0.2.0');
  program.command('init <name>').description('Initialize a new skill project').action((name: string) => handle(() => initCommand(name)));
  program.command('install <skill>').description('Install a skill and its dependencies').option('--runtime <name>', 'Install for claude-code, codex, aider, or openhands')
    .action((skill: string, options: { runtime?: string }) => handle(() => installCommand(skill, options.runtime)));
  program.command('publish [path]').description('Publish a validated skill to the local registry').action((filePath?: string) => handle(() => publishCommand(filePath)));
  program.command('list').description('List skills in the local registry').option('--json', 'Print JSON')
    .action((options: { json?: boolean }) => handle(() => listCommand(Boolean(options.json))));
  program.command('search <query>').description('Search the local registry').option('--json', 'Print JSON')
    .action((query: string, options: { json?: boolean }) => handle(() => searchCommand(query, Boolean(options.json))));
  program.command('edit [path]').description('Edit a skill file interactively').action((filePath?: string) => handle(() => editCommand(filePath)));
  program.command('validate [path]').description('Validate a skill file').action((filePath?: string) => handle(() => validateCommand(filePath)));
  program.command('lint [path]').description('Run static security analysis on a skill').action((filePath?: string) => handle(() => lintCommand(filePath)));
  program.command('test [path]').description('Run eval scenarios using the configured LLM provider')
    .option('--allow-network', 'Allow network access for the LLM provider')
    .option('--allow-shell', 'Permit a skill that requests shell access')
    .option('--allow-file-write', 'Permit a skill that requests file write')
    .option('--timeout <ms>', 'Execution timeout in milliseconds')
    .action((filePath: string | undefined, options: { allowNetwork?: boolean; allowShell?: boolean; allowFileWrite?: boolean; timeout?: string }) => handle(() => testCommand(filePath, options)));
  program.command('version <increment> [path]').description('Bump skill version (major, minor, patch, prerelease, or exact semver)')
    .action((increment: string, filePath?: string) => handle(() => versionCommand(increment, filePath)));
  program.command('uninstall <skill>').description('Remove a locally installed skill').option('--runtime <name>', 'Remove only from one runtime')
    .action((skill: string, options: { runtime?: string }) => handle(() => uninstallCommand(skill, options.runtime)));
  program.command('info <skill>').description('Show a skill from the local registry').option('--json', 'Print JSON')
    .action((skill: string, options: { json?: boolean }) => handle(() => infoCommand(skill, Boolean(options.json))));
  return program;
}

if (require.main === module) createProgram().parseAsync(process.argv).catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
