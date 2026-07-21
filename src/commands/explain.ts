import { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { logger } from '../core/logger.js';
import { askAI } from '../core/ai.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const explainCommand = new Command('explain')
  .description('Explains test failures in plain English')
  .action(async () => {
    const config = await loadConfig();
    if (!config) {
      logger.error('Configuration not found. Run `aitest init` first.');
      return;
    }

    const spinner = logger.spinner('Running tests to gather failure data...').start();
    
    let stdoutStr = '';
    let stderrStr = '';

    try {
      await execAsync('npm test');
      spinner.succeed('Tests passed! Nothing to explain.');
      return;
    } catch (error: any) {
      stdoutStr = error.stdout || '';
      stderrStr = error.stderr || error.message;
      spinner.info('Test failure detected.');
    }

    const outputToAnalyze = `
STDOUT:
${stdoutStr.slice(-2000)}

STDERR:
${stderrStr.slice(-2000)}
    `.trim();

    logger.info('Analyzing root cause with AI...');
    const analyzeSpinner = logger.spinner('Thinking...').start();
    
    try {
      const explanation = await askAI(
        config,
        'You are an expert QA and software testing engineer. The user has failing tests. Explain the failure in plain English. Include:\n- Root cause\n- Stack analysis\n- Suggested fixes',
        outputToAnalyze
      );
      
      analyzeSpinner.succeed('Explanation ready:');
      console.log('\n' + explanation + '\n');
      
    } catch (error: any) {
      analyzeSpinner.fail('AI explanation failed.');
      logger.error(error.message);
    }
  });
