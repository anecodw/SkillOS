import { LocalRegistry } from '../../registry';

export async function listCommand(json = false): Promise<void> {
  const registry = new LocalRegistry();
  try {
    const skills = await registry.list();
    if (json) {
      console.log(JSON.stringify(skills, null, 2));
      return;
    }
    if (!skills.length) {
      console.log('No skills in registry');
      return;
    }
    console.log('Name\tVersion\tAuthor\tDownloads');
    for (const skill of skills) console.log(`${skill.name}\t${skill.version}\t${skill.author}\t${skill.downloads}`);
  } finally {
    registry.close();
  }
}
