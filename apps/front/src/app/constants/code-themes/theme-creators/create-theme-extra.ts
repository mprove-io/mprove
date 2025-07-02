import { Extension } from '@codemirror/state';
import { EditorView, highlightActiveLine, lineNumbers } from '@codemirror/view';
import { indentationMarkers } from '@replit/codemirror-indentation-markers';

export function createThemeExtra(themeExtension: Extension) {
  return [
    themeExtension,
    indentationMarkers({
      highlightActiveBlock: false,
      hideFirstIndent: true,
      markerType: 'codeOnly',
      thickness: 1,
      colors: {
        // light: 'LightBlue',
        light: '#d1d5dc',
        dark: 'DarkBlue',
        activeLight: 'LightGreen',
        activeDark: 'DarkGreen'
      }
    }),
    lineNumbers(),
    highlightActiveLine(),
    EditorView.theme({
      // '&': {
      // backgroundColor: '#f0f0f0',
      // fontSize: '20px'
      // },
      '.cm-gutters': {
        'border-right': 'none !important'
      },
      '.cm-content': {
        paddingTop: '12px',
        paddingBottom: '12px',
        fontSize: '16px'
        // padding: '12px',
        // caretColor: '#000000'
      },
      // '.cm-activeLine': {
      //   'background-color': '#f0f9ff'
      // },
      '.cm-line': {
        lineHeight: '1.6'
        // padding: '0 8px'
      }
    })
  ];
}
