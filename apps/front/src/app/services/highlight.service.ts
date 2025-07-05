import { Injectable } from '@angular/core';
import * as shiki from 'shiki';
import { MALLOY_GRAMMAR } from '../constants/code-themes/grammars/malloy-grammar';
import { MALLOY_SQL_GRAMMAR } from '../constants/code-themes/grammars/malloy-sql-grammar';
import { UiQuery } from '../queries/ui.query';

let malloyTMGrammar = MALLOY_GRAMMAR;

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

let malloySQLTMGrammar = MALLOY_SQL_GRAMMAR;

@Injectable({ providedIn: 'root' })
export class HighLightService {
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
        'sql',
        'json',
        'typescript',
        {
          id: 'malloy',
          scopeName: 'source.malloy',
          embeddedLangs: ['sql'],
          grammar: malloyDocsTMGrammar as any
        },
        {
          id: 'malloysql',
          scopeName: 'source.malloy-sql',
          embeddedLangs: ['sql'],
          grammar: malloySQLTMGrammar as any
        }
      ]
    });
    console.log(`startShiki time, ms: ${Date.now() - startShiki}`);

    return hl;
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
