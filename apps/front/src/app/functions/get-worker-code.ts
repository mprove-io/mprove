import { MALLOY_GRAMMAR } from '~common/constants/code-themes/grammars/malloy-grammar';
import { MALLOY_NOTEBOOK_GRAMMAR } from '~common/constants/code-themes/grammars/malloy-notebook-grammar';
import { MALLOY_SQL_GRAMMAR } from '~common/constants/code-themes/grammars/malloy-sql-grammar';

export const MALLOY_SQL_GRAMMAR_PATTERNS = [
  MALLOY_SQL_GRAMMAR.repository['malloysql-sql'].patterns[0],
  {
    begin: '>>>malloy',
    end: '(?=>>>)',
    beginCaptures: {
      '0': { name: 'entity.other.attribute.malloy-sql' }
    },
    endCaptures: null,
    name: 'meta.embedded.block.malloysql.malloy',
    patterns: [{ include: 'source.malloy' }]
  },
  {
    begin: '(>>>sql)(\\s*connection:.*?(?<!\n)(?<!//))?',
    end: '(?=>>>)',
    endCaptures: null,
    beginCaptures: {
      '0': { name: 'entity.other.attribute.malloy-sql' },
      ['1' as any]: { name: 'entity.other.attribute.malloy-sql' },
      ['3' as any]: { name: 'comment.line.double-slash' }
    },
    name: 'meta.embedded.block.malloysql.sql',
    patterns: [{ include: 'source.malloy-sql' }]
  },
  ...MALLOY_SQL_GRAMMAR.repository['malloysql-sql'].patterns.filter(
    (x, index) => index !== 0
  )
];

export const MALLOY_NOTEBOOK_GRAMMAR_PATTERNS = [
  MALLOY_NOTEBOOK_GRAMMAR.patterns[0],
  {
    begin: '>>>markdown',
    end: '(?=>>>)',
    beginCaptures: {
      '0': { name: 'entity.other.attribute.markdown' }
    },
    name: 'meta.embedded.block.markdown',
    patterns: [{ include: 'text.html.markdown' }]
  } as any,
  ...MALLOY_NOTEBOOK_GRAMMAR.patterns.filter((x, index) => index !== 0)
];

export function getWorkerCode(item: { assetsPrefix: string }) {
  let { assetsPrefix } = item;

  return `importScripts('${assetsPrefix}/assets/shiki/dist/index.jsdelivr.iife.js');

let malloyGrammar = ${JSON.stringify(MALLOY_GRAMMAR)};
let malloyNotebookGrammar = ${JSON.stringify(MALLOY_NOTEBOOK_GRAMMAR)};
let malloySqlGrammar = ${JSON.stringify(MALLOY_SQL_GRAMMAR)};

malloySqlGrammar.repository['malloysql-sql'].patterns = ${JSON.stringify(MALLOY_SQL_GRAMMAR_PATTERNS)};
malloyNotebookGrammar.patterns = ${JSON.stringify(MALLOY_NOTEBOOK_GRAMMAR_PATTERNS)};

let highlighter;

self.onmessage = async (sMessage) => {
  if (sMessage.data.type === 'initHighlighter') {
    let response = await fetch('${assetsPrefix}/assets/vscode-oniguruma/onig.wasm');

    if (!response.ok) {
      throw new Error("Failed to fetch onig.wasm: " + response.statusText);
    }

    let buffer = await response.arrayBuffer();

    shiki.setWasm(buffer);
    shiki.setCDN('${assetsPrefix}/assets');

    highlighter = await shiki.getHighlighter({
      theme: 'light-plus-extended',
      paths: {
        themes: '/shiki/themes/',
        languages: '/shiki/languages/'
      },
      langs: [
        'sql',
        'markdown',
        {
          id: 'malloy',
          scopeName: 'source.malloy',
          grammar: malloyGrammar
        },
        {
          id: 'malloysql',
          scopeName: 'source.malloy-sql',
          grammar: malloySqlGrammar
        },
        {
          id: 'malloynb',
          scopeName: 'source.malloy-notebook',
          grammar: malloyNotebookGrammar
        }
      ]
    });

    self.postMessage({ type: 'initHighlighterCompleted' });
    //
  } else if (sMessage.data.type === 'highlight') {
    //
    let { input, shikiLanguage, shikiTheme, placeName } = sMessage.data;

    let html;
    let tokenLines = [];

    if (!highlighter) {
      // console.log('worker - highlighter is not defined');
      return;
    }

    if (!highlighter.getLoadedLanguages().includes(shikiLanguage)) {
      // console.log('worker - highlight - unknown language');
      return;
    } else {
      tokenLines = highlighter
        .codeToThemedTokens(input, shikiLanguage, shikiTheme, {
          includeExplanation: true
        })
        .filter((x) => x.length > 0);
    }

    let tokens = [];
    let docPos = 0;
    let docLine = 0;

    for (let tLine of tokenLines) {
      let tIndex = 0;
      for (let tItem of tLine) {
        for (let explanation of tItem.explanation) {
          let text = explanation.content;

          tokens.push({
            color: tItem.color,
            text,
            scope:
              explanation.scopes[explanation.scopes.length - 1]?.scopeName ||
              'text',
            startIndex: docPos,
            endIndex:
              tLine.length === tIndex + 1
                ? docPos + text.length + 1
                : docPos + text.length,
            line: docLine
          });

          docPos += text.length;
        }
        tIndex++;
      }
      docPos = 0;
      docLine++;
    }

    self.postMessage({
      type: 'highlightResult',
      placeName: placeName,
      tokenLines: tokenLines,
      tokens: tokens,
      html: html,
      docText: sMessage.data.docText,
      shikiLanguage: sMessage.data.shikiLanguage,
      shikiTheme: sMessage.data.shikiTheme,
    });
  }
};`;
}
