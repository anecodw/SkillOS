import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';
import { SkillParser } from '../../formats';

export async function editCommand(skillPath?: string): Promise<void> {
  const filePath = skillPath || path.join(process.cwd(), 'skill.md');
  
  if (!(await fs.pathExists(filePath))) {
    console.error(`File not found: ${filePath}`);
    throw new Error('Skill file not found');
  }

  const skillParser = new SkillParser();
  const skill = await skillParser.parseFile(filePath);

  console.log('\n=== Skill Editor ===\n');
  console.log(`Name: ${skill.name}`);
  console.log(`Version: ${skill.version}`);
  console.log(`Description: ${skill.description}\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (question: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  };

  try {
    const choice = await ask('What would you like to edit?\n1. Name\n2. Version\n3. Description\n4. Instructions\n5. Exit\nChoice (1-5): ');

    switch (choice) {
      case '1':
        const newName = await ask('Enter new name: ');
        skill.name = newName;
        break;
      case '2':
        const newVersion = await ask('Enter new version: ');
        skill.version = newVersion;
        break;
      case '3':
        const newDescription = await ask('Enter new description: ');
        skill.description = newDescription;
        break;
      case '4':
        console.log('\nCurrent instructions:');
        console.log(skill.instructions);
        console.log('\nEnter new instructions (press Enter twice to finish):');
        const newInstructions = await readMultiline(rl);
        skill.instructions = newInstructions;
        break;
      case '5':
        console.log('Exiting without changes');
        rl.close();
        return;
      default:
        console.log('Invalid choice');
        rl.close();
        return;
    }

    await skillParser.writeToFile(skill, filePath);
    console.log('\n✓ Skill updated successfully');
  } finally {
    rl.close();
  }
}

function readMultiline(rl: readline.Interface): Promise<string> {
  return new Promise((resolve) => {
    const lines: string[] = [];
    let emptyLineCount = 0;

    const onLine = (line: string) => {
      if (line === '') {
        emptyLineCount++;
        if (emptyLineCount >= 2) {
          rl.off('line', onLine);
          resolve(lines.join('\n'));
        }
      } else {
        emptyLineCount = 0;
        lines.push(line);
      }
    };

    rl.on('line', onLine);
  });
}
