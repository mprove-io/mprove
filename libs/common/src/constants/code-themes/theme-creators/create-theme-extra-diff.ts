import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export function createThemeExtraDiff(themeExtension: Extension) {
  return [
    themeExtension,
    EditorView.baseTheme({
      // '.cm-mergeView & .cm-scroller, .cm-mergeView &': {
      //   height: 'auto !important',
      //   overflowY: 'visible !important'
      // },
      '&.cm-merge-a .cm-changedLine, .cm-deletedChunk': {
        backgroundColor: '#ffecec' // 'rgba(160, 128, 100, .08)'
      },
      '&.cm-merge-b .cm-changedLine, .cm-inlineChangedLine': {
        backgroundColor: '#ecfcca' // 'rgba(100, 160, 128, .08)'
      },
      '&light.cm-merge-a .cm-changedText, &light .cm-deletedChunk .cm-deletedText':
        {
          backgroundColor: '#ffa2a2',
          background: '#ffa2a2'
          // background:
          //   'linear-gradient(#ee443366, #ee443366) bottom/100% 2px no-repeat'
        },
      // '&dark.cm-merge-a .cm-changedText, &dark .cm-deletedChunk .cm-deletedText':
      //   {
      //     background:
      //       'linear-gradient(#ffaa9966, #ffaa9966) bottom/100% 2px no-repeat'
      //   },
      '&light.cm-merge-b .cm-changedText': {
        // background:
        //   'linear-gradient(#22bb22aa, #22bb22aa) bottom/100% 2px no-repeat'
        backgroundColor: '#bbf451',
        background: '#bbf451'
        // backgroundColor: '#7bf1a8',
        // background: '#7bf1a8'
      }
      // '&dark.cm-merge-b .cm-changedText': {
      //   background:
      //     'linear-gradient(#88ff88aa, #88ff88aa) bottom/100% 2px no-repeat'
      // },
      // '&.cm-merge-b .cm-deletedText': {
      //   background: '#ff000033'
      // },
      // '.cm-insertedLine, .cm-deletedLine, .cm-deletedLine del': {
      //   textDecoration: 'none'
      // },
      // '.cm-deletedChunk': {
      //   paddingLeft: '6px',
      //   '& .cm-chunkButtons': {
      //     position: 'absolute',
      //     insetInlineEnd: '5px'
      //   },
      //   '& button': {
      //     border: 'none',
      //     cursor: 'pointer',
      //     color: 'white',
      //     margin: '0 2px',
      //     borderRadius: '3px',
      //     '&[name=accept]': { background: '#2a2' },
      //     '&[name=reject]': { background: '#d43' }
      //   }
      // },
      // '.cm-collapsedLines': {
      //   padding: '5px 5px 5px 10px',
      //   cursor: 'pointer',
      //   '&:before': {
      //     content: '"⦚"',
      //     marginInlineEnd: '7px'
      //   },
      //   '&:after': {
      //     content: '"⦚"',
      //     marginInlineStart: '7px'
      //   }
      // },
      // '&light .cm-collapsedLines': {
      //   color: '#444',
      //   background:
      //     'linear-gradient(to bottom, transparent 0, #f3f3f3 30%, #f3f3f3 70%, transparent 100%)'
      // },
      // '&dark .cm-collapsedLines': {
      //   color: '#ddd',
      //   background:
      //     'linear-gradient(to bottom, transparent 0, #222 30%, #222 70%, transparent 100%)'
      // },
      // '.cm-changeGutter': { width: '3px', paddingLeft: '1px' },
      // '&light.cm-merge-a .cm-changedLineGutter, &light .cm-deletedLineGutter': {
      //   background: '#e43'
      // },
      // '&dark.cm-merge-a .cm-changedLineGutter, &dark .cm-deletedLineGutter': {
      //   background: '#fa9'
      // },
      // '&light.cm-merge-b .cm-changedLineGutter': { background: '#2b2' },
      // '&dark.cm-merge-b .cm-changedLineGutter': { background: '#8f8' },
      // '.cm-inlineChangedLineGutter': { background: '#75d' }
    })
  ];
}
