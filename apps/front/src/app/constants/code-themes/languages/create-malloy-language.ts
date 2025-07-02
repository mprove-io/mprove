import { StreamLanguage } from '@codemirror/language';
import { OnigScanner, OnigString, loadWASM } from 'vscode-oniguruma';
import { INITIAL, Registry, parseRawGrammar } from 'vscode-textmate';
import { MALLOY_GRAMMAR } from '../grammars/malloy-grammar';

// Map TextMate scopes to CodeMirror theme styles
const malloyScopeToStyle = {
  'keyword.control': 'keyword',
  'keyword.other': 'keyword',
  'entity.name.function': 'function',
  'entity.name.function.modifier': 'function', // e.g., distinct in count(distinct)
  'entity.name.type': 'typeName',
  'variable.other': 'variableName',
  'variable.other.quoted': 'variableName',
  'constant.numeric': 'number',
  'constant.numeric.date': 'literal',
  'constant.numeric.timestamp': 'literal',
  'keyword.other.timeframe': 'unit',
  'constant.language': 'bool',
  'constant.language.null': 'null',
  'string.quoted': 'string',
  'string.regexp': 'string',
  comment: 'comment',
  punctuation: 'punctuation',
  'keyword.operator': 'operator',
  'source.sql': 'meta',
  'source.malloy-in-sql': 'meta',
  'support.type.property-name.json': 'annotation',
  'keyword.operator.comparison.ts': 'operator',
  'keyword.control.negate': 'operator',
  'punctuation.definition.string.begin': 'punctuation',
  'punctuation.definition.string.end': 'punctuation',
  'punctuation.sql-block.open': 'meta',
  'punctuation.sql-block.close': 'meta',
  'punctuation.definition.comment': 'comment'
};

export async function createMalloyLanguage() {
  let wasmBin = await (await fetch('assets/onig.wasm')).arrayBuffer();

  let vscodeOnigurumaLib = loadWASM(wasmBin).then(() => {
    return {
      createOnigScanner(patterns: any) {
        return new OnigScanner(patterns);
      },
      createOnigString(s: any) {
        return new OnigString(s);
      }
    };
  });

  let registry = new Registry({
    onigLib: vscodeOnigurumaLib,
    loadGrammar: async scopeName => {
      if (
        scopeName === 'source.malloy' ||
        scopeName === 'source.sql' ||
        scopeName === 'source.malloy-in-sql'
      ) {
        let malloyRawGrammar = JSON.stringify(MALLOY_GRAMMAR);
        return parseRawGrammar(malloyRawGrammar, 'sql.tmGrammar.json');
      }
      console.log(`Unknown scope name: ${scopeName}`);
      return null;
    }
  });

  const grammar = await registry.loadGrammar('source.malloy');

  if (!grammar) throw new Error('Failed to load Malloy grammar');

  // console.log('grammar');
  // console.log(grammar);

  let malloyStreamParser = {
    startState: () => ({}),

    token(stream: any, state: any): any {
      if (stream.eol()) {
        return null;
      }

      let line = stream.string;

      let ruleStack = state.ruleStack || INITIAL;

      let tokenizeResult = grammar.tokenizeLine(line, ruleStack);

      state.ruleStack = tokenizeResult.ruleStack;

      let currentPos = stream.pos;

      let token = tokenizeResult.tokens.find(
        t => currentPos >= t.startIndex && currentPos < t.endIndex
      );

      console.log('token.scopes');
      console.log(token.scopes);

      if (!token) {
        stream.skipToEnd();
        return null;
      }

      stream.pos = token.endIndex;

      let scope = token.scopes[token.scopes.length - 1];

      for (let [textMateScope, cmStyle] of Object.entries(malloyScopeToStyle)) {
        if (scope.includes(textMateScope)) {
          return cmStyle;
        }
      }

      return null;
    }
  };

  return StreamLanguage.define(malloyStreamParser);
}
