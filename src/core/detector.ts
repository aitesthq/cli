import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export interface ProjectInfo {
  language: 'javascript' | 'typescript';
  testRunner: 'jest' | 'vitest' | 'mocha' | 'unknown';
  framework: 'react' | 'vue' | 'angular' | 'node' | 'unknown';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
}

export function detectProjectInfo(targetDir: string = process.cwd()): ProjectInfo {
  const packageJsonPath = resolve(targetDir, 'package.json');
  const tsconfigPath = resolve(targetDir, 'tsconfig.json');
  
  let packageJson: any = {};
  if (existsSync(packageJsonPath)) {
    try {
      packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    } catch (e) {
      // ignore
    }
  }

  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };

  const language = existsSync(tsconfigPath) || allDeps['typescript'] ? 'typescript' : 'javascript';
  
  let testRunner: ProjectInfo['testRunner'] = 'unknown';
  if (allDeps['jest']) testRunner = 'jest';
  else if (allDeps['vitest']) testRunner = 'vitest';
  else if (allDeps['mocha']) testRunner = 'mocha';

  let framework: ProjectInfo['framework'] = 'unknown';
  if (allDeps['react']) framework = 'react';
  else if (allDeps['vue']) framework = 'vue';
  else if (allDeps['@angular/core']) framework = 'angular';
  else if (allDeps['express'] || allDeps['@nestjs/core'] || allDeps['fastify']) framework = 'node';

  let packageManager: ProjectInfo['packageManager'] = 'npm';
  if (existsSync(resolve(targetDir, 'pnpm-lock.yaml'))) packageManager = 'pnpm';
  else if (existsSync(resolve(targetDir, 'yarn.lock'))) packageManager = 'yarn';
  else if (existsSync(resolve(targetDir, 'bun.lockb'))) packageManager = 'bun';

  return { language, testRunner, framework, packageManager };
}
