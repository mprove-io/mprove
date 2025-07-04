import { StreamLanguage } from '@codemirror/language';
import { sqlScopeToStyle } from './create-sql-language';
import { getHL } from './hl';

// TextMate scopes to CodeMirror theme styles
const malloyScopeToStyle = {
  'keyword.control': 'keyword',
  'keyword.control.source': 'keyword',
  'keyword.control.is': 'keyword',
  'keyword.control.run': 'keyword',
  'keyword.control.select': 'keyword',
  'keyword.control.limit': 'keyword',
  'keyword.control.group_by': 'keyword',
  'keyword.control.aggregate': 'keyword',
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
  'string.quoted.single': 'string',
  'string.regexp': 'string',
  comment: 'comment',
  'punctuation.definition.comment': 'comment',
  'comment.line.double-slash': 'comment',
  'comment.line.double-dash.sql': 'comment',
  punctuation: 'punctuation',
  'keyword.operator': 'operator',
  'keyword.operator.arrow': 'operator',
  'source.malloy': 'punctuation',
  'source.malloy-in-sql': 'meta',
  'punctuation.definition.string.begin': 'punctuation',
  'punctuation.definition.string.end': 'punctuation'
};

const sqlScopeToStyleExtended = {
  ...sqlScopeToStyle,
  'source.sql': 'meta',
  'keyword.other.DML.sql': 'keyword',
  'keyword.control.sql': 'keyword',
  'keyword.operator.star.sql': 'operator',
  'keyword.operator.comparison.sql': 'operator',
  'constant.numeric.sql': 'number',
  'variable.other.sql': 'variableName',
  'string.quoted.double.sql': 'string',
  'punctuation.sql-block.open': 'punctuation',
  'punctuation.sql-block.close': 'punctuation',
  'punctuation.definition.string.sql': 'punctuation',
  'punctuation.malloy-in-sql.begin': 'punctuation',
  'punctuation.malloy-in-sql.end': 'punctuation'
};

let highlighter: any = null;
let fullDocument: string | null = null;
let fullHtml: any;
let fullTokenLines: any[] = [];
let fullTokens: {
  text: string;
  scope: string;
  startIndex: number;
  endIndex: number;
  line: number;
  color: string;
}[] = [];

function parseShikiTokens(code: string, hl: any) {
  let lang = 'malloy';

  if (!hl.getLoadedLanguages().includes(lang as any)) {
    lang = 'text';
  }
  let html = hl.codeToHtml(code, lang, 'light-plus');

  let tokenLines = hl
    .codeToThemedTokens(code, lang, 'light-plus', {
      includeExplanation: true
    })
    .filter((x: any) => x.length > 0);

  let tokens: {
    text: string;
    scope: string;
    startIndex: number;
    endIndex: number;
    line: number;
    color: string;
  }[] = [];

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

  return { tokens: tokens, tokenLines: tokenLines, html: html };
}

export async function createMalloyLanguageHL2() {
  if (!highlighter) {
    console.log('createMalloyLanguageHL2 - hl init');
    highlighter = await getHL();
  }

  let malloyStreamParser = {
    startState: () => ({
      lineNumber: 0
    }),

    token(stream: any, state: any): string | null {
      if (stream.eol()) {
        console.log(
          'EOL reached, line:',
          stream.string,
          'lineNumber:',
          state.lineNumber
        );
        return null;
      }

      let line = stream.string;

      if (!line) {
        console.log('No line', state.lineNumber);
        stream.skipToEnd();
        return null;
      }

      let lineTokens = fullTokens.filter(t => t.line === state.lineNumber);

      if (lineTokens.length === 0) {
        console.log('No tokens for line', state.lineNumber);
        console.log('stream.pos');
        console.log(stream.pos);
        console.log('line');
        console.log(line);
        stream.skipToEnd();
        return null;
      }

      let tokenIndex: number = lineTokens.findIndex(
        t => stream.pos >= t.startIndex && stream.pos < t.endIndex
      );

      if (tokenIndex < 0) {
        console.log(
          'No token found at stream position',
          stream.pos,
          'line:',
          line,
          'lineNumber:',
          state.lineNumber,
          'tokens:',
          lineTokens
        );
        stream.skipToEnd();
        return null;
      }

      let token = lineTokens[tokenIndex];

      let nextStreamPos;

      if (token.endIndex >= line.length) {
        state.lineNumber++;
        nextStreamPos = token.endIndex;
      } else {
        nextStreamPos = token.endIndex;
      }

      console.log({
        color: token.color,
        text: token.text,
        tStart: token.startIndex,
        sPos: stream.pos,
        tEnd: token.endIndex,
        nPos: nextStreamPos,
        streamLine: state.lineNumber
      });

      stream.pos = nextStreamPos;

      //   if (token.color) {
      //     console.log('Applying color', token.color, 'for token:', token.text, 'scope:', token.scope);
      //     return `style: "color: ${token.color}"`;
      //   }

      //   console.log('No color found for token:', token.text, 'scope:', token.scope, 'in line:', line);
      //   return null;
      // }

      let styleMap: any = token.scope.includes('sql')
        ? sqlScopeToStyleExtended
        : malloyScopeToStyle;

      let cmStyle = styleMap[token.scope];

      if (cmStyle) {
        // console.log(
        //   'Mapped scope',
        //   token.scope,
        //   'to CodeMirror style:',
        //   cmStyle
        // );
        return cmStyle;
      }

      console.log(
        'No style found for SCOPE: ',
        token.scope,
        'TEXT: ',
        token.text,
        'LINE: ',
        line
      );
      return null;
    }
  };

  return StreamLanguage.define(malloyStreamParser);
}

export async function updateMalloyDocument2(documentText: string) {
  console.log('updateMalloyDocument2');

  if (!highlighter) {
    console.log('updateMalloyDocument2 - hl init');
    highlighter = await getHL();
  }

  if (documentText !== fullDocument && !!highlighter) {
    fullDocument = documentText;

    let fullResult = parseShikiTokens(fullDocument, highlighter);

    fullHtml = fullResult.html;
    fullTokenLines = fullResult.tokenLines;
    fullTokens = fullResult.tokens;

    console.log('fullHtml');
    console.log(fullHtml);

    console.log('fullTokenLines');
    console.log(fullTokenLines);

    console.log('fullTokens');
    console.log(fullTokens);
  }
}
