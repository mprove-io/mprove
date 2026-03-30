import { execSync } from 'node:child_process';

console.log(execSync('e2b template list', { encoding: 'utf-8' }));
