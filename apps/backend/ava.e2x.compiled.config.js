export default {
  files: ['dist-e2x/src/**/*.e2x-spec.js'],
  verbose: true,
  timeout: '5m',
  nodeArguments: [
    '--import=./loader-register.mjs',
    '--disable-warning=DEP0169',
    '--experimental-eventsource'
  ]
};
