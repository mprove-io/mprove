export default {
  files: ['!dist', '**/tests/*.e2e-spec.ts'],
  extensions: ['ts'],
  verbose: true,
  require: ['ts-node/register', 'reflect-metadata']
};
