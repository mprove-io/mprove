export default {
  files: ['!dist', '*/**/*.e2e-spec.ts'],
  extensions: ['ts'],
  verbose: true,
  concurrency: 7,
  timeout: '1m',
  require: ['ts-node/register', 'reflect-metadata']
};
