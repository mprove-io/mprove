import { StreamLanguage } from '@codemirror/language';
import { Extension } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';
import { OnigScanner, OnigString, loadWASM } from 'vscode-oniguruma';
import { INITIAL, Registry, parseRawGrammar } from 'vscode-textmate';
import { createThemeExtra } from './create-theme-extra';
import { createThemeExtraMod } from './create-theme-extra-mod';
import { MALLOY_GRAMMAR } from './malloy-grammar';
import { CreateThemeOptions, createTheme } from './theme-parts';

export const defaultSettingsMalloyLight: CreateThemeOptions['settings'] = {
  background: '#ffffff',
  foreground: '#383a42',
  caret: '#000',
  selection: '#add6ff',
  selectionMatch: '#a8ac94',
  lineHighlight: '#f3f4f6', // overrided on init
  gutterBackground: '#fff',
  gutterForeground: '#237893',
  gutterActiveForeground: '#0b216f',
  fontFamily:
    'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace'
};

export const malloyLightStyle: CreateThemeOptions['styles'] = [
  // Keywords (e.g., is, on, not, or, and, etc.)
  {
    tag: [t.keyword, t.controlKeyword, t.operatorKeyword],
    color: '#0000ff'
  },

  // Properties (e.g., select, where, join_one, query, etc.)
  {
    tag: t.propertyName,
    color: '#af00db'
  },

  // Identifiers (quoted and unquoted)
  {
    tag: [t.variableName, t.labelName],
    color: '#0070c1'
  },

  // Functions (e.g., COUNT, SUM, AVG, etc.)
  {
    tag: [t.function(t.variableName)],
    color: '#795e26'
  },

  // Types (e.g., string, number, date, timestamp, boolean)
  {
    tag: [t.typeName],
    color: '#267f99'
  },

  // Numbers (e.g., integers, decimals)
  {
    tag: [t.number],
    color: '#098658'
  },

  // Strings (single, double, triple quoted, regex)
  {
    tag: [t.string, t.special(t.string)],
    color: '#a31515'
  },

  // Constants (true, false, null)
  {
    tag: [t.bool, t.null],
    color: '#267f99'
  },

  // Timeframes (e.g., year, month, day, etc.)
  {
    tag: t.unit, // Using unit for timeframes as a close match
    color: '#0000ff'
  },

  // Datetimes (e.g., @2023-01-01, timestamps)
  {
    tag: t.special(t.literal), // Using special literal for datetimes
    color: '#098658'
  },

  // Comments (block, line, tags)
  {
    tag: [t.comment, t.docComment],
    color: '#008000'
  },

  // SQL blocks (within triple quotes)
  {
    tag: t.meta, // Using meta for embedded SQL
    color: '#383a42'
  },

  // Punctuation (e.g., braces, parentheses, commas)
  {
    tag: [t.punctuation, t.brace, t.paren, t.separator],
    color: '#383a42'
  },

  // Operators (e.g., =, !)
  {
    tag: [t.operator],
    color: '#383a42'
  },

  // Tags (e.g., #, ## for annotations)
  {
    tag: t.annotation,
    color: '#008000'
  },

  // Invalid syntax
  {
    tag: t.invalid,
    color: '#e45649'
  }
];

export function malloyLightInit(options?: Partial<CreateThemeOptions>) {
  const { theme = 'light', settings = {}, styles = [] } = options || {};

  return createTheme({
    theme: theme,
    settings: {
      ...defaultSettingsMalloyLight,
      ...settings
    },
    styles: [...malloyLightStyle, ...styles]
  });
}

export const MALLOY_LIGHT_THEME = malloyLightInit({
  settings: {
    lineHighlight: '#f3f4f6'
  }
});

export const MALLOY_LIGHT_THEME_EXTRA: Extension =
  createThemeExtra(MALLOY_LIGHT_THEME);

export const MALLOY_LIGHT_THEME_EXTRA_MOD: Extension = createThemeExtraMod(
  MALLOY_LIGHT_THEME_EXTRA
);

// Map TextMate scopes to CodeMirror theme styles
const scopeToStyle = {
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
        // const response = await fetch('/assets/malloy.tmGrammar.json');
        // const rawGrammar = await response.text();
        let rawGrammar = JSON.stringify(MALLOY_GRAMMAR);
        // console.log(rawGrammar);

        return parseRawGrammar(rawGrammar, 'malloy.tmGrammar.json');
      }
      console.log(`Unknown scope name: ${scopeName}`);
      return null;
    }
  });

  const grammar = await registry.loadGrammar('source.malloy');

  if (!grammar) throw new Error('Failed to load Malloy grammar');

  console.log('grammar');
  console.log(grammar);

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

      if (!token) {
        stream.skipToEnd();
        return null;
      }

      stream.pos = token.endIndex;

      let scope = token.scopes[token.scopes.length - 1];

      for (let [textMateScope, cmStyle] of Object.entries(scopeToStyle)) {
        if (scope.includes(textMateScope)) {
          return cmStyle;
        }
      }

      return null;
    }
  };

  return StreamLanguage.define(malloyStreamParser);
}
