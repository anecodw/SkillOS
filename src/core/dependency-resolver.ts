import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import { Skill } from '../formats';
import { LocalRegistry } from '../registry';
import { CircularDependencyError, DependencyError } from './errors';

export interface DependencyNode {
  skill: Skill;
  dependencies: DependencyNode[];
  depth: number;
}

export interface ResolutionResult {
  tree: DependencyNode;
  order: Skill[];
  missing: Array<{ name: string; version: string }>;
}

export interface SkillLockfile {
  lockfileVersion: 1;
  root: string;
  rootDependencies: Record<string, string>;
  dependencies: Record<string, { version: string; dependencies?: Record<string, string> }>;
}

export class DependencyResolver {
  constructor(private readonly registry: LocalRegistry) {}

  async resolve(skillName: string, version = 'latest'): Promise<ResolutionResult> {
    const root = await this.registry.getSkill(skillName, version);
    const stack = new Set<string>();
    const cache = new Map<string, Skill>();
    const missing = new Map<string, { name: string; version: string }>();
    const build = async (skill: Skill, depth: number): Promise<DependencyNode> => {
      const key = `${skill.name}@${skill.version}`;
      if (stack.has(key)) throw new CircularDependencyError(skill.name);
      stack.add(key);
      const dependencies: DependencyNode[] = [];
      for (const [name, range] of Object.entries(skill.dependencies ?? {})) {
        if (!semver.validRange(range)) {
          missing.set(`${name}@${range}`, { name, version: range });
          continue;
        }
        const cacheKey = `${name}@${range}`;
        try {
          let dependency = cache.get(cacheKey);
          if (!dependency) {
            dependency = await this.registry.getSkill(name, range);
            if (!semver.satisfies(dependency.version, range)) {
              throw new DependencyError(`Resolved ${name}@${dependency.version}, which does not satisfy ${range}`);
            }
            cache.set(cacheKey, dependency);
          }
          dependencies.push(await build(dependency, depth + 1));
        } catch (error) {
          if (error instanceof CircularDependencyError) throw error;
          if (error instanceof DependencyError && !String(error.message).includes('not found')) throw error;
          missing.set(cacheKey, { name, version: range });
        }
      }
      stack.delete(key);
      return { skill, dependencies, depth };
    };
    const tree = await build(root, 0);
    const order: Skill[] = [];
    const visited = new Set<string>();
    const visit = (node: DependencyNode): void => {
      const key = `${node.skill.name}@${node.skill.version}`;
      if (visited.has(key)) return;
      visited.add(key);
      node.dependencies.forEach(visit);
      order.push(node.skill);
    };
    visit(tree);
    const versions = new Map<string, string>();
    for (const skill of order) {
      const existing = versions.get(skill.name);
      if (existing && existing !== skill.version) {
        throw new DependencyError(`Incompatible ranges require both ${skill.name}@${existing} and ${skill.name}@${skill.version}; the local installer supports one version per skill name`);
      }
      versions.set(skill.name, skill.version);
    }
    return { tree, order, missing: [...missing.values()] };
  }

  async validate(skill: Skill): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    for (const [name, range] of Object.entries(skill.dependencies ?? {})) {
      if (!semver.validRange(range)) {
        errors.push(`Dependency '${name}' has invalid semver range '${range}'`);
        continue;
      }
      try {
        const found = await this.registry.getSkill(name, range);
        if (!semver.satisfies(found.version, range)) errors.push(`Dependency '${name}@${found.version}' does not satisfy '${range}'`);
      } catch {
        errors.push(`Dependency '${name}@${range}' not found in registry`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  async getDependencyGraph(skillName: string, version = 'latest'): Promise<Record<string, string[]>> {
    const { tree } = await this.resolve(skillName, version);
    const graph: Record<string, string[]> = {};
    const visit = (node: DependencyNode): void => {
      const key = `${node.skill.name}@${node.skill.version}`;
      graph[key] = node.dependencies.map(dep => `${dep.skill.name}@${dep.skill.version}`);
      node.dependencies.forEach(visit);
    };
    visit(tree);
    return graph;
  }
}

export function createLockfile(root: Skill, skills: Skill[]): SkillLockfile {
  const byName = new Map(skills.map(skill => [skill.name, skill]));
  const dependencies: SkillLockfile['dependencies'] = {};
  const rootDependencies: Record<string, string> = {};
  for (const [name, range] of Object.entries(root.dependencies ?? {})) {
    const resolved = byName.get(name);
    if (resolved && semver.satisfies(resolved.version, range)) rootDependencies[name] = resolved.version;
  }
  for (const skill of skills) {
    const childDependencies: Record<string, string> = {};
    for (const [name, range] of Object.entries(skill.dependencies ?? {})) {
      const resolved = byName.get(name);
      if (resolved && semver.satisfies(resolved.version, range)) childDependencies[name] = resolved.version;
    }
    if (skill.name !== root.name) {
      dependencies[skill.name] = {
        version: skill.version,
        ...(Object.keys(childDependencies).length ? { dependencies: childDependencies } : {})
      };
    }
  }
  return { lockfileVersion: 1, root: `${root.name}@${root.version}`, rootDependencies, dependencies };
}

export async function writeLockfile(lockfile: SkillLockfile, destination = path.resolve('skillos.lock')): Promise<void> {
  await fs.writeJson(destination, lockfile, { spaces: 2 });
}
