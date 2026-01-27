export default {
  files: ['dist/tests/**/*.spec.js'],
  extensions: ['js'],
  verbose: true,
  timeout: '1m',
  require: ['module-alias/register', 'reflect-metadata']
};
