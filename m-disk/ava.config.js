export default {
  files: ['!dist', '*/**/*.spec.ts'],
  extensions: ['ts'],
  verbose: true,
  timeout: '1m',
  require: ['ts-node/register', 'tsconfig-paths/register', 'reflect-metadata']
};
