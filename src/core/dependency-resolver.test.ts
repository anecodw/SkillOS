import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { LocalRegistry } from '../registry';
import { SkillParser, Skill } from '../formats';
import { DependencyResolver, createLockfile, writeLockfile } from './dependency-resolver';

const makeSkill = (name: string, version: string, dependencies?: Record<string, string>): Skill => ({
  name, version, description: `A sufficiently descriptive skill named ${name}`, author: 'Test',
  runtime: { primary: 'claude-code' }, instructions: 'Instructions long enough to satisfy the skill schema and be useful.',
  dependencies
});

describe('DependencyResolver', () => {
  let directory: string;
  let registry: LocalRegistry;
  const parser = new SkillParser();
  const publish = async (skill: Skill): Promise<void> => {
    const file = path.join(directory, `${skill.name}-${skill.version}.md`);
    await parser.writeToFile(skill, file);
    await registry.publish(file);
  };

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'skillos-resolver-'));
    registry = new LocalRegistry(path.join(directory, 'registry'));
  });

  afterEach(async () => {
    registry.close();
    await fs.remove(directory);
  });

  it('resolves semver ranges transitively in install order', async () => {
    await publish(makeSkill('base', '1.0.0'));
    await publish(makeSkill('dep', '1.1.0', { base: '^1.0.0' }));
    await publish(makeSkill('dep', '1.4.0', { base: '^1.0.0' }));
    await publish(makeSkill('root', '2.0.0', { dep: '^1.2.0' }));
    const result = await new DependencyResolver(registry).resolve('root');
    expect(result.order.map(skill => `${skill.name}@${skill.version}`)).toEqual(['base@1.0.0', 'dep@1.4.0', 'root@2.0.0']);
    expect(result.missing).toEqual([]);
  });

  it('reports missing and malformed ranges', async () => {
    const root = makeSkill('root', '1.0.0', { missing: '^1.0.0', invalid: 'next' });
    const damagedRegistry = {
      getSkill: jest.fn(async (name: string) => {
        if (name === 'root') return root;
        throw new Error('Skill not found');
      })
    } as unknown as LocalRegistry;
    const result = await new DependencyResolver(damagedRegistry).resolve('root');
    expect(result.missing).toEqual([{ name: 'missing', version: '^1.0.0' }, { name: 'invalid', version: 'next' }]);
  });

  it('detects cycles and validates dependency ranges', async () => {
    await publish(makeSkill('alpha', '1.0.0', { beta: '^1.0.0' }));
    await publish(makeSkill('beta', '1.0.0', { alpha: '^1.0.0' }));
    await expect(new DependencyResolver(registry).resolve('alpha')).rejects.toThrow('Circular dependency');
    expect(await new DependencyResolver(registry).validate(makeSkill('root', '1.0.0', { beta: 'bad-range' }))).toMatchObject({ valid: false });
  });

  it('writes a deterministic lockfile', async () => {
    const root = makeSkill('root', '1.0.0', { dep: '^1.0.0' });
    const dep = makeSkill('dep', '1.2.0');
    const lockfile = createLockfile(root, [dep, root]);
    const destination = path.join(directory, 'skillos.lock');
    await writeLockfile(lockfile, destination);
    expect(await fs.readJson(destination)).toEqual({ lockfileVersion: 1, root: 'root@1.0.0', rootDependencies: { dep: '1.2.0' }, dependencies: { dep: { version: '1.2.0' } } });
  });
});
