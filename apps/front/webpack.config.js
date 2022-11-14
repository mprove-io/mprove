const { merge } = require('webpack-merge');

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = (config, context) => {
  config.resolve = config.resolve || {};
  config.resolve.fallback = config.resolve.fallback || {};
  config.resolve.fallback = Object.assign(config.resolve.fallback, {
    // os: false,
  });

  return merge({
    ...config,
    plugins: [
      ...config.plugins,
      new MonacoWebpackPlugin({
        customLanguages: [
          {
            label: 'yaml',
            entry: 'monaco-yaml',
            worker: {
              id: 'monaco-yaml/yamlWorker',
              entry: 'monaco-yaml/yaml.worker'
            }
          }
        ]
      })
    ]
  });
};
