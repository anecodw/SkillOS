import fs from 'fs-extra';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import schema from './skill-schema.json';

export interface Skill {
  name: string;
  version: string;
  description: string;
  author: string;
  license?: string;
  runtime: {
    primary: string;
    compatible?: string[];
  };
  instructions: string;
  capabilities?: string[];
  dependencies?: Record<string, string>;
  permissions?: string[];
  security?: {
    allowShell?: boolean;
    allowNetwork?: boolean;
    allowFileWrite?: boolean;
    restrictedPaths?: string[];
  };
  eval?: {
    scenarios?: Array<{
      name: string;
      input: string;
      expected: string;
    }>;
  };
  metadata?: {
    tags?: string[];
    category?: string;
    language?: string;
  };
}

export class SkillParser {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  parse(content: string): Skill {
    const frontMatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    
    if (!frontMatterMatch) {
      throw new Error('Invalid skill format: missing front matter');
    }

    const [, yamlContent, instructions] = frontMatterMatch;
    
    let metadata: any;
    try {
      metadata = yaml.load(yamlContent);
    } catch (error) {
      throw new Error(`Invalid YAML in front matter: ${error}`);
    }

    const skill = {
      ...metadata,
      instructions: instructions.trim()
    };

    const validate = this.ajv.compile(schema);
    const valid = validate(skill);

    if (!valid) {
      throw new Error(`Validation failed: ${JSON.stringify(validate.errors, null, 2)}`);
    }

    return skill as unknown as Skill;
  }

  async parseFile(filePath: string): Promise<Skill> {
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parse(content);
  }

  stringify(skill: Skill): string {
    const { instructions, ...metadata } = skill;
    const yamlContent = yaml.dump(metadata, {
      indent: 2,
      lineWidth: -1,
      noRefs: true
    });
    
    return `---\n${yamlContent}---\n${instructions}\n`;
  }

  async writeToFile(skill: Skill, filePath: string): Promise<void> {
    const content = this.stringify(skill);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  validate(skill: Skill): { valid: boolean; errors: any[] } {
    const validate = this.ajv.compile(schema);
    const valid = validate(skill);
    
    return {
      valid: valid || false,
      errors: validate.errors || []
    };
  }
}
