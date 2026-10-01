import { LocalRegistry } from '../../registry';

export async function listCommand(): Promise<void> {
  const registry = new LocalRegistry();
  
  try {
    const skills = await registry.list();
    
    if (skills.length === 0) {
      console.log('No skills in registry');
      return;
    }

    console.log('\nAvailable Skills:\n');
    console.log('Name\t\tVersion\tAuthor\t\tDownloads');
    console.log(''.padEnd(80, '-'));
    
    skills.forEach(skill => {
      console.log(`${skill.name.padEnd(16)}\t${skill.version.padEnd(8)}\t${skill.author.padEnd(16)}\t${skill.downloads}`);
    });
  } catch (error) {
    console.error('✗ Failed to list skills:', error);
    throw error;
  } finally {
    registry.close();
  }
}
