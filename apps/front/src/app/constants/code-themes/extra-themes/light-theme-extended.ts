import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { LIGHT_THEME } from './light-theme';

export const LIGHT_THEME_EXTENDED: Extension = [
  ...LIGHT_THEME,
  EditorView.theme({
    '&': {
      // backgroundColor: '#f0f0f0',
      // fontSize: '20px'
    },
    '.cm-content': {
      fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
      fontSize: '16px',
      padding: '12px',
      caretColor: '#000000'
    },
    '.cm-line': {
      lineHeight: '1.6'
      // padding: '0 2px'
    },
    '.cm-activeLine': {
      backgroundColor: '#00000012' // From your colors.editor.lineHighlightBackground
    }
  })
  // syntaxHighlighting(
  //   HighlightStyle.define([
  //     { tag: t.keyword, color: '#ff5733' },
  //     { tag: t.string, color: '#008000' }
  //   ])
  // )
];
