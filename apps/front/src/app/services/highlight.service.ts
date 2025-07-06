import { Injectable } from '@angular/core';
import { LanguageDescription, LanguageSupport } from '@codemirror/language';
import * as languageData from '@codemirror/language-data';
import * as shiki from 'shiki';
import { common } from '~front/barrels/common';
import { MALLOY_GRAMMAR } from '../constants/code-themes/grammars/malloy-grammar';
import { MALLOY_NOTEBOOK_GRAMMAR } from '../constants/code-themes/grammars/malloy-notebook-grammar';
import { MALLOY_SQL_GRAMMAR } from '../constants/code-themes/grammars/malloy-sql-grammar';
import { createLightLanguage } from '../constants/code-themes/languages/create-light-language';
import { LIGHT_PLUS_LANGUAGES } from '../constants/top';
import { UiQuery } from '../queries/ui.query';

let malloyGrammar = common.makeCopy(MALLOY_GRAMMAR);
let malloyNotebookGrammar = common.makeCopy(MALLOY_NOTEBOOK_GRAMMAR);
let malloySqlGrammar = common.makeCopy(MALLOY_SQL_GRAMMAR);

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

@Injectable({ providedIn: 'root' })
export class HighLightService {
  languages: LanguageDescription[] = [];

  constructor(private uiQuery: UiQuery) {
    this.initHighlighter();
  }

  async initHighlighter() {
    console.log('initHighlighter');
    let startInitHighlighter = Date.now();

    let startFetchOnig = Date.now();
    const response = await fetch('/assets/vscode-oniguruma/onig.wasm');
    console.log(`fetch onig.wasm time, ms: ${Date.now() - startFetchOnig}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch onig.wasm: ${response.statusText}`);
    }

    shiki.setCDN('/assets');

    let startArrayBuffer = Date.now();
    const buffer = await response.arrayBuffer();
    console.log(`arrayBuffer time, ms: ${Date.now() - startArrayBuffer}`);

    shiki.setWasm(buffer);

    let startGetHighlighter = Date.now();
    let hl = await shiki.getHighlighter({
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
    console.log(`getHighlighter time, ms: ${Date.now() - startGetHighlighter}`);

    let startInitLanguages = Date.now();
    this.initLanguages(hl);
    console.log(`initLanguages time, ms: ${Date.now() - startInitLanguages}`);

    console.log(
      `initHighlighter time, ms: ${Date.now() - startInitHighlighter}`
    );

    this.uiQuery.updatePart({ highlighter: hl });
  }

  initLanguages(highlighter: any) {
    let lightLanguage = createLightLanguage(highlighter);

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

    this.languages = [
      ...languageData.languages.filter(
        language =>
          LIGHT_PLUS_LANGUAGES.map(name => name.toLowerCase()).indexOf(
            language.name.toLocaleLowerCase()
          ) < 0
      ),
      markdownLanguageDescription,
      sqlLanguageDescription,
      malloyLanguageDescription,
      malloysqlLanguageDescription,
      malloynbLanguageDescription
    ];
  }

  getLanguages() {
    return this.languages;
  }
}
