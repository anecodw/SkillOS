import path from 'path';
import fs from 'fs-extra';
import { RegistryClient, SkillPackage, SkillSearchResult } from './types';
import { Skill, SkillParser } from '../formats';

interface RegistryData {
  skills: Array<{
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
  }>;
}

export class LocalRegistry implements RegistryClient {
  private dbPath: string;
  private skillParser: SkillParser;
  private registryPath: string;
  private data!: RegistryData;

  constructor(registryPath: string = path.join(process.env.HOME || process.env.USERPROFILE || '', '.skillos', 'registry')) {
    this.registryPath = registryPath;
    this.skillParser = new SkillParser();
    this.dbPath = path.join(registryPath, 'registry.json');
    
    fs.ensureDirSync(registryPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    if (fs.existsSync(this.dbPath)) {
      this.data = fs.readJSONSync(this.dbPath);
    } else {
      this.data = { skills: [] };
      fs.writeJSONSync(this.dbPath, this.data);
    }
  }

  private save(): void {
    fs.writeJSONSync(this.dbPath, this.data);
  }

  async install(skillName: string, version?: string): Promise<void> {
    const skill = await this.getSkill(skillName, version || 'latest');
    const installPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.skillos', 'skills', skill.name);
    
    await fs.ensureDir(installPath);
    await this.skillParser.writeToFile(skill, path.join(installPath, 'skill.md'));
    
    const skillEntry = this.data.skills.find(s => s.name === skillName && s.version === skill.version);
    if (skillEntry) {
      skillEntry.downloads++;
      this.save();
    }
  }

  async publish(skillPath: string): Promise<void> {
    const skill = await this.skillParser.parseFile(skillPath);
    const id = `${skill.name}@${skill.version}`;
    
    const existing = this.data.skills.find(s => s.name === skill.name && s.version === skill.version);
    
    if (existing) {
      throw new Error(`Skill ${skill.name}@${skill.version} already exists in registry`);
    }

    this.data.skills.push({
      id,
      name: skill.name,
      version: skill.version,
      author: skill.author,
      description: skill.description,
      license: skill.license || 'MIT',
      publishedAt: Date.now(),
      downloads: 0,
      rating: undefined,
      skill
    });
    
    this.save();
  }

  async search(query: string): Promise<SkillSearchResult[]> {
    const searchPattern = query.toLowerCase();
    const results = this.data.skills
      .filter(s => 
        s.name.toLowerCase().includes(searchPattern) ||
        s.description.toLowerCase().includes(searchPattern) ||
        s.author.toLowerCase().includes(searchPattern)
      )
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 50);
    
    return results.map(row => ({
      name: row.name,
      author: row.author,
      description: row.description,
      version: row.version,
      downloads: row.downloads,
      rating: row.rating,
      tags: row.skill.metadata?.tags || []
    }));
  }

  async list(): Promise<SkillPackage[]> {
    return this.data.skills
      .sort((a, b) => b.publishedAt - a.publishedAt)
      .map(row => ({
        id: row.id,
        name: row.name,
        version: row.version,
        author: row.author,
        description: row.description,
        license: row.license,
        skill: row.skill,
        publishedAt: new Date(row.publishedAt),
        downloads: row.downloads,
        rating: row.rating
      }));
  }

  async getSkill(name: string, version: string): Promise<Skill> {
    if (version === 'latest') {
      const skills = this.data.skills
        .filter(s => s.name === name)
        .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
      
      if (skills.length === 0) {
        throw new Error(`Skill ${name} not found`);
      }
      return skills[0].skill;
    } else {
      const skill = this.data.skills.find(s => s.name === name && s.version === version);
      if (!skill) {
        throw new Error(`Skill ${name}@${version} not found`);
      }
      return skill.skill;
    }
  }

  async uninstall(skillName: string): Promise<void> {
    const installPath = path.join(process.env.HOME || process.env.USERPROFILE || '', '.skillos', 'skills', skillName);
    
    if (await fs.pathExists(installPath)) {
      await fs.remove(installPath);
    }
  }

  close(): void {
    // No cleanup needed for JSON file
  }
}
