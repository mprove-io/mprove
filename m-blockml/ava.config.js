export default {
  files: ['!dist', '*/**/*.spec.ts'],
  extensions: ['ts'],
  verbose: true,
  // concurrency: 7,
  timeout: '1m',
  require: ['ts-node/register', 'reflect-metadata']
};
