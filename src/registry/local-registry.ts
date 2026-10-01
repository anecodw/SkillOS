import path from 'path';
import fs from 'fs-extra';
import semver from 'semver';
import { RegistryClient, SkillPackage, SkillSearchResult } from './types';
import { Skill, SkillParser } from '../formats';

interface RegistryEntry {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  license: string;
  publishedAt: number;
  downloads: number;
  rating?: number;
  skill: Skill;
}

interface RegistryData {
  skills: RegistryEntry[];
}

export function isSafeSkillName(name: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
}

export class LocalRegistry implements RegistryClient {
  private readonly dbPath: string;
  private readonly skillParser = new SkillParser();
  private data: RegistryData;

  constructor(private readonly registryPath: string = path.join(process.env.HOME || process.env.USERPROFILE || '', '.skillos', 'registry')) {
    this.dbPath = path.join(registryPath, 'registry.json');
    fs.ensureDirSync(registryPath);
    if (fs.existsSync(this.dbPath)) {
      const loaded = fs.readJsonSync(this.dbPath) as Partial<RegistryData>;
      if (!loaded || !Array.isArray(loaded.skills)) throw new Error(`Invalid registry file: ${this.dbPath}`);
      for (const entry of loaded.skills) {
        if (!entry || !isSafeSkillName(entry.name) || !semver.valid(entry.version)
          || entry.id !== `${entry.name}@${entry.version}` || typeof entry.author !== 'string'
          || typeof entry.description !== 'string' || typeof entry.license !== 'string'
          || !Number.isSafeInteger(entry.publishedAt) || !Number.isSafeInteger(entry.downloads) || entry.downloads < 0
          || !entry.skill || entry.skill.name !== entry.name || entry.skill.version !== entry.version
          || !this.skillParser.validate(entry.skill).valid) {
          throw new Error(`Invalid registry entry in ${this.dbPath}`);
        }
      }
      this.data = loaded as RegistryData;
    } else {
      this.data = { skills: [] };
      this.save();
    }
  }

  private save(): void {
    fs.writeJsonSync(this.dbPath, this.data, { spaces: 2 });
  }

  async install(skillName: string, version = 'latest', destinationRoot = path.join(process.env.HOME || process.env.USERPROFILE || '', '.skillos', 'skills')): Promise<void> {
    if (!isSafeSkillName(skillName)) throw new Error(`Invalid skill name '${skillName}'`);
    const skill = await this.getSkill(skillName, version);
    const root = path.resolve(destinationRoot);
    const installPath = path.resolve(root, skill.name);
    if (!installPath.startsWith(`${root}${path.sep}`)) throw new Error('Install path escapes destination directory');
    if (await fs.pathExists(installPath) && (await fs.lstat(installPath)).isSymbolicLink()) {
      throw new Error('Refusing to install through a symbolic link');
    }
    await fs.ensureDir(installPath);
    await this.skillParser.writeToFile(skill, path.join(installPath, 'skill.md'));
    const entry = this.data.skills.find(item => item.name === skillName && item.version === skill.version);
    if (entry) {
      entry.downloads += 1;
      this.save();
    }
  }

  async publish(skillPath: string): Promise<void> {
    const skill = await this.skillParser.parseFile(path.resolve(skillPath));
    if (!isSafeSkillName(skill.name)) throw new Error(`Invalid skill name '${skill.name}'`);
    const existing = this.data.skills.find(item => item.name === skill.name && item.version === skill.version);
    if (existing) throw new Error(`Skill ${skill.name}@${skill.version} already exists in registry`);
    this.data.skills.push({
      id: `${skill.name}@${skill.version}`,
      name: skill.name,
      version: skill.version,
      author: skill.author,
      description: skill.description,
      license: skill.license || 'MIT',
      publishedAt: Date.now(),
      downloads: 0,
      skill
    });
    this.save();
  }

  async search(query: string): Promise<SkillSearchResult[]> {
    const pattern = query.trim().toLowerCase();
    return this.data.skills
      .filter(item => item.name.toLowerCase().includes(pattern) || item.description.toLowerCase().includes(pattern) || item.author.toLowerCase().includes(pattern))
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 50)
      .map(item => ({
        name: item.name,
        author: item.author,
        description: item.description,
        version: item.version,
        downloads: item.downloads,
        rating: item.rating,
        tags: item.skill.metadata?.tags || []
      }));
  }

  async list(): Promise<SkillPackage[]> {
    return [...this.data.skills]
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .map(item => ({
        id: item.id,
        name: item.name,
        version: item.version,
        author: item.author,
        description: item.description,
        license: item.license,
        skill: item.skill,
        publishedAt: new Date(item.publishedAt),
        downloads: item.downloads,
        rating: item.rating
      }));
  }

  async getSkill(name: string, version = 'latest'): Promise<Skill> {
    if (!isSafeSkillName(name)) throw new Error(`Invalid skill name '${name}'`);
    const entries = this.data.skills.filter(item => item.name === name);
    const matching = version === 'latest'
      ? entries
      : semver.validRange(version)
        ? entries.filter(item => semver.satisfies(item.version, version))
        : entries.filter(item => item.version === version);
    matching.sort((a, b) => semver.rcompare(a.version, b.version));
    if (matching.length === 0) throw new Error(`Skill ${name}@${version} not found`);
    return matching[0].skill;
  }

  async uninstall(skillName: string, destinationRoot = path.join(process.env.HOME || process.env.USERPROFILE || '', '.skillos', 'skills')): Promise<void> {
    if (!isSafeSkillName(skillName)) throw new Error(`Invalid skill name '${skillName}'`);
    const root = path.resolve(destinationRoot);
    const target = path.resolve(root, skillName);
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Uninstall path escapes destination directory');
    if (await fs.pathExists(target)) await fs.remove(target);
  }

  close(): void {}
}
