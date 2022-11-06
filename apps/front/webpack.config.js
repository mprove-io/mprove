const { merge } = require('webpack-merge');

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = (config, context) => {
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
