import { LocalRegistry } from '../../registry';

export async function searchCommand(query: string): Promise<void> {
  const registry = new LocalRegistry();
  
  try {
    const results = await registry.search(query);
    
    if (results.length === 0) {
      console.log(`No skills found for "${query}"`);
      return;
    }

    console.log(`\nSearch results for "${query}":\n`);
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}@${result.version}`);
      console.log(`   ${result.description}`);
      console.log(`   Author: ${result.author} | Downloads: ${result.downloads}`);
      if (result.tags.length > 0) {
        console.log(`   Tags: ${result.tags.join(', ')}`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('✗ Failed to search skills:', error);
    throw error;
  } finally {
    registry.close();
  }
}
