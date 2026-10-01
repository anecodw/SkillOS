import path from 'path';
import { LocalRegistry } from '../../registry';

export async function publishCommand(skillPath?: string): Promise<void> {
  const filePath = skillPath || path.join(process.cwd(), 'skill.md');
  
  const registry = new LocalRegistry();
  
  try {
    console.log(`Publishing skill from ${filePath}...`);
    await registry.publish(filePath);
    console.log(`✓ Successfully published skill`);
  } catch (error) {
    console.error(`✗ Failed to publish skill:`, error);
    throw error;
  } finally {
    registry.close();
  }
}
