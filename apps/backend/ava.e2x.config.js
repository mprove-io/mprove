export default {
  files: ['src/**/*.e2x-spec.ts'],
  extensions: {
    ts: 'module'
  },
  verbose: true,
  timeout: '5m',
  nodeArguments: [
    '--import=@swc-node/register/esm-register',
    '--experimental-eventsource'
  ]
};
