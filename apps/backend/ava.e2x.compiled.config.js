export default {
  files: ['dist-e2e/src/**/*.e2x-spec.js'],
  verbose: true,
  timeout: '5m',
  nodeArguments: [
    '--import=./loader-register.mjs',
    '--experimental-eventsource'
  ]
};
