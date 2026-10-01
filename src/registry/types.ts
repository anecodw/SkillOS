import { Skill } from '../formats';

export interface RegistryConfig {
  type: 'local' | 'cloud';
  url?: string;
  localPath?: string;
}

export interface SkillPackage {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  license: string;
  skill: Skill;
  publishedAt: Date;
  downloads: number;
  rating?: number;
}

export interface SkillSearchResult {
  name: string;
  author: string;
  description: string;
  version: string;
  downloads: number;
  rating?: number;
  tags: string[];
}

export interface RegistryClient {
  install(skillName: string, version?: string): Promise<void>;
  publish(skillPath: string): Promise<void>;
  search(query: string): Promise<SkillSearchResult[]>;
  list(): Promise<SkillPackage[]>;
  getSkill(name: string, version: string): Promise<Skill>;
  uninstall(skillName: string): Promise<void>;
}
