import { Extension } from '@codemirror/state';
import { LIGHT_PLUS_STYLES } from './light-plus-tags';
import { createThemeExtra } from './theme-creators/create-theme-extra';
import { createThemeExtraDiff } from './theme-creators/create-theme-extra-diff';
import { createThemeExtraSingle } from './theme-creators/create-theme-extra-single';

import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { VS_LIGHT_STYLES } from './vs-light-tags';

// https://github.com/uiwjs/react-codemirror/blob/master/themes/theme/src/index.tsx
// https://github.com/uiwjs/react-codemirror/blob/master/themes/vscode/src/light.ts
// https://github.com/uiwjs/react-codemirror/blob/master/themes/vscode/src/dark.ts

interface StyleSpec {
  [propOrSelector: string]: string | number | StyleSpec | null;
}

let lightSpec: {
  [selector: string]: StyleSpec;
} = {
  '.cm-gutters': {
    backgroundColor: '#fff',
    color: '#237893'
    // borderRightColor: undefined // gutterBorder
  },
  '&': {
    backgroundColor: '#ffffff',
    // backgroundImage: undefined,
    color: '#383a42' // foreground
    // fontSize: undefined,
  },
  '&.cm-editor .cm-scroller': {
    fontFamily:
      'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace'
  },
  '.cm-content': {
    caretColor: '#000'
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#000'
  },
  '.cm-activeLine': {
    backgroundColor: '#f3f4f6' // lineHighlight #f0f9ff #00000012
  },
  '.cm-activeLineGutter': {
    color: '#0b216f', // gutterActiveForeground
    backgroundColor: '#f3f4f6' // see cm-activeLine
  },
  '&.cm-focused .cm-selectionBackground, & .cm-line::selection, & .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection':
    {
      background: '#add6ff' + ' !important'
    },
  '& .cm-selectionMatch': {
    backgroundColor: '#e2e8f0' // '#a8ac94'
  }
};

const LIGHT_START_THEME = EditorView.theme(lightSpec, { dark: false });

// LIGHT_PLUS

export const LIGHT_PLUS_THEME = [
  LIGHT_START_THEME,
  syntaxHighlighting(HighlightStyle.define([...LIGHT_PLUS_STYLES]))
];

export const LIGHT_PLUS_THEME_EXTRA: Extension =
  createThemeExtra(LIGHT_PLUS_THEME);

export const LIGHT_PLUS_THEME_EXTRA_SINGLE: Extension = createThemeExtraSingle(
  LIGHT_PLUS_THEME_EXTRA
);

export const LIGHT_PLUS_THEME_EXTRA_DIFF: Extension = createThemeExtraDiff(
  LIGHT_PLUS_THEME_EXTRA
);

// VS_LIGHT
// https://github.com/uiwjs/react-codemirror/blob/master/themes/vscode/src/light.ts

export const VS_LIGHT_THEME = [
  LIGHT_START_THEME,
  syntaxHighlighting(HighlightStyle.define([...VS_LIGHT_STYLES]))
];

export const VS_LIGHT_THEME_EXTRA: Extension = createThemeExtra(VS_LIGHT_THEME);

export const VS_LIGHT_THEME_EXTRA_SINGLE: Extension =
  createThemeExtraSingle(VS_LIGHT_THEME_EXTRA);

export const VS_LIGHT_THEME_EXTRA_DIFF: Extension =
  createThemeExtraDiff(VS_LIGHT_THEME_EXTRA);
