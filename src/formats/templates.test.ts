import fs from 'fs-extra';
import path from 'path';
import { SkillParser } from './skill-parser';

describe('published skill templates', () => {
  it('parses and validates every template in the examples directory', async () => {
    const directory = path.resolve(process.cwd(), 'examples', 'templates');
    const files = (await fs.readdir(directory)).filter(file => file.endsWith('.md')).sort();
    expect(files).toHaveLength(8);
    const parser = new SkillParser();
    for (const file of files) {
      const skill = await parser.parseFile(path.join(directory, file));
      expect(parser.validate(skill).valid).toBe(true);
      expect(skill.instructions.length).toBeGreaterThan(50);
    }
  });
});
