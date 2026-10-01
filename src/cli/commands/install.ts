import path from 'path';
import { LocalRegistry } from '../../registry';

export async function installCommand(skillIdentifier: string): Promise<void> {
  const [name, version] = skillIdentifier.split('@');
  
  const registry = new LocalRegistry();
  
  try {
    console.log(`Installing ${skillIdentifier}...`);
    await registry.install(name, version);
    console.log(`✓ Successfully installed ${skillIdentifier}`);
  } catch (error) {
    console.error(`✗ Failed to install ${skillIdentifier}:`, error);
    throw error;
  } finally {
    registry.close();
  }
}
