import { Skill } from '../formats';
import { LocalRegistry } from '../registry';
import { CircularDependencyError, DependencyNotFoundError, DependencyError } from './errors';
import semver from 'semver';

export interface DependencyNode {
  skill: Skill;
  dependencies: DependencyNode[];
  depth: number;
}

export interface ResolutionResult {
  tree: DependencyNode;
  order: Skill[];
  missing: Array<{ name: string; version?: string }>;
}

/**
 * Resolves and validates skill dependencies
 */
export class DependencyResolver {
  private registry: LocalRegistry;
  private resolving = new Set<string>();

  constructor(registry: LocalRegistry) {
    this.registry = registry;
  }

  /**
   * Resolve all dependencies for a skill
   */
  async resolve(skillName: string, version?: string): Promise<ResolutionResult> {
    this.resolving.clear();
    
    try {
      const skill = await this.registry.getSkill(skillName, version || 'latest');
      const tree = await this.buildDependencyTree(skill, 0);
      const order = this.flattenDependencyTree(tree);
      const missing = this.findMissingDependencies(tree);

      return { tree, order, missing };
    } catch (error) {
      if (error instanceof CircularDependencyError) {
        throw error;
      }
      throw new DependencyError(`Failed to resolve dependencies for '${skillName}': ${error}`);
    }
  }

  /**
   * Build a dependency tree for a skill
   */
  private async buildDependencyTree(skill: Skill, depth: number): Promise<DependencyNode> {
    const key = `${skill.name}@${skill.version}`;
    
    // Check for circular dependencies
    if (this.resolving.has(key)) {
      throw new CircularDependencyError(skill.name);
    }
    
    this.resolving.add(key);

    const dependencies: DependencyNode[] = [];

    if (skill.dependencies) {
      for (const [depName, depVersion] of Object.entries(skill.dependencies)) {
        try {
          const depSkill = await this.registry.getSkill(depName, depVersion);
          const depNode = await this.buildDependencyTree(depSkill, depth + 1);
          dependencies.push(depNode);
        } catch (error) {
          // If dependency not found, we'll report it as missing later
          // Don't throw here, continue building the tree
          console.warn(`Warning: Could not resolve dependency '${depName}@${depVersion}'`);
        }
      }
    }

    this.resolving.delete(key);

    return {
      skill,
      dependencies,
      depth
    };
  }

  /**
   * Flatten dependency tree into installation order (topological sort)
   */
  private flattenDependencyTree(node: DependencyNode): Skill[] {
    const order: Skill[] = [];
    const visited = new Set<string>();

    const visit = (n: DependencyNode) => {
      const key = `${n.skill.name}@${n.skill.version}`;
      if (visited.has(key)) return;
      
      visited.add(key);
      
      // Visit dependencies first (post-order)
      for (const dep of n.dependencies) {
        visit(dep);
      }
      
      order.push(n.skill);
    };

    visit(node);
    return order;
  }

  /**
   * Find missing dependencies in the tree
   */
  private findMissingDependencies(node: DependencyNode): Array<{ name: string; version?: string }> {
    const missing: Array<{ name: string; version?: string }> = [];

    const check = (n: DependencyNode) => {
      if (n.skill.dependencies) {
        for (const [depName, depVersion] of Object.entries(n.skill.dependencies)) {
          const depExists = n.dependencies.some(
            d => d.skill.name === depName && this.satisfiesVersion(d.skill.version, depVersion)
          );
          
          if (!depExists) {
            missing.push({ name: depName, version: depVersion });
          }
        }
      }
      
      for (const dep of n.dependencies) {
        check(dep);
      }
    };

    check(node);
    return missing;
  }

  /**
   * Check if a version satisfies a semver range
   */
  private satisfiesVersion(actual: string, required: string): boolean {
    try {
      return semver.satisfies(actual, required);
    } catch {
      // If semver parsing fails, do exact match
      return actual === required;
    }
  }

  /**
   * Validate that all dependencies can be satisfied
   */
  async validate(skill: Skill): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!skill.dependencies || Object.keys(skill.dependencies).length === 0) {
      return { valid: true, errors: [] };
    }

    for (const [depName, depVersion] of Object.entries(skill.dependencies)) {
      try {
        const depSkill = await this.registry.getSkill(depName, depVersion);
        
        // Validate version compatibility
        if (!this.satisfiesVersion(depSkill.version, depVersion)) {
          errors.push(
            `Dependency '${depName}' version ${depSkill.version} does not satisfy required version ${depVersion}`
          );
        }
      } catch (error) {
        errors.push(`Dependency '${depName}@${depVersion}' not found in registry`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get a simplified dependency graph (names only)
   */
  async getDependencyGraph(skillName: string, version?: string): Promise<Record<string, string[]>> {
    const result = await this.resolve(skillName, version);
    const graph: Record<string, string[]> = {};

    const buildGraph = (node: DependencyNode) => {
      const key = `${node.skill.name}@${node.skill.version}`;
      graph[key] = node.dependencies.map(d => `${d.skill.name}@${d.skill.version}`);
      
      for (const dep of node.dependencies) {
        buildGraph(dep);
      }
    };

    buildGraph(result.tree);
    return graph;
  }
}
