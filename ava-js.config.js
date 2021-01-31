export default {
  files: ['dist/tests/disk/apps/**/*.spec.js'],
  extensions: ['js'],
  verbose: true,
  timeout: '1m',
  require: ['module-alias/register', 'reflect-metadata']
};
