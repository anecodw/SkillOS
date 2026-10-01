import fs from 'fs-extra';
import yaml from 'js-yaml';
import Ajv, { ErrorObject } from 'ajv';
import semver from 'semver';
import schema from './skill-schema.json';
import { ParseError, ValidationError } from '../core/errors';

export interface Skill {
  name: string;
  version: string;
  description: string;
  author: string;
  license?: string;
  runtime: { primary: string; compatible?: string[] };
  instructions: string;
  capabilities?: string[];
  dependencies?: Record<string, string>;
  permissions?: string[];
  security?: { allowShell?: boolean; allowNetwork?: boolean; allowFileWrite?: boolean; restrictedPaths?: string[] };
  eval?: { scenarios?: Array<{ name: string; input: string; expected: string }> };
  metadata?: { tags?: string[]; category?: string; language?: string };
}

export class SkillParser {
  private readonly ajv = new Ajv({ allErrors: true, strict: false });
  private readonly validateSchema = this.ajv.compile(schema);

  parse(content: string): Skill {
    if (typeof content !== 'string') throw new ParseError('skill content must be a string');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
    if (!match) throw new ParseError('Invalid skill format: missing front matter');
    let metadata: unknown;
    try {
      metadata = yaml.load(match[1], { schema: yaml.DEFAULT_SCHEMA });
    } catch (error) {
      throw new ParseError(`invalid YAML front matter: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new ParseError('front matter must be a YAML mapping');
    }
    const skill = { ...(metadata as Record<string, unknown>), instructions: match[2].trim() };
    const validation = this.validate(skill);
    if (!validation.valid) throw new ValidationError(this.formatErrors(validation.errors));
    return skill as unknown as Skill;
  }

  async parseFile(filePath: string): Promise<Skill> {
    return this.parse(await fs.readFile(filePath, 'utf8'));
  }

  stringify(skill: Skill): string {
    const { instructions, ...metadata } = skill;
    return `---\n${yaml.dump(metadata, { indent: 2, lineWidth: -1, noRefs: true })}---\n${instructions.trim()}\n`;
  }

  async writeToFile(skill: Skill, filePath: string): Promise<void> {
    const validation = this.validate(skill);
    if (!validation.valid) throw new ValidationError(this.formatErrors(validation.errors));
    await fs.outputFile(filePath, this.stringify(skill), 'utf8');
  }

  validate(skill: unknown): { valid: boolean; errors: ErrorObject[] } {
    const valid = this.validateSchema(skill);
    const errors = [...(this.validateSchema.errors ?? [])];
    if (skill && typeof skill === 'object' && !Array.isArray(skill)) {
      const value = skill as Record<string, unknown>;
      if (typeof value.version === 'string' && !semver.valid(value.version)) {
        errors.push({ instancePath: '/version', schemaPath: '#/properties/version', keyword: 'semver', params: {}, message: 'must be a valid semantic version' } as ErrorObject);
      }
      if (value.dependencies && typeof value.dependencies === 'object' && !Array.isArray(value.dependencies)) {
        for (const [name, range] of Object.entries(value.dependencies as Record<string, unknown>)) {
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || typeof range !== 'string' || !semver.validRange(range)) {
            errors.push({ instancePath: `/dependencies/${name}`, schemaPath: '#/properties/dependencies', keyword: 'semver', params: {}, message: 'must be a safe skill name with a valid semver range' } as ErrorObject);
          }
        }
      }
    }
    return { valid: Boolean(valid) && errors.length === 0, errors };
  }

  private formatErrors(errors: ErrorObject[]): string {
    return errors.map(error => `${error.instancePath || '/'} ${error.message || 'is invalid'}`).join('; ');
  }
}
