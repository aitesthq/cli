import { scanDependencies } from './src/core/scanner.js';

const context = scanDependencies('src/commands/generate.ts');
console.log('Scanner Output:');
console.log(context.substring(0, 1000));
console.log('... Total characters:', context.length);
