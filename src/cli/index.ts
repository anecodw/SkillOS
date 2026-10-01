#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { installCommand } from './commands/install';
import { publishCommand } from './commands/publish';
import { listCommand } from './commands/list';
import { searchCommand } from './commands/search';
import { editCommand } from './commands/edit';

const program = new Command();

program
  .name('skillos')
  .description('Operating system for AI agent skills')
  .version('0.1.0');

program
  .command('init <name>')
  .description('Initialize a new skill')
  .action(async (name) => {
    try {
      await initCommand(name);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command('install <skill>')
  .description('Install a skill from the registry')
  .action(async (skill) => {
    try {
      await installCommand(skill);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command('publish [path]')
  .description('Publish a skill to the registry')
  .action(async (path) => {
    try {
      await publishCommand(path);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all skills in the registry')
  .action(async () => {
    try {
      await listCommand();
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command('search <query>')
  .description('Search for skills in the registry')
  .action(async (query) => {
    try {
      await searchCommand(query);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command('edit [path]')
  .description('Edit a skill file')
  .action(async (path) => {
    try {
      await editCommand(path);
    } catch (error) {
      process.exit(1);
    }
  });

program.parse();
