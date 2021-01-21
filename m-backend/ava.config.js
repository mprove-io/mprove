export default {
  files: ['!dist', '*/**/*.e2e-spec.ts'],
  extensions: ['ts'],
  verbose: true,
  timeout: '1m',
  require: ['ts-node/register', 'reflect-metadata']
};
