export default {
  files: ['dist-test/src/**/*.spec.js'],
  verbose: true,
  timeout: '1m',
  nodeArguments: ['--import=./loader-register.mjs', '--disable-warning=DEP0169']
};
