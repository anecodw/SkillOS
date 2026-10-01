import path from 'path';
import { LocalRegistry } from '../../registry';
import { DependencyResolver, createLockfile, writeLockfile } from '../../core/dependency-resolver';
import { installForRuntime, runtimeNames } from '../../runtimes/adapters';

export async function installCommand(skillIdentifier: string, runtime?: string): Promise<void> {
  const separator = skillIdentifier.lastIndexOf('@');
  const name = separator > 0 ? skillIdentifier.slice(0, separator) : skillIdentifier;
  const version = separator > 0 ? skillIdentifier.slice(separator + 1) : 'latest';
  if (runtime && !runtimeNames.includes(runtime as typeof runtimeNames[number])) throw new Error(`Unsupported runtime '${runtime}'`);
  const registry = new LocalRegistry();
  const destination = path.join(process.env.HOME || process.env.USERPROFILE || '', '.skillos', 'skills');
  try {
    const resolver = new DependencyResolver(registry);
    const result = await resolver.resolve(name, version);
    if (result.missing.length) {
      const details = result.missing.map(item => `${item.name}@${item.version}`).join(', ');
      throw new Error(`Unresolved dependencies: ${details}`);
    }
    const root = result.tree.skill;
    const selectedRuntime = runtime || root.runtime.primary;
    for (const skill of result.order) {
      const compatible = [skill.runtime.primary, ...(skill.runtime.compatible ?? [])];
      if (!compatible.includes(selectedRuntime)) throw new Error(`Skill '${skill.name}' does not declare compatibility with runtime '${selectedRuntime}'`);
    }
    for (const skill of result.order) {
      await registry.install(skill.name, skill.version, destination);
      await installForRuntime(skill, selectedRuntime, process.cwd());
      console.log(`Installed ${skill.name}@${skill.version} for ${selectedRuntime}`);
    }
    await writeLockfile(createLockfile(root, result.order), path.resolve('skillos.lock'));
  } finally {
    registry.close();
  }
}
