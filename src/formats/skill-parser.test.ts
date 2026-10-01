import { SkillParser } from './skill-parser';

describe('SkillParser', () => {
  let parser: SkillParser;

  beforeEach(() => {
    parser = new SkillParser();
  });

  describe('parse', () => {
    it('should parse a valid skill with front matter', () => {
      const content = `---
name: test-skill
version: 1.0.0
description: A test skill for testing purposes
author: Test Author
runtime:
  primary: claude-code
---
# Test Skill

This is a test skill with sufficient content to meet the minimum length requirements for validation.
`;

      const skill = parser.parse(content);

      expect(skill.name).toBe('test-skill');
      expect(skill.version).toBe('1.0.0');
      expect(skill.description).toBe('A test skill for testing purposes');
      expect(skill.author).toBe('Test Author');
      expect(skill.runtime.primary).toBe('claude-code');
      expect(skill.instructions).toContain('This is a test skill');
    });

    it('should throw error for missing front matter', () => {
      const content = 'No front matter here';
      expect(() => parser.parse(content)).toThrow('Invalid skill format');
    });

    it('should throw error for invalid YAML', () => {
      const content = `---
invalid: yaml: content:
---
instructions: |
Test
`;
      expect(() => parser.parse(content)).toThrow();
    });

    it('should validate required fields', () => {
      const content = `---
name: test
version: 1.0.0
description: Test description
author: Test
runtime:
  primary: claude-code
---
Test instructions for the skill that are longer than 50 characters to meet schema requirements.
`;
      const skill = parser.parse(content);
      expect(skill.name).toBe('test');
    });
  });

  describe('stringify', () => {
    it('should convert skill back to markdown format', () => {
      const skill = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'A test skill',
        author: 'Test Author',
        runtime: {
          primary: 'claude-code'
        },
        instructions: '# Test Skill\n\nThis is a test skill with more content to meet the minimum length requirement.'
      };

      const content = parser.stringify(skill);

      expect(content).toContain('---');
      expect(content).toContain('name: test-skill');
      expect(content).toContain('version: 1.0.0');
      expect(content).toContain('This is a test skill with more content');
    });
  });

  describe('validate', () => {
    it('should validate a correct skill', () => {
      const skill = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'A test skill',
        author: 'Test Author',
        runtime: {
          primary: 'claude-code'
        },
        instructions: 'Test instructions for the skill that are longer than 50 characters'
      };

      const result = parser.validate(skill);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid skill name', () => {
      const skill = {
        name: 'Invalid_Name',
        version: '1.0.0',
        description: 'Test',
        author: 'Test',
        runtime: {
          primary: 'claude-code'
        },
        instructions: 'Test instructions for the skill that are longer than 50 characters'
      };

      const result = parser.validate(skill);
      expect(result.valid).toBe(false);
    });
  });
});
