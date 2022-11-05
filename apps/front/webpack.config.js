const { merge } = require('webpack-merge');

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = (config, context) => {
  return merge({
    ...config,
    // Fix: "Uncaught ReferenceError: global is not defined", and "Can't resolve 'fs'".
    // node: { global: true },

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
          // {
          //   entry: 'graphql',
          //   label: 'graphql',
          //   worker: {
          //     id: 'graphql',
          //     // https://github.com/graphql/graphiql/blob/main/examples/monaco-graphql-react-vite/vite.config.ts#L16
          //     // https://github.com/microsoft/monaco-editor-webpack-plugin/issues/136#issuecomment-760296571
          //     entry: 'monaco-graphql/dist/graphql.worker'
          //   }
          // }
        ]
      })
    ]
  });
};
