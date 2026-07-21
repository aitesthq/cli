import { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { logger } from '../core/logger.js';
import { detectProjectInfo } from '../core/detector.js';
import { askAI } from '../core/ai.js';

export const doctorCommand = new Command('doctor')
  .description('Verify installation, configuration, and environment')
  .action(async () => {
    logger.info('Running AI Test CLI Diagnostics...\n');

    let allChecksPassed = true;

    // 1. Check Configuration
    const configSpinner = logger.spinner('Checking configuration...').start();
    const config = await loadConfig();
    if (config) {
      configSpinner.succeed('Configuration found');
    } else {
      configSpinner.fail('Configuration missing. Run `aitest init`');
      allChecksPassed = false;
    }

    // 2. Check API Key
    const apiSpinner = logger.spinner('Checking API key...').start();
    if (config?.apiKey || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY) {
      apiSpinner.succeed('API key configured');
    } else {
      apiSpinner.warn('No explicit API key found in config or environment variables (might be okay for local models)');
    }

    // 3. Test Model Access
    if (config) {
      const modelSpinner = logger.spinner(`Testing access to ${config.provider} (${config.model})...`).start();
      try {
        const response = await askAI(config, 'Reply with exactly "OK"', 'Test connection');
        if (response.includes('OK') || response.trim() !== '') {
          modelSpinner.succeed('Model connection successful');
        } else {
          modelSpinner.warn('Model responded, but unexpectedly');
        }
      } catch (error: any) {
        modelSpinner.fail(`Model connection failed: ${error.message}`);
        allChecksPassed = false;
      }
    }

    // 4. Check Project Environment
    const envSpinner = logger.spinner('Checking project environment...').start();
    const projectInfo = detectProjectInfo();
    
    if (projectInfo.packageManager !== 'npm' && projectInfo.packageManager !== 'yarn' && projectInfo.packageManager !== 'pnpm' && projectInfo.packageManager !== 'bun') {
      envSpinner.fail('Supported package manager not found');
      allChecksPassed = false;
    } else if (projectInfo.testRunner === 'unknown') {
      envSpinner.warn(`Test runner not explicitly detected. Fallback may be used.`);
    } else {
      envSpinner.succeed(`Project environment valid (${projectInfo.language}, ${projectInfo.packageManager}, ${projectInfo.testRunner})`);
    }

    console.log('\n--- Diagnostic Summary ---');
    if (allChecksPassed) {
      logger.success('✅ All critical checks passed. You are ready to generate tests!');
    } else {
      logger.warn('⚠️ Some checks failed. Please resolve the issues above before proceeding.');
    }
  });
