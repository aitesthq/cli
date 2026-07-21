import { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { logger } from '../core/logger.js';
import { askAI } from '../core/ai.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

import { detectProjectInfo } from '../core/detector.js';

export const runCommand = new Command('run')
  .description('Run tests and analyze with AI (implicitly tracks coverage)')
  .action(async () => {
    const config = await loadConfig();
    if (!config) {
      logger.error('Configuration not found. Run `aitest init` first.');
      return;
    }

    const projectInfo = detectProjectInfo();
    let testCommand = 'npm test -- --coverage';
    if (projectInfo.testRunner === 'mocha' || projectInfo.testRunner === 'unknown') {
      testCommand = 'npm test --coverage';
    }

    const spinner = logger.spinner(`Running tests with coverage (${testCommand})...`).start();
    
    let stdoutStr = '';
    let stderrStr = '';
    let testFailed = false;

    try {
      const { stdout, stderr } = await execAsync(testCommand);
      stdoutStr = stdout;
      stderrStr = stderr;
      spinner.succeed('Tests passed!');
    } catch (error: any) {
      testFailed = true;
      stdoutStr = error.stdout || '';
      stderrStr = error.stderr || error.message;
      spinner.fail('Tests failed.');
    }

    const outputToAnalyze = `
STDOUT:
${stdoutStr.slice(-2000)}

STDERR:
${stderrStr.slice(-2000)}
    `.trim();

    logger.info('Analyzing test results with AI...');
    const analyzeSpinner = logger.spinner('Thinking...').start();
    
    try {
      const analysis = await askAI(
        config,
        'You are an expert QA and software testing engineer. Analyze the provided test output and code coverage metrics. Keep it concise. If there are failures, provide a clear summary of what failed and why. Also, briefly analyze the coverage table and suggest what areas of the code need more tests.',
        outputToAnalyze
      );
      
      analyzeSpinner.succeed('Analysis complete');
      console.log('\n' + analysis + '\n');
      
    } catch (error: any) {
      analyzeSpinner.fail('AI analysis failed.');
      logger.error(error.message);
    }
  });
