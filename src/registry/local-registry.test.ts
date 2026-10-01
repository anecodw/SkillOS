import { LocalRegistry } from './local-registry';
import { SkillParser } from '../formats';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('LocalRegistry', () => {
  let registry: LocalRegistry;
  let tempDir: string;
  let skillParser: SkillParser;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), 'skillos-test-' + Date.now());
    registry = new LocalRegistry(tempDir);
    skillParser = new SkillParser();
  });

  afterEach(async () => {
    registry.close();
    await fs.remove(tempDir);
  });

  describe('publish', () => {
    it('should publish a skill to the registry', async () => {
      const skill = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'A test skill',
        author: 'Test Author',
        runtime: {
          primary: 'claude-code'
        },
        instructions: 'Test instructions for the skill that are longer than 50 characters to meet schema requirements'
      };

      const skillPath = path.join(tempDir, 'skill.md');
      await skillParser.writeToFile(skill, skillPath);

      await registry.publish(skillPath);

      const retrievedSkill = await registry.getSkill('test-skill', '1.0.0');
      expect(retrievedSkill.name).toBe('test-skill');
      expect(retrievedSkill.version).toBe('1.0.0');
    });

    it('should reject duplicate skill versions', async () => {
      const skill = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'A test skill',
        author: 'Test Author',
        runtime: {
          primary: 'claude-code'
        },
        instructions: 'Test instructions for the skill that are longer than 50 characters to meet schema requirements'
      };

      const skillPath = path.join(tempDir, 'skill.md');
      await skillParser.writeToFile(skill, skillPath);

      await registry.publish(skillPath);

      await expect(registry.publish(skillPath)).rejects.toThrow('already exists');
    });
  });

  describe('getSkill', () => {
    it('should retrieve a published skill', async () => {
      const skill = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'A test skill',
        author: 'Test Author',
        runtime: {
          primary: 'claude-code'
        },
        instructions: 'Test instructions for the skill that are longer than 50 characters to meet schema requirements'
      };

      const skillPath = path.join(tempDir, 'skill.md');
      await skillParser.writeToFile(skill, skillPath);
      await registry.publish(skillPath);

      const retrieved = await registry.getSkill('test-skill', '1.0.0');
      expect(retrieved.name).toBe('test-skill');
    });

    it('should throw error for non-existent skill', async () => {
      await expect(registry.getSkill('nonexistent', '1.0.0')).rejects.toThrow('not found');
    });

    it('should resolve semver ranges and reject unsafe skill names', async () => {
      const skill = {
        name: 'range-skill', version: '1.4.0', description: 'A versioned skill for range tests', author: 'Test',
        runtime: { primary: 'claude-code' }, instructions: 'A sufficiently long instruction body for registry validation.'
      };
      const file = path.join(tempDir, 'range.md');
      await skillParser.writeToFile(skill, file);
      await registry.publish(file);
      await expect(registry.getSkill('range-skill', '^1.2.0')).resolves.toMatchObject({ version: '1.4.0' });
      await expect(registry.getSkill('../escape', 'latest')).rejects.toThrow('Invalid skill name');
    });

    it('should install and uninstall files while tracking downloads', async () => {
      const skill = {
        name: 'install-skill', version: '1.0.0', description: 'A sufficiently descriptive install skill', author: 'Test',
        runtime: { primary: 'claude-code' }, instructions: 'Instructions long enough for registry validation and installation.'
      };
      const file = path.join(tempDir, 'install.md');
      const destination = path.join(tempDir, 'skills');
      await skillParser.writeToFile(skill, file);
      await registry.publish(file);
      await registry.install('install-skill', '^1.0.0', destination);
      expect(await fs.pathExists(path.join(destination, 'install-skill', 'skill.md'))).toBe(true);
      expect((await registry.list())[0].downloads).toBe(1);
      await registry.uninstall('install-skill', destination);
      expect(await fs.pathExists(path.join(destination, 'install-skill'))).toBe(false);
      await expect(registry.install('../escape', 'latest', destination)).rejects.toThrow('Invalid skill name');
    });

    it('should refuse a symlinked install target', async () => {
      if (process.platform === 'win32') return;
      const skill = {
        name: 'linked-skill', version: '1.0.0', description: 'A sufficiently descriptive symlink skill', author: 'Test',
        runtime: { primary: 'claude-code' }, instructions: 'Instructions long enough for registry validation and installation.'
      };
      const file = path.join(tempDir, 'linked.md');
      const destination = path.join(tempDir, 'skills');
      const outside = path.join(tempDir, 'outside');
      await skillParser.writeToFile(skill, file);
      await registry.publish(file);
      await fs.ensureDir(destination);
      await fs.ensureDir(outside);
      await fs.symlink(outside, path.join(destination, 'linked-skill'));
      await expect(registry.install('linked-skill', 'latest', destination)).rejects.toThrow('symbolic link');
    });

    it('should reject malformed local registry data', async () => {
      await fs.writeJson(path.join(tempDir, 'registry.json'), { skills: [{ name: '../outside' }] });
      expect(() => new LocalRegistry(tempDir)).toThrow('Invalid registry entry');
    });
  });

  describe('search', () => {
    it('should find skills by name', async () => {
      const skill = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'A test skill for searching',
        author: 'Test Author',
        runtime: {
          primary: 'claude-code'
        },
        instructions: 'Test instructions for the skill that are longer than 50 characters to meet schema requirements'
      };

      const skillPath = path.join(tempDir, 'skill.md');
      await skillParser.writeToFile(skill, skillPath);
      await registry.publish(skillPath);

      const results = await registry.search('test');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('test-skill');
    });
  });

  describe('list', () => {
    it('should list all published skills', async () => {
      const skill1 = {
        name: 'skill-1',
        version: '1.0.0',
        description: 'First skill',
        author: 'Test',
        runtime: { primary: 'claude-code' },
        instructions: 'Test instructions for the skill that are longer than 50 characters to meet schema requirements'
      };

      const skill2 = {
        name: 'skill-2',
        version: '1.0.0',
        description: 'Second skill',
        author: 'Test',
        runtime: { primary: 'claude-code' },
        instructions: 'Test instructions for the skill that are longer than 50 characters to meet schema requirements'
      };

      const skillPath1 = path.join(tempDir, 'skill1.md');
      const skillPath2 = path.join(tempDir, 'skill2.md');

      await skillParser.writeToFile(skill1, skillPath1);
      await skillParser.writeToFile(skill2, skillPath2);

      await registry.publish(skillPath1);
      await registry.publish(skillPath2);

      const skills = await registry.list();
      expect(skills.length).toBe(2);
    });
  });
});
