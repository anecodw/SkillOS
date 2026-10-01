import { LocalRegistry } from '../../registry';

export async function searchCommand(query: string, json = false): Promise<void> {
  if (!query.trim()) throw new Error('Search query must not be empty');
  const registry = new LocalRegistry();
  try {
    const results = await registry.search(query);
    if (json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }
    if (!results.length) {
      console.log(`No skills found for "${query}"`);
      return;
    }
    console.log(`Search results for "${query}":`);
    for (const [index, result] of results.entries()) {
      console.log(`${index + 1}. ${result.name}@${result.version}`);
      console.log(`   ${result.description}`);
      console.log(`   Author: ${result.author} | Downloads: ${result.downloads}`);
      if (result.tags.length) console.log(`   Tags: ${result.tags.join(', ')}`);
    }
  } finally {
    registry.close();
  }
}
