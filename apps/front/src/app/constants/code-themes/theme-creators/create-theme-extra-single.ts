import { foldGutter } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export function createThemeExtraSingle(themeExtension: Extension) {
  return [
    themeExtension,
    foldGutter({
      markerDOM(open) {
        const el = document.createElement('div');
        el.className = 'cm-fold-marker';
        el.innerHTML = open
          ? `<svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="#4D4F5C"
    >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M19 9l-7 7-7-7"
    />
    </svg>`
          : `<svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="#4D4F5C"
    >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M9 5l7 7-7 7"
    />
    </svg>`;
        return el;
      }
    }),
    EditorView.theme({
      '.cm-foldGutter': {
        color: 'black',
        // backgroundColor: 'yellow',
        width: '30px',
        // textAlign: 'center',
        display: 'flex',
        'align-items': 'center'
      },
      '.cm-fold-marker': {
        opacity: 0,
        transition: 'opacity 0.2s ease',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center'
      },
      '.cm-foldGutter:hover .cm-fold-marker': {
        opacity: 1
      },
      '.cm-gutterElement:has(.cm-fold-marker)': {
        cursor: 'pointer'
      }
    })
  ];
}
