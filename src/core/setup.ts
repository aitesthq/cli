import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { ProjectInfo } from './detector.js';
import { logger } from './logger.js';

const execAsync = promisify(exec);

export async function installTestRunner(projectInfo: ProjectInfo, targetDir: string = process.cwd()) {
  const spinner = logger.spinner('Setting up test runner...').start();
  
  const isTs = projectInfo.language === 'typescript';
  const runner = isTs ? 'vitest' : 'jest';
  const packages = isTs ? 'vitest' : 'jest';
  
  let installCmd = '';
  switch (projectInfo.packageManager) {
    case 'npm':
      installCmd = `npm install -D ${packages}`;
      break;
    case 'yarn':
      installCmd = `yarn add -D ${packages}`;
      break;
    case 'pnpm':
      installCmd = `pnpm add -D ${packages}`;
      break;
    case 'bun':
      installCmd = `bun add -D ${packages}`;
      break;
  }

  try {
    spinner.text = `Installing ${runner} using ${projectInfo.packageManager}...`;
    await execAsync(installCmd, { cwd: targetDir });
    
    spinner.text = 'Updating package.json...';
    const packageJsonPath = resolve(targetDir, 'package.json');
    let pkg: any = {};
    try {
      pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    } catch (e) {
      pkg = {};
    }

    if (!pkg.scripts) pkg.scripts = {};
    
    if (runner === 'vitest') {
      pkg.scripts.test = 'vitest run';
    } else {
      pkg.scripts.test = 'jest';
    }

    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');
    
    spinner.succeed(`Successfully installed and configured ${runner}!`);
  } catch (error: any) {
    spinner.fail(`Failed to set up test runner: ${error.message}`);
  }
}
