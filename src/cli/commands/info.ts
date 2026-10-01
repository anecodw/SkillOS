import { LocalRegistry } from '../../registry';

export async function infoCommand(identifier: string, json = false): Promise<void> {
  const separator = identifier.lastIndexOf('@');
  const name = separator > 0 ? identifier.slice(0, separator) : identifier;
  const version = separator > 0 ? identifier.slice(separator + 1) : 'latest';
  const registry = new LocalRegistry();
  try {
    const skill = await registry.getSkill(name, version);
    if (json) {
      console.log(JSON.stringify(skill, null, 2));
      return;
    }
    console.log(`${skill.name}@${skill.version}\n${skill.description}\nAuthor: ${skill.author}\nRuntime: ${skill.runtime.primary}`);
    if (skill.dependencies && Object.keys(skill.dependencies).length) console.log(`Dependencies: ${Object.entries(skill.dependencies).map(([key, value]) => `${key}@${value}`).join(', ')}`);
    if (skill.permissions?.length) console.log(`Permissions: ${skill.permissions.join(', ')}`);
  } finally {
    registry.close();
  }
}
