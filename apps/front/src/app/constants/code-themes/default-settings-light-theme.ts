import { CreateThemeOptions } from './theme-creators/create-theme';

// https://github.com/uiwjs/react-codemirror/blob/master/themes/vscode/src/light.ts

export const defaultSettingsLightTheme: CreateThemeOptions['settings'] = {
  background: '#ffffff',
  foreground: '#383a42',
  caret: '#000',
  selection: '#add6ff',
  selectionMatch: '#e2e8f0', // '#a8ac94'
  lineHighlight: '#f3f4f6', // overrided on malloyLightInit or vscodeLightInit
  gutterBackground: '#fff',
  gutterForeground: '#237893',
  gutterActiveForeground: '#0b216f',
  fontFamily:
    'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace'
};

// export const defaultSettingsVscodeLight: CreateThemeOptions['settings'] = {
//   background: '#ffffff',
//   foreground: '#383a42',
//   caret: '#000',
//   selection: '#add6ff',
//   selectionMatch: '#a8ac94',
//   lineHighlight: '#99999926',
//   gutterBackground: '#fff',
//   gutterForeground: '#237893',
//   gutterActiveForeground: '#0b216f',
//   fontFamily:
//     'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace'
// };
