import { Injectable } from '@angular/core';
import {
  LanguageDescription,
  LanguageSupport,
  StreamLanguage
} from '@codemirror/language';
import * as languageData from '@codemirror/language-data';
import * as shiki from 'shiki';
import { MALLOY_GRAMMAR } from '~common/constants/code-themes/grammars/malloy-grammar';
import { MALLOY_NOTEBOOK_GRAMMAR } from '~common/constants/code-themes/grammars/malloy-notebook-grammar';
import { MALLOY_SQL_GRAMMAR } from '~common/constants/code-themes/grammars/malloy-sql-grammar';
import {
  LIGHT_PLUS_COLOR_TO_TAG,
  LIGHT_PLUS_CUSTOM_TAGS
} from '~common/constants/code-themes/light-plus-tags';
import { LIGHT_PLUS_LANGUAGES } from '~common/constants/top-front';
import { makeCopy } from '~common/functions/make-copy';
import { UiQuery } from '../queries/ui.query';

let malloyGrammar = makeCopy(MALLOY_GRAMMAR);
let malloyNotebookGrammar = makeCopy(MALLOY_NOTEBOOK_GRAMMAR);
let malloySqlGrammar = makeCopy(MALLOY_SQL_GRAMMAR);

malloySqlGrammar.repository['malloysql-sql'].patterns = [
  malloySqlGrammar.repository['malloysql-sql'].patterns[0],
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
  ...malloySqlGrammar.repository['malloysql-sql'].patterns.filter(
    (x, index) => index !== 0
  )
];

malloyNotebookGrammar.patterns = [
  malloyNotebookGrammar.patterns[0],
  {
    begin: '>>>markdown',
    end: '(?=>>>)',
    beginCaptures: {
      '0': { name: 'entity.other.attribute.markdown' }
    },
    name: 'meta.embedded.block.markdown',
    patterns: [{ include: 'text.html.markdown' }]
  } as any,
  ...malloyNotebookGrammar.patterns.filter((x, index) => index !== 0)
];

interface FullToken {
  text: string;
  scope: string;
  startIndex: number;
  endIndex: number;
  line: number;
  color: string;
}

interface Place {
  docText?: string;
  shikiLanguage?: string;
  shikiTheme?: string;
  fullHtml?: string;
  fullTokenLines?: any[];
  fullTokens?: FullToken[];
}

export enum PlaceNameEnum {
  Main = 'Main',
  Original = 'Original',
  Right = 'Right',
  QueryInfo = 'QueryInfo'
}

@Injectable({ providedIn: 'root' })
export class HighLightService {
  highlighter: any;

  mainEditorPlace: Place = {};
  originalEditorPlace: Place = {};
  rightEditorPlace: Place = {};
  queryInfoPlace: Place = {};

  constructor(private uiQuery: UiQuery) {
    this.initHighlighter();
  }

  async initHighlighter() {
    // console.log('initHighlighter');
    let startInitHighlighter = Date.now();

    let startFetchOnig = Date.now();
    const response = await fetch('/assets/vscode-oniguruma/onig.wasm');
    // console.log(`fetch onig.wasm time, ms: ${Date.now() - startFetchOnig}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch onig.wasm: ${response.statusText}`);
    }

    shiki.setCDN('/assets');

    let startArrayBuffer = Date.now();
    const buffer = await response.arrayBuffer();
    // console.log(`arrayBuffer time, ms: ${Date.now() - startArrayBuffer}`);

    shiki.setWasm(buffer);

    let startGetHighlighter = Date.now();
    this.highlighter = await shiki.getHighlighter({
      theme: 'light-plus-extended',
      paths: {
        themes: '/shiki/themes/',
        languages: '/shiki/languages/'
      } as any,
      langs: [
        'sql',
        'markdown',
        {
          id: 'malloy',
          scopeName: 'source.malloy',
          grammar: malloyGrammar as any
        },
        {
          id: 'malloysql',
          scopeName: 'source.malloy-sql',
          grammar: malloySqlGrammar as any
        },
        {
          id: 'malloynb',
          scopeName: 'source.malloy-notebook',
          grammar: malloyNotebookGrammar as any
        }
      ]
    });
    // console.log(`getHighlighter time, ms: ${Date.now() - startGetHighlighter}`);

    // console.log(
    //   `initHighlighter time, ms: ${Date.now() - startInitHighlighter}`
    // );

    this.uiQuery.updatePart({ isHighlighterReady: true });
  }

  getLanguages(item: {
    placeName: PlaceNameEnum;
  }) {
    let { placeName } = item;

    let lightLanguage = this.createLightLanguage({ placeName: placeName });

    let malloyLanguageDescription = LanguageDescription.of({
      name: 'malloy',
      alias: ['malloy'],
      extensions: ['malloy'],
      support: new LanguageSupport(lightLanguage)
    });

    let malloysqlLanguageDescription = LanguageDescription.of({
      name: 'malloysql',
      alias: ['malloysql'],
      extensions: ['malloysql'],
      support: new LanguageSupport(lightLanguage)
    });

    let malloynbLanguageDescription = LanguageDescription.of({
      name: 'malloynb',
      alias: ['malloynb'],
      extensions: ['malloynb'],
      support: new LanguageSupport(lightLanguage)
    });

    let markdownLanguageDescription = LanguageDescription.of({
      name: 'markdown',
      alias: ['markdown'],
      extensions: ['markdown'],
      support: new LanguageSupport(lightLanguage)
    });

    let sqlLanguageDescription = LanguageDescription.of({
      name: 'sql',
      alias: ['sql'],
      extensions: ['sql'],
      support: new LanguageSupport(lightLanguage)
    });

    let languages = [
      ...languageData.languages.filter(
        language =>
          LIGHT_PLUS_LANGUAGES.map(name => name.toLowerCase()).indexOf(
            language.name.toLocaleLowerCase()
          ) < 0
      ),
      malloyLanguageDescription,
      malloysqlLanguageDescription,
      malloynbLanguageDescription,
      markdownLanguageDescription,
      sqlLanguageDescription
    ];

    return { languages: languages, lightLanguage: lightLanguage };
  }

  getPlaceByPlaceName(placeName: PlaceNameEnum) {
    let place =
      placeName === PlaceNameEnum.Main
        ? this.mainEditorPlace
        : placeName === PlaceNameEnum.Original
          ? this.originalEditorPlace
          : placeName === PlaceNameEnum.Right
            ? this.rightEditorPlace
            : placeName === PlaceNameEnum.QueryInfo
              ? this.queryInfoPlace
              : undefined;
    return place;
  }

  updateDocText(item: {
    placeName: PlaceNameEnum;
    docText: string;
    shikiLanguage: string;
    shikiTheme: string;
    isFilter?: boolean;
  }) {
    let { docText, shikiLanguage, shikiTheme, placeName, isFilter } = item;

    let place = this.getPlaceByPlaceName(placeName);

    if (!this.highlighter) {
      // console.log(`updateDocText - ${placeName} - highlighter undefined`);
      return;
    }

    if (isFilter === true) {
      // console.log(`updateDocText - ${placeName} - Filter`);

      place.docText = docText;
      place.shikiLanguage = shikiLanguage;
      place.shikiTheme = shikiTheme;
      place.fullHtml = undefined;
      place.fullTokenLines = [];
      place.fullTokens = [];
    } else if (LIGHT_PLUS_LANGUAGES.indexOf(shikiLanguage) < 0) {
      // console.log(`updateDocText - ${placeName} - Reset`);

      place.docText = docText;
      place.shikiLanguage = shikiLanguage;
      place.shikiTheme = shikiTheme;
      place.fullHtml = undefined;
      place.fullTokenLines = [];
      place.fullTokens = [];
    } else if (
      place.docText !== docText ||
      place.shikiLanguage !== shikiLanguage ||
      place.shikiTheme !== shikiTheme
    ) {
      // console.log('updateDocText - parse full document');

      place.docText = docText;
      place.shikiLanguage = shikiLanguage;
      place.shikiTheme = shikiTheme;

      let startParseShikiTokens = Date.now();
      let fullResult = this.parseShikiTokens({
        input: place.docText,
        shikiLanguage: shikiLanguage,
        shikiTheme: shikiTheme
      });
      // console.log('parseShikiTokens: ', Date.now() - startParseShikiTokens);

      place.fullHtml = fullResult.html;
      place.fullTokenLines = fullResult.tokenLines;
      place.fullTokens = fullResult.tokens;
    }
  }

  parseShikiTokens(item: {
    input: string;
    shikiLanguage: string;
    shikiTheme: string;
  }) {
    let { input, shikiLanguage, shikiTheme } = item;

    let html;
    let tokenLines;

    if (!this.highlighter.getLoadedLanguages().includes(shikiLanguage as any)) {
      // console.log('parseShikiTokens - unknown language');
    } else {
      tokenLines = this.highlighter
        .codeToThemedTokens(input, shikiLanguage, shikiTheme, {
          includeExplanation: true
        })
        .filter((x: any) => x.length > 0);
    }

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

  createLightLanguage(item: { placeName: PlaceNameEnum }) {
    let { placeName } = item;

    // console.log('createLightLanguage, placeName: ', placeName);

    // if (!this.highlighter) {
    // console.log('createLightLanguage - highlighter undefined');
    // }

    let place = this.getPlaceByPlaceName(placeName);

    let lightStreamParser = {
      startState: () => ({
        lineNumber: 0
      }),
      tokenTable: LIGHT_PLUS_CUSTOM_TAGS,
      token(stream: any, state: any): string | null {
        if (place.fullTokens.length === 0) {
          stream.skipToEnd();
          return null;
        }

        if (stream.eol()) {
          // console.log(
          //   'EOL reached, line:',
          //   stream.string,
          //   'lineNumber:',
          //   state.lineNumber
          // );
          return null;
        }

        let line = stream.string;

        if (!line) {
          // console.log('No line', state.lineNumber);
          stream.skipToEnd();
          return null;
        }

        let lineTokens = place.fullTokens.filter(
          t => t.line === state.lineNumber
        );

        if (lineTokens.length === 0) {
          // console.log('No tokens for line', state.lineNumber);
          // console.log('stream.pos');
          // console.log(stream.pos);
          // console.log('line');
          // console.log(line);
          stream.skipToEnd();
          return null;
        }

        let tokenIndex: number = lineTokens.findIndex(
          t => stream.pos >= t.startIndex && stream.pos < t.endIndex
        );

        if (tokenIndex < 0) {
          // console.log(
          //   'No token found at stream position',
          //   stream.pos,
          //   'line:',
          //   line,
          //   'lineNumber:',
          //   state.lineNumber,
          //   'tokens:',
          //   lineTokens
          // );
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

          // if (isUndefined(tagName)) {
          // console.log('UNDEF tagName');
          // console.log('token.color');
          // console.log(token.color);
          // }

          let cmStyle: any = tagName;

          return cmStyle;
        }

        // console.log(
        //   'No style found for SCOPE: ',
        //   token.scope,
        //   'TEXT: ',
        //   token.text,
        //   'LINE: ',
        //   line
        // );
        return null;
      }
    };

    return StreamLanguage.define(lightStreamParser);
  }
}
