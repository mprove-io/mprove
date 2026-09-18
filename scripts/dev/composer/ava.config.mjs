export default {
  extensions: {
    ts: 'module'
  },
  files: ['scripts/dev/composer/**/tests/*.spec.ts'],
  nodeArguments: ['--import=tsx'],
  workerThreads: false
};
