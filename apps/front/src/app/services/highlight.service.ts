import { Injectable } from '@angular/core';
import { LanguageDescription, LanguageSupport } from '@codemirror/language';
import * as languageData from '@codemirror/language-data';
import * as shiki from 'shiki';
import { MALLOY_GRAMMAR } from '../constants/code-themes/grammars/malloy-grammar';
import { MALLOY_SQL_GRAMMAR } from '../constants/code-themes/grammars/malloy-sql-grammar';
import { createLightLanguage } from '../constants/code-themes/languages/create-light-language';
import { LIGHT_PLUS_LANGUAGES } from '../constants/top';
import { UiQuery } from '../queries/ui.query';

let malloyTMGrammar = MALLOY_GRAMMAR;

let malloySQLTMGrammar = MALLOY_SQL_GRAMMAR;

malloySQLTMGrammar.repository['malloysql-sql'].patterns = [
  malloySQLTMGrammar.repository['malloysql-sql'].patterns[0],
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
  // {
  //   begin: '>>>sql',
  //   end: '(?=>>>)',
  //   endCaptures: null,
  //   beginCaptures: {
  //     '0': { name: 'entity.other.attribute.malloy-sql' },
  //   },
  //   name: 'meta.embedded.block.malloysql.sql',
  //   patterns: [{ include: 'source.malloy-sql' }]
  // },
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
  ...malloySQLTMGrammar.repository['malloysql-sql'].patterns.filter(
    (x, index) => index !== 0
  )
];

let malloySqlTMGrammarExtended = malloySQLTMGrammar;

let malloyDocsTMGrammar = {
  ...malloyTMGrammar,
  patterns: [...malloyTMGrammar.patterns, { include: '#docvar' }],
  repository: {
    ...malloyTMGrammar.repository,
    docvar: {
      patterns: [
        {
          match: '\\<\\<[^(\\>\\>)]*\\>\\>',
          beginCaptures: {
            0: { name: 'punctuation.definition.comment.begin' }
          },
          endCaptures: {
            0: { name: 'punctuation.definition.comment.end' }
          },
          name: 'markup.italic.markdown'
        }
      ]
    }
  }
};

@Injectable({ providedIn: 'root' })
export class HighLightService {
  languages: LanguageDescription[] = [];

  constructor(private uiQuery: UiQuery) {
    this.initHighlighter();
  }

  async initHighlighter() {
    console.log('initHighlighter');

    let start = Date.now();
    let highlighter = await this.getHL();
    console.log(`initHighlighter time, ms: ${Date.now() - start}`);

    this.uiQuery.updatePart({ highlighter: highlighter });
  }

  async getHL() {
    let startFetchOnig = Date.now();
    const response = await fetch('/assets/vscode-oniguruma/onig.wasm');
    console.log(`fetch onig time, ms: ${Date.now() - startFetchOnig}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch onig.wasm: ${response.statusText}`);
    }
    shiki.setCDN('/assets');

    let startArrayBuffer = Date.now();
    const buffer = await response.arrayBuffer();
    console.log(`arrayBuffer time, ms: ${Date.now() - startArrayBuffer}`);

    shiki.setWasm(buffer);

    let startShiki = Date.now();
    let hl = await shiki.getHighlighter({
      theme: 'light-plus-extended',
      paths: {
        themes: '/shiki/themes/',
        languages: '/shiki/languages/'
      } as any,
      langs: [
        'markdown',
        'sql',
        {
          id: 'malloy',
          scopeName: 'source.malloy',
          embeddedLangs: ['sql'],
          grammar: malloyTMGrammar as any
        },
        {
          id: 'malloysql',
          scopeName: 'source.malloy-sql',
          embeddedLangs: ['sql'],
          grammar: malloySqlTMGrammarExtended as any
        }
      ]
    });
    console.log(`startShiki time, ms: ${Date.now() - startShiki}`);

    let startInitLanguages = Date.now();
    this.initLanguages(hl);
    console.log(`initLanguages time, ms: ${Date.now() - startInitLanguages}`);

    return hl;
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
      malloysqlLanguageDescription
    ];
  }

  getLanguages() {
    return this.languages;
  }
}

// export function highlight(
//   highlighter: any,
//   code: string,
//   lang: string,
//   { inline }: { inline?: boolean } = {}
// ): string {
//   // const highlighter = await HIGHLIGHTER;
//   if (!highlighter.getLoadedLanguages().includes(lang as any)) {
//     // as shiki.Lang
//     lang = 'txt';
//   }
//   const highlightedRaw = highlighter.codeToHtml(code, { lang });

//   // In docs, the highlighter recognizes <<foo>> as a way to make
//   // "foo" look like a meta-variable. Here we remove the << and >>
//   const removeDocVarEnclosing = highlightedRaw.replace(
//     /(>)(&lt;&lt;)(.*?)(&gt;&gt;)(<)/g,
//     '$1$3$5'
//   );
//   if (inline) {
//     return removeDocVarEnclosing
//       .replace(/^<pre class="shiki"/, `<code class="language-${lang}"`)
//       .replace('<code>', '')
//       .replace(/<\/pre>$/, '')
//       .replace('background-color: #FFFFFF', 'background-color: #FBFBFB');
//   } else {
//     return removeDocVarEnclosing
//       .replace(/^<pre class="shiki"/, `<pre class="language-${lang}"`)
//       .replace('<code>', '')
//       .replace(/<\/code><\/pre>$/, '</pre>')
//       .replace('background-color: #FFFFFF', 'background-color: #FBFBFB');
//   }
// }
