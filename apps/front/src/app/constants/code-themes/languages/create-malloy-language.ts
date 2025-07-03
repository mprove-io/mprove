import { StreamLanguage } from '@codemirror/language';
import { OnigScanner, OnigString, loadWASM } from 'vscode-oniguruma';
import {
  INITIAL,
  Registry,
  StateStack,
  parseRawGrammar
} from 'vscode-textmate';
import { MALLOY_GRAMMAR } from '../grammars/malloy-grammar';
import { SQL_GRAMMAR } from '../grammars/sql-grammar';
import { sqlScopeToStyle } from './create-sql-language';

// TextMate scopes to CodeMirror theme styles
const malloyScopeToStyle = {
  'keyword.control': 'keyword',
  'keyword.other': 'keyword',
  'entity.name.function': 'function',
  'entity.name.function.modifier': 'function',
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
        scopeName === 'source.malloy-in-sql'
      ) {
        const MALLOY_GRAMMAR_EXTENDED = Object.assign({}, MALLOY_GRAMMAR, {
          patterns: [
            {
              name: 'punctuation.malloy-in-sql.end',
              match: '}%',
              captures: { '0': { name: 'punctuation.malloy-in-sql.end' } }
            },
            ...MALLOY_GRAMMAR.patterns
          ]
        });

        return parseRawGrammar(
          JSON.stringify(MALLOY_GRAMMAR_EXTENDED),
          'malloy-extended.tmGrammar.json'
        );
      } else if (scopeName === 'source.sql') {
        const SQL_GRAMMAR_EXTENDED = Object.assign({}, SQL_GRAMMAR, {
          patterns: [
            {
              name: 'punctuation.sql-block.close',
              match: '"""',
              captures: { '0': { name: 'punctuation.sql-block.close' } }
            },
            {
              name: 'source.malloy-in-sql',
              begin: '%{',
              end: '}%?',
              beginCaptures: {
                '0': { name: 'punctuation.malloy-in-sql.begin' }
              },
              endCaptures: { '0': { name: 'punctuation.malloy-in-sql.end' } },
              patterns: [{ include: 'source.malloy' }]
            },
            ...SQL_GRAMMAR.patterns
          ]
        });

        return parseRawGrammar(
          JSON.stringify(SQL_GRAMMAR_EXTENDED),
          'sql-extended.tmGrammar.json'
        );
      }

      console.log(`Unknown scope name: ${scopeName}`);
      return null;
    }
  });

  const malloyGrammar = await registry.loadGrammar('source.malloy');
  const sqlGrammar = await registry.loadGrammar('source.sql');

  if (!malloyGrammar) throw new Error('Failed to load Malloy grammar');
  if (!sqlGrammar) throw new Error('Failed to load SQL grammar');

  // console.log('grammar');
  // console.log(grammar);

  let malloyStreamParser = {
    startState: () => ({
      ruleStack: { malloy: INITIAL, sql: INITIAL },
      currentGrammar: 'malloy'
    }),

    token(
      stream: any,
      state: any
      // {
      //   malloyRuleStack: StateStack;
      //   sqlRuleStack: StateStack;
      //   currentGrammar: string; // malloy or sql
      // }
    ): any {
      if (stream.eol()) {
        return null;
      }

      let line = stream.string;

      let grammar = state.currentGrammar === 'sql' ? sqlGrammar : malloyGrammar;

      let ruleStack: StateStack =
        (state.currentGrammar === 'sql'
          ? state.sqlRuleStack
          : state.malloyRuleStack) || INITIAL;

      let tokenizeResult = grammar.tokenizeLine(line, ruleStack);

      ruleStack = tokenizeResult.ruleStack;

      let currentPos = stream.pos;

      let token = tokenizeResult.tokens.find(
        t => currentPos >= t.startIndex && currentPos < t.endIndex
      );

      // console.log('%c' + state.currentGrammar, 'font-weight: bold;');

      // console.log(line);

      // console.log(
      //   'word: ',
      //   line.substr(token.startIndex, token.endIndex - token.startIndex)
      // );

      // console.log(
      //   'currentPos: ',
      //   currentPos,
      //   '  token.startIndex: ',
      //   token.startIndex,
      //   '  token.endIndex ',
      //   token.endIndex
      // );

      // console.log(token.scopes);

      if (!token) {
        stream.skipToEnd();
        return null;
      }

      stream.pos = token.endIndex;

      let scope = token.scopes[token.scopes.length - 1];

      let prevGrammar = state.currentGrammar;

      if (scope === 'punctuation.malloy-in-sql.end') {
        state.currentGrammar = 'sql';
      } else if (scope === 'source.sql' && prevGrammar === 'malloy') {
        if (line.length >= stream.pos + 7) {
          // 7 chars 'sql("""'
          stream.pos = stream.pos + 7;
        }
        state.currentGrammar = 'sql';
      } else if (scope === 'source.malloy-in-sql') {
        state.currentGrammar = 'malloy';
      } else if (scope === 'punctuation.sql-block.close') {
        if (line.length >= stream.pos + 1) {
          // 1 char ')'
          stream.pos = line.length;
        }
        state.currentGrammar = 'malloy';
      }

      let sqlScopeToStyleExtended = {
        ...sqlScopeToStyle,
        'punctuation.sql-block.close': 'punctuation',
        'source.malloy-in-sql': 'malloy-in-sql',
        'punctuation.malloy-in-sql.begin': 'punctuation',
        'punctuation.malloy-in-sql.end': 'punctuation'
      };

      for (let [textMateScope, cmStyle] of Object.entries(
        scope === 'source.sql' ? sqlScopeToStyleExtended : malloyScopeToStyle
      )) {
        if (scope.includes(textMateScope)) {
          return cmStyle;
        }
      }

      return null;
    }
  };

  return StreamLanguage.define(malloyStreamParser);
}
