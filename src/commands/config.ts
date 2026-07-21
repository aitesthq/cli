import { Command } from 'commander';
import { loadConfig, saveConfig } from '../core/config.js';
import { logger } from '../core/logger.js';

export const configCommand = new Command('config')
  .description('Manage settings (e.g., provider, model, apiKey)');

configCommand.command('set <key> <value>')
  .description('Set a configuration value')
  .action(async (key, value) => {
    let config = await loadConfig();
    if (!config) {
      config = { provider: 'openai', model: 'gpt-4o' }; // fallback default
    }
    
    // basic type coercion
    let parsedValue: any = value;
    if (value === 'true') parsedValue = true;
    if (value === 'false') parsedValue = false;
    if (!isNaN(Number(value))) parsedValue = Number(value);

    (config as any)[key] = parsedValue;
    
    await saveConfig(config);
  });

configCommand.command('list')
  .description('List current configuration')
  .action(async () => {
    const config = await loadConfig();
    if (!config) {
      logger.warn('No configuration found. Run `aitest init`.');
      return;
    }
    
    console.log('\n--- Current Configuration ---');
    for (const [key, value] of Object.entries(config)) {
      if (key === 'apiKey') {
         console.log(`${key}: ********* (Hidden)`);
      } else {
         console.log(`${key}: ${value}`);
      }
    }
    console.log('---------------------------\n');
  });
