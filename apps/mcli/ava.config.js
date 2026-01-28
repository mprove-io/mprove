export default {
  files: ['dist/tests/**/*.e2e-spec.js'],
  extensions: ['js'],
  verbose: true,
  timeout: '1m',
  require: ['module-alias/register', 'reflect-metadata']
};
