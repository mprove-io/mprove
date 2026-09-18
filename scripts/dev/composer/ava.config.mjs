export default {
  extensions: {
    ts: 'module'
  },
  files: ['scripts/dev/composer/**/*.spec.ts'],
  nodeArguments: ['--import=tsx'],
  workerThreads: false
};
