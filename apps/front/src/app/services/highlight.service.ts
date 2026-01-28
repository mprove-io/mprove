import { EventEmitter, Injectable } from '@angular/core';
import {
  LanguageDescription,
  LanguageSupport,
  StreamLanguage
} from '@codemirror/language';
import * as languageData from '@codemirror/language-data';
import { throttle } from 'throttle-debounce';
import {
  LIGHT_PLUS_COLOR_TO_TAG,
  LIGHT_PLUS_CUSTOM_TAGS
} from '#common/constants/code-themes/light-plus-tags';
import { LIGHT_PLUS_LANGUAGES } from '#common/constants/top-front';
import { getWorkerCode } from '../functions/get-worker-code';
import { UiQuery } from '../queries/ui.query';

interface FullToken {
  text: string;
  scope: string;
  startIndex: number;
  endIndex: number;
  line: number;
  color: string;
}

interface Place {
  controlDocText?: string;
  controlShikiLanguage?: string;
  controlShikiTheme?: string;
  docText?: string;
  shikiLanguage?: string;
  shikiTheme?: string;
  fullHtml?: string;
  fullTokenLines?: any[];
  fullTokens?: FullToken[];
}

interface WorkerTaskOptions {
  type: string;
  placeName: string;
  input: string;
  shikiLanguage: string;
  shikiTheme: string;
}

export enum PlaceNameEnum {
  Main = 'Main',
  Original = 'Original',
  Right = 'Right',
  QueryInfo = 'QueryInfo'
}

@Injectable({ providedIn: 'root' })
export class HighLightService {
  worker: Worker;

  workerTaskCompleted = new EventEmitter<{ placeName: PlaceNameEnum }>();

  mainEditorPlace: Place = {};
  originalEditorPlace: Place = {};
  rightEditorPlace: Place = {};
  queryInfoPlace: Place = {};

  throttleWorkerPostMessage = throttle(
    300,
    (workerTaskOptions: WorkerTaskOptions) =>
      this.worker.postMessage(workerTaskOptions),
    {
      debounceMode: false
    }
  );

  constructor(private uiQuery: UiQuery) {
    let workerCode = getWorkerCode({
      assetsPrefix: `${window.location.protocol}//${window.location.host}`
    });

    this.worker = new Worker(
      URL.createObjectURL(
        new Blob([workerCode], { type: 'application/javascript' })
      )
    );

    this.worker.onmessage = this.handleWorkerMessage.bind(this);

    let sMessage = { type: 'initHighlighter' };

    this.worker.postMessage(sMessage);
  }

  getLanguages(item: { placeName: PlaceNameEnum }) {
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
    isThrottle: boolean;
  }) {
    let { docText, shikiLanguage, shikiTheme, placeName, isThrottle } = item;

    let place = this.getPlaceByPlaceName(placeName);

    if (this.uiQuery.getValue().isHighlighterReady === false) {
      // console.log(`updateDocText - ${placeName} - highlighter is not ready`);
      return;
    }

    // if (isFilter === true) {
    //   // place.docText = docText;
    //   // place.shikiLanguage = shikiLanguage;
    //   // place.shikiTheme = shikiTheme;
    //   // place.fullHtml = undefined;
    //   // place.fullTokenLines = [];
    //   // place.fullTokens = [];
    // }

    if (
      place.controlDocText === docText &&
      place.controlShikiLanguage === shikiLanguage &&
      place.controlShikiTheme === shikiTheme
    ) {
      // console.log(`updateDocText - ${placeName} - skip highlight - no changes`);
      return;
    } else if (LIGHT_PLUS_LANGUAGES.indexOf(shikiLanguage) < 0) {
      // console.log(
      //   `updateDocText - ${placeName} - LIGHT_PLUS_LANGUAGES.indexOf(shikiLanguage) < 0`
      // );

      place.controlDocText = docText;
      place.controlShikiLanguage = shikiLanguage;
      place.controlShikiTheme = shikiTheme;
      //
      place.docText = docText;
      place.shikiLanguage = shikiLanguage;
      place.shikiTheme = shikiTheme;
      place.fullHtml = undefined;
      place.fullTokenLines = [];
      place.fullTokens = [];
    } else {
      place.controlDocText = docText;
      place.controlShikiLanguage = shikiLanguage;
      place.controlShikiTheme = shikiTheme;

      let workerTaskOptions: WorkerTaskOptions = {
        type: 'highlight',
        placeName: placeName,
        input: docText,
        shikiLanguage: shikiLanguage,
        shikiTheme: shikiTheme
      };

      if (isThrottle === false) {
        // console.log(`updateDocText - ${placeName} - workerPostMessage`);
        this.worker.postMessage(workerTaskOptions);
      } else {
        // console.log(`updateDocText - ${placeName} - throttleWorkerPostMessage`);
        this.throttleWorkerPostMessage(workerTaskOptions);
      }
    }
  }

  handleWorkerMessage(wMessage: MessageEvent) {
    if (wMessage.data.type === 'initHighlighterCompleted') {
      // console.log('initHighlighterCompleted');
      this.uiQuery.updatePart({ isHighlighterReady: true });
    } else if (wMessage.data.type === 'highlightResult') {
      // console.log('highlightResult - wMessage.data');
      // console.log(wMessage.data);

      let place = this.getPlaceByPlaceName(wMessage.data.placeName);

      place.docText = wMessage.data.docText;
      place.shikiLanguage = wMessage.data.shikiLanguage;
      place.shikiTheme = wMessage.data.shikiTheme;

      place.fullHtml = wMessage.data.html;
      place.fullTokenLines = wMessage.data.tokenLines;
      place.fullTokens = wMessage.data.tokens;

      this.workerTaskCompleted.emit({ placeName: wMessage.data.placeName });
    }
  }

  createLightLanguage(item: { placeName: PlaceNameEnum }) {
    let { placeName } = item;

    // console.log('createLightLanguage, placeName: ', placeName);

    let place = this.getPlaceByPlaceName(placeName);

    let lightStreamParser = {
      startState: () => ({
        lineNumber: 0
      }),
      tokenTable: LIGHT_PLUS_CUSTOM_TAGS,
      token(stream: any, state: any): string | null {
        if (!place?.fullTokens || place.fullTokens.length === 0) {
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
