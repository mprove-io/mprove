import { Extension } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { indentationMarkers } from '@replit/codemirror-indentation-markers';

export function createThemeExtraSession(themeExtension: Extension) {
  return [
    themeExtension,
    indentationMarkers({
      highlightActiveBlock: false,
      hideFirstIndent: true,
      markerType: 'codeOnly',
      thickness: 1,
      colors: {
        light: '#d1d5dc',
        dark: 'DarkBlue',
        activeLight: 'LightGreen',
        activeDark: 'DarkGreen'
      }
    }),
    lineNumbers(),
    EditorView.theme({
      '.cm-gutters': {
        'border-right': 'none !important'
      },
      '.cm-content': {
        paddingTop: '12px',
        paddingBottom: '12px',
        fontSize: '16px'
      },
      '.cm-line': {
        lineHeight: '1.6'
      }
    }),
    EditorView.baseTheme({
      '&light .cm-searchMatch': { backgroundColor: '#ffd6a7' },
      '&light .cm-searchMatch-selected': { backgroundColor: '#fff085' }
    })
  ];
}
