import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

export const LIGHT_THEME_ALT: Extension = EditorView.theme({
  '&': {
    backgroundColor: '#FFFFFF', // From light.ts and your colors.editor.background
    color: '#000000', // From light.ts and your colors.editor.foreground
    height: '100%',
    border: '1px solid #D3D3D3', // From light.ts
    borderRadius: '4px',
    overflow: 'auto'
  },
  '.cm-content': {
    fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace", // From light.ts
    fontSize: '16px',
    padding: '12px', // Adjusted from light.ts for VS Code look
    caretColor: '#000000' // From your colors.editorCursor.foreground
  },
  '.cm-line': {
    lineHeight: '1.6' // From light.ts
    // padding: '0 2px'
  },
  '.cm-gutters': {
    backgroundColor: '#FFFFFF', // From light.ts
    color: '#6E6E6E', // Adjusted for readability
    borderRight: 'none', // From light.ts
    padding: '0 8px'
  },
  '.cm-activeLine': {
    backgroundColor: '#00000012' // From your colors.editor.lineHighlightBackground
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent' // From light.ts
  },
  '.cm-selectionBackground': {
    backgroundColor: '#4D97FF54' // From your colors.editor.selectionBackground
  },
  '.cm-matchingBracket': {
    backgroundColor: '#D3D3D3', // Retained from previous theme
    outline: '1px solid #A0A0A0'
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'transparent', // From light.ts
    border: 'none',
    color: '#BFBFBF' // From your deco.folding
  },
  '.cm-scroller': {
    scrollbarWidth: 'thin', // From light.ts
    '&::-webkit-scrollbar': {
      width: '6px',
      height: '6px'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#D3D3D3',
      borderRadius: '3px'
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#FFFFFF'
    }
  },
  // Syntax highlighting (merged from light.ts, previous theme, and your tokens)
  '.tok-comment': {
    color: '#0066FF', // From your token: comment
    fontStyle: 'italic'
  },
  '.tok-keyword': {
    color: '#0000FF', // From your token: keyword
    fontStyle: 'bold'
  },
  '.tok-storage': {
    color: '#0000FF', // From your token: storage
    fontStyle: 'bold'
  },
  '.tok-number': {
    color: '#0000CD' // From your token: constant.numeric
  },
  '.tok-constant': {
    color: '#C5060B', // From your token: constant
    fontStyle: 'bold'
  },
  '.tok-constant-language': {
    color: '#585CF6', // From your token: constant.language
    fontStyle: 'bold'
  },
  '.tok-variable-language': {
    color: '#318495' // From your token: variable.language
  },
  '.tok-variable': {
    color: '#318495' // From your token: variable.other
  },
  '.tok-string': {
    color: '#036A07' // From your token: string
  },
  '.tok-constant-character-escape': {
    color: '#26B31A' // From your token: constant.character.escape
  },
  '.tok-string-meta-embedded': {
    color: '#26B31A' // From your token: string meta.embedded
  },
  '.tok-meta-preprocessor': {
    color: '#1A921C' // From your token: meta.preprocessor
  },
  '.tok-keyword-control-import': {
    color: '#0C450D', // From your token: keyword.control.import
    fontStyle: 'bold'
  },
  '.tok-function': {
    color: '#0000A2', // From your token: entity.name.function
    fontStyle: 'bold'
  },
  '.tok-support-function': {
    color: '#0000A2', // From your token: support.function.any-method
    fontStyle: 'bold'
  },
  '.tok-typeName': {
    color: '#267F99', // From light.ts (entity.name.type)
    textDecoration: 'underline' // From your token: entity.name.type
  },
  '.tok-inherited-class': {
    fontStyle: 'italic' // From your token: entity.other.inherited-class
  },
  '.tok-parameter': {
    fontStyle: 'italic' // From your token: variable.parameter
  },
  '.tok-storage-type-method': {
    color: '#70727E' // From your token: storage.type.method
  },
  '.tok-section': {
    fontStyle: 'italic' // From your token: meta.section entity.name.section
  },
  '.tok-support-function-any': {
    color: '#3C4C72', // From your token: support.function
    fontStyle: 'bold'
  },
  '.tok-support-class': {
    color: '#6D79DE', // From your token: support.class
    fontStyle: 'bold'
  },
  '.tok-support-type': {
    color: '#6D79DE', // From your token: support.type
    fontStyle: 'bold'
  },
  '.tok-support-constant': {
    color: '#06960E', // From your token: support.constant
    fontStyle: 'bold'
  },
  '.tok-support-variable': {
    color: '#21439C', // From your token: support.variable
    fontStyle: 'bold'
  },
  '.tok-operator': {
    color: '#687687' // From your token: keyword.operator.js
  },
  '.tok-invalid': {
    color: '#FFFFFF', // From your token: invalid
    backgroundColor: '#990000'
  },
  '.tok-invalid-deprecated-trailing-whitespace': {
    backgroundColor: '#FFD0D0' // From your token: invalid.deprecated.trailing-whitespace
  },
  '.tok-source': {
    backgroundColor: '#0000000D' // From your token: text source
  },
  '.tok-string-unquoted': {
    backgroundColor: '#0000000D' // From your token: string.unquoted
  },
  '.tok-meta-embedded': {
    backgroundColor: '#0000000D' // From your token: meta.embedded
  },
  '.tok-source-string-unquoted': {
    backgroundColor: '#0000000F' // From your token: text source string.unquoted
  },
  '.tok-source-source': {
    backgroundColor: '#0000000F' // From your token: text source text source
  },
  '.tok-meta-tag-preprocessor-xml': {
    color: '#68685B' // From your token: meta.tag.preprocessor.xml
  },
  '.tok-meta-tag-metadata-doctype': {
    color: '#888888' // From your token: meta.tag.metadata.doctype
  },
  '.tok-meta-tag': {
    color: '#1C02FF' // From your token: meta.tag
  },
  '.tok-declaration-tag': {
    color: '#1C02FF' // From your token: declaration.tag
  },
  '.tok-tag': {
    fontStyle: 'bold' // From your token: entity.name.tag
  },
  '.tok-attribute-name': {
    fontStyle: 'italic' // From your token: entity.other.attribute-name
  },
  '.tok-markup-heading': {
    color: '#0C07FF', // From your token: markup.heading
    fontStyle: 'bold'
  },
  '.tok-markup-quote': {
    color: '#000000', // From your token: markup.quote
    fontStyle: 'italic'
  },
  '.tok-markup-list': {
    color: '#B90690' // From your token: markup.list
  },
  '.tok-deco-folding': {
    color: '#BFBFBF' // From your token: deco.folding
  },
  '.tok-whitespace': {
    color: '#BFBFBF' // From your colors.editorWhitespace.foreground
  },
  // Additional styles from light.ts for completeness
  '.tok-propertyName': {
    color: '#001080' // From light.ts (variable.other.property)
  },
  '.tok-definition': {
    color: '#001080' // From light.ts (variable.other.constant)
  },
  '.tok-punctuation': {
    color: '#3A3A3A' // From light.ts (punctuation)
  },
  '.tok-string-regexp': {
    color: '#D16969' // From light.ts (string.regexp)
  },
  '.tok-meta-brace': {
    color: '#3A3A3A' // From light.ts (punctuation.brace)
  },
  '.cm-tooltip': {
    backgroundColor: '#F5F5F5', // From light.ts
    color: '#000000',
    border: '1px solid #D3D3D3',
    borderRadius: '3px'
  },
  '.cm-tooltip-autocomplete': {
    '& ul li[aria-selected]': {
      backgroundColor: '#4D97FF54', // Match selectionBackground
      color: '#000000'
    }
  }
});
