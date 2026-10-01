import axios from 'axios';
import { RegistryClient, SkillPackage, SkillSearchResult } from './types';
import { Skill } from '../formats';

export class CloudRegistry implements RegistryClient {
  constructor(private readonly baseUrl = 'https://registry.skillos.io', private readonly apiKey?: string) {}

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;
    return headers;
  }

  async install(_skillName: string, _version?: string): Promise<void> {
    throw new Error('CloudRegistry download installation is not implemented; use the local registry.');
  }

  async publish(_skillPath: string): Promise<void> {
    throw new Error('CloudRegistry publish is not implemented; use the local registry.');
  }

  async search(query: string): Promise<SkillSearchResult[]> {
    const response = await axios.get(`${this.baseUrl}/api/v1/skills/search?q=${encodeURIComponent(query)}`, { headers: this.getHeaders() });
    return response.data as SkillSearchResult[];
  }

  async list(): Promise<SkillPackage[]> {
    const response = await axios.get(`${this.baseUrl}/api/v1/skills`, { headers: this.getHeaders() });
    return response.data as SkillPackage[];
  }

  async getSkill(name: string, version: string): Promise<Skill> {
    const response = await axios.get(`${this.baseUrl}/api/v1/skills/${encodeURIComponent(name)}/${encodeURIComponent(version)}`, { headers: this.getHeaders() });
    return response.data as Skill;
  }

  async uninstall(_skillName: string): Promise<void> {
    throw new Error('CloudRegistry uninstall is not implemented; use the local registry.');
  }
}
