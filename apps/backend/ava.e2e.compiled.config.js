export default {
  files: ['dist-e2e/src/**/*.e2e-spec.js'],
  verbose: true,
  timeout: '1m',
  nodeArguments: ['--import=./loader-register.mjs', '--disable-warning=DEP0169']
};
