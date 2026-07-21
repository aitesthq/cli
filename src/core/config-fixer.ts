import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from './logger.js';
import { ProjectInfo } from './detector.js';

const execAsync = promisify(exec);

export interface ConfigFixPayload {
  type: string;
  dependencies?: string[];
  files?: { path: string; content: string }[];
  reason: string;
}

export async function applyConfigFix(configFix: ConfigFixPayload, projectInfo: ProjectInfo, spinner: any = logger.spinner('Applying fix...')) {
  spinner.info(`Autonomous Config Fix initiated: ${configFix.reason}`);
  
  if (configFix.dependencies && configFix.dependencies.length > 0) {
    spinner.text = `Installing missing dependencies: ${configFix.dependencies.join(', ')}...`;
    const installCmd = projectInfo.packageManager === 'yarn' ? 'yarn add -D' : 
                       projectInfo.packageManager === 'pnpm' ? 'pnpm add -D' : 
                       projectInfo.packageManager === 'bun' ? 'bun add -d' : 'npm install -D --legacy-peer-deps';
    await execAsync(`${installCmd} ${configFix.dependencies.join(' ')}`, { cwd: process.cwd() });
  }
  
  if (configFix.files && configFix.files.length > 0) {
    for (const file of configFix.files) {
      const filePath = resolve(process.cwd(), file.path);
      spinner.text = `Writing config file: ${file.path}...`;
      
      if (file.path.endsWith('package.json')) {
        try {
          const existingPkg = JSON.parse(readFileSync(filePath, 'utf-8'));
          const newPkg = JSON.parse(file.content);
          
          if (newPkg.scripts) {
            existingPkg.scripts = { ...(existingPkg.scripts || {}), ...newPkg.scripts };
          }
          if (newPkg.jest) {
            existingPkg.jest = { ...(existingPkg.jest || {}), ...newPkg.jest };
          }
          
          writeFileSync(filePath, JSON.stringify(existingPkg, null, 2), 'utf-8');
        } catch (e: any) {
          spinner.warn(`Failed to safely merge package.json: ${e.message}`);
        }
      } else {
        writeFileSync(filePath, file.content, 'utf-8');
      }
    }
  }
}
