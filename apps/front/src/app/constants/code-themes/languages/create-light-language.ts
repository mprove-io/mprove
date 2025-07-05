import { StreamLanguage } from '@codemirror/language';
import { common } from '~front/barrels/common';
import {
  LIGHT_PLUS_COLOR_TO_TAG,
  LIGHT_PLUS_CUSTOM_TAGS
} from '../light-plus-tags';

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

export function createLightLanguage(item: { highlighter: any }) {
  let { highlighter } = item;

  console.log('createLightLanguage');

  if (!highlighter) {
    console.log('createLightLanguage - highlighter undefined');
  }

  let lightStreamParser = {
    startState: () => ({
      lineNumber: 0
    }),
    tokenTable: LIGHT_PLUS_CUSTOM_TAGS,
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

      stream.pos = nextStreamPos;

      if (token.color) {
        let tagName: string = LIGHT_PLUS_COLOR_TO_TAG[token.color];

        if (common.isUndefined(tagName)) {
          console.log('UNDEF tagName');
          console.log('token.color');
          console.log(token.color);
        }

        let cmStyle: any = tagName;

        // console.log('cmStyle');
        // console.log(cmStyle);

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

  return StreamLanguage.define(lightStreamParser);
}

export function updateDocText(item: {
  docText: string;
  highlighter: any;
  shikiLanguage: string;
  shikiTheme: string;
}) {
  let { docText, highlighter, shikiLanguage, shikiTheme } = item;

  console.log('updateDocText');

  if (!highlighter) {
    console.log('updateDocText - highlighter undefined');
    return;
  }

  if (docText !== fullDocument) {
    console.log('updateDocText - parse full document');

    fullDocument = docText;

    console.log('shikiLanguage');
    console.log(shikiLanguage);
    console.log('shikiTheme');
    console.log(shikiTheme);
    console.log('!!highlighter');
    console.log(!!highlighter);
    console.log('fullDocument');
    console.log(fullDocument);

    let fullResult = parseShikiTokens({
      input: fullDocument,
      shikiLanguage: shikiLanguage,
      shikiTheme: shikiTheme,
      highlighter: highlighter
    });

    fullHtml = fullResult.html;
    fullTokenLines = fullResult.tokenLines;
    fullTokens = fullResult.tokens;

    // console.log('fullHtml');
    // console.log(fullHtml);

    // console.log('fullTokenLines');
    // console.log(fullTokenLines);

    // console.log('fullTokens');
    // console.log(fullTokens);
  }
}

function parseShikiTokens(item: {
  input: string;
  highlighter: any;
  shikiLanguage: string;
  shikiTheme: string;
}) {
  let { input, highlighter, shikiLanguage, shikiTheme } = item;

  if (!highlighter.getLoadedLanguages().includes(shikiLanguage as any)) {
    console.log('parseShikiTokens - unknown language');
    shikiLanguage = 'text';
  }

  let startCodeToHtml = Date.now();
  let html = highlighter.codeToHtml(input, shikiLanguage, shikiTheme);
  console.log('startCodeToHtml: ', Date.now() - startCodeToHtml);

  let tokenLines = highlighter
    .codeToThemedTokens(input, shikiLanguage, shikiTheme, {
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
      // if (tItem.explanation.length > 1) {
      // console.log('tItem.explanation');
      // console.log(tItem.explanation);
      // }

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
