import axios from 'axios';
import { RegistryClient, SkillPackage, SkillSearchResult } from './types';
import { Skill } from '../formats';

export class CloudRegistry implements RegistryClient {
  constructor(
    private readonly configuredBaseUrl = process.env.SKILLOS_REGISTRY_URL,
    private readonly apiKey = process.env.SKILLOS_REGISTRY_API_KEY
  ) {}

  private getBaseUrl(): string {
    if (!this.configuredBaseUrl?.trim()) {
      throw new Error('Cloud registry URL is not configured. Pass baseUrl to CloudRegistry or set SKILLOS_REGISTRY_URL.');
    }
    try {
      const url = new URL(this.configuredBaseUrl);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error();
      return this.configuredBaseUrl.replace(/\/+$/, '');
    } catch {
      throw new Error('Cloud registry URL must be a valid HTTP or HTTPS URL.');
    }
  }

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
    const response = await axios.get(`${this.getBaseUrl()}/api/v1/skills/search?q=${encodeURIComponent(query)}`, { headers: this.getHeaders() });
    return response.data as SkillSearchResult[];
  }

  async list(): Promise<SkillPackage[]> {
    const response = await axios.get(`${this.getBaseUrl()}/api/v1/skills`, { headers: this.getHeaders() });
    return response.data as SkillPackage[];
  }

  async getSkill(name: string, version: string): Promise<Skill> {
    const response = await axios.get(`${this.getBaseUrl()}/api/v1/skills/${encodeURIComponent(name)}/${encodeURIComponent(version)}`, { headers: this.getHeaders() });
    return response.data as Skill;
  }

  async uninstall(_skillName: string): Promise<void> {
    throw new Error('CloudRegistry uninstall is not implemented; use the local registry.');
  }
}
