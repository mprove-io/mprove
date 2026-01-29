export default {
  files: ['src/**/*.e2e-spec.ts'],
  extensions: {
    ts: 'module'
  },
  verbose: true,
  timeout: '1m',
  nodeArguments: ['--import=@swc-node/register/esm-register']
};
