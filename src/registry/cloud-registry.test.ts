import axios from 'axios';
import { CloudRegistry } from './cloud-registry';

describe('CloudRegistry', () => {
  afterEach(() => jest.restoreAllMocks());

  it('requires an explicit URL or SKILLOS_REGISTRY_URL and normalizes trailing slashes', async () => {
    const previousUrl = process.env.SKILLOS_REGISTRY_URL;
    delete process.env.SKILLOS_REGISTRY_URL;
    try {
      await expect(new CloudRegistry().list()).rejects.toThrow('Cloud registry URL is not configured');
      process.env.SKILLOS_REGISTRY_URL = 'https://registry.example/';
      const get = jest.spyOn(axios, 'get').mockResolvedValue({ data: [] } as never);
      await expect(new CloudRegistry().list()).resolves.toEqual([]);
      expect(get).toHaveBeenCalledWith('https://registry.example/api/v1/skills', expect.anything());
    } finally {
      if (previousUrl === undefined) delete process.env.SKILLOS_REGISTRY_URL;
      else process.env.SKILLOS_REGISTRY_URL = previousUrl;
    }
  });

  it('rejects malformed registry URLs clearly', async () => {
    await expect(new CloudRegistry('not-a-url').list()).rejects.toThrow('Cloud registry URL must be a valid HTTP or HTTPS URL');
  });

  it('uses authenticated requests for search, list and getSkill', async () => {
    const get = jest.spyOn(axios, 'get').mockResolvedValue({ data: [] } as never);
    const registry = new CloudRegistry('https://registry.example', 'token');
    await expect(registry.search('hello world')).resolves.toEqual([]);
    await expect(registry.list()).resolves.toEqual([]);
    await expect(registry.getSkill('agent-skill', '^1.0.0')).resolves.toEqual([]);
    expect(get).toHaveBeenCalledWith('https://registry.example/api/v1/skills/search?q=hello%20world', expect.objectContaining({ headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' } }));
  });

  it('rejects unsupported publish, install and uninstall operations clearly', async () => {
    const registry = new CloudRegistry();
    await expect(registry.install('agent-skill')).rejects.toThrow('download installation is not implemented');
    await expect(registry.publish('skill.md')).rejects.toThrow('publish is not implemented');
    await expect(registry.uninstall('agent-skill')).rejects.toThrow('uninstall is not implemented');
  });
});
