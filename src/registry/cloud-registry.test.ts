import axios from 'axios';
import { CloudRegistry } from './cloud-registry';

describe('CloudRegistry', () => {
  afterEach(() => jest.restoreAllMocks());

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
