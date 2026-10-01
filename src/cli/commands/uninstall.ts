import path from 'path';
import { LocalRegistry } from '../../registry';
import { runtimeNames, uninstallFromRuntime } from '../../runtimes/adapters';

export async function uninstallCommand(skillName: string, runtime?: string): Promise<void> {
  if (runtime && !runtimeNames.includes(runtime as typeof runtimeNames[number])) throw new Error(`Unsupported runtime '${runtime}'`);
  const registry = new LocalRegistry();
  try {
    await registry.uninstall(skillName);
    if (runtime) await uninstallFromRuntime(skillName, runtime, process.cwd());
    else for (const name of runtimeNames) await uninstallFromRuntime(skillName, name, path.resolve(process.cwd()));
    console.log(`Uninstalled ${skillName}`);
  } finally {
    registry.close();
  }
}
