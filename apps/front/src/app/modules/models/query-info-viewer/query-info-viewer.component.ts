import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { defaultKeymap } from '@codemirror/commands';
import { LanguageDescription } from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  LIGHT_PLUS_THEME_EXTRA_SINGLE_READ,
  VS_LIGHT_THEME_EXTRA_SINGLE_READ
} from '#common/constants/code-themes/themes';
import { LIGHT_PLUS_LANGUAGES } from '#common/constants/top-front';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { prepareTile } from '#common/functions/prepare-tile/prepare-tile';
import { toYaml } from '#common/functions/to-yaml/to-yaml';
import type { ChartX } from '#common/types/backend/parts/chart/chart-x';
import type { FilePartTile } from '#common/types/blockml/parts/internal/file-part-tile';
import type { QueryPart } from '#common/types/front/query-info/query-part';
import { ChartQuery } from '#front/app/queries/chart.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { HighLightService } from '#front/app/services/highlight.service';

@Component({
  standalone: false,
  selector: 'm-query-info-viewer',
  templateUrl: './query-info-viewer.component.html'
})
export class QueryInfoViewerComponent implements OnChanges, OnInit, OnDestroy {
  @Input()
  queryPart: QueryPart;

  @Input()
  modelFileText: string;

  isEditorOptionsInitComplete = false;

  extensions: Extension[] = [];

  languages: LanguageDescription[] = [];
  lang: string;

  theme: Extension = VS_LIGHT_THEME_EXTRA_SINGLE_READ;

  spinnerName = 'queryInfoGetFile';
  isShowSpinner = false;

  content: string;

  chart: ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;

      if (this.isEditorOptionsInitComplete === true) {
        this.checkContent();
        this.cd.detectChanges();
      }
    })
  );

  isHighlighterReady: boolean;
  isHighlighterReady$ = this.uiQuery.select().pipe(
    tap(x => {
      this.isHighlighterReady = x.isHighlighterReady;
      this.cd.detectChanges();

      if (
        this.isHighlighterReady === true &&
        this.isEditorOptionsInitComplete === false
      ) {
        this.initEditorOptions();
      }
    })
  );

  workerTaskCompletedSubscription: Subscription;

  constructor(
    private uiQuery: UiQuery,
    private highLightService: HighLightService,
    private chartQuery: ChartQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.workerTaskCompletedSubscription = new Subscription();

    this.workerTaskCompletedSubscription.add(
      this.highLightService.workerTaskCompleted.subscribe(eventData => {
        if (eventData.placeName === 'QueryInfo') {
          let prevContent = this.content;
          this.content = this.content + ' ';
          this.cd.detectChanges();

          setTimeout(() => {
            this.content = prevContent;
            this.cd.detectChanges();
          }, 0);
        }
      })
    );
  }

  ngOnDestroy() {
    this.workerTaskCompletedSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      isDefined(changes.queryPart) &&
      changes.queryPart.currentValue !== changes.queryPart.previousValue
    ) {
      this.queryPart = changes.queryPart.currentValue;

      if (this.isEditorOptionsInitComplete === true) {
        this.checkContent();
      }
    }
  }

  initEditorOptions() {
    let res = this.highLightService.getLanguages({
      placeName: 'QueryInfo'
    });

    this.languages = res.languages;
    let lightLanguage = res.lightLanguage;

    this.extensions = [
      highlightSelectionMatches(),
      keymap.of([...defaultKeymap, ...searchKeymap])
    ];

    this.isEditorOptionsInitComplete = true;

    this.checkContent();

    this.cd.detectChanges();
  }

  checkContent() {
    if (isUndefined(this.chart) || this.isEditorOptionsInitComplete === false) {
      return;
    }

    this.lang =
      this.queryPart === 'SqlMalloy' || this.queryPart === 'SqlMain'
        ? 'SQL'
        : this.queryPart === 'JsonAppliedGivens' ||
            this.queryPart === 'MalloyCompiledQuery' ||
            this.queryPart === 'JsonStoreRequestParts' ||
            this.queryPart === 'JsonResults'
          ? 'JSON'
          : this.queryPart === 'MalloyQuery' ||
              this.queryPart === 'MalloySource'
            ? 'Malloy'
            : this.queryPart === 'JavascriptStoreRequestFunction'
              ? 'JavaScript'
              : this.queryPart === 'YamlTile' ||
                  this.queryPart === 'YamlStore' ||
                  this.queryPart === 'YamlModel'
                ? 'YAML'
                : undefined;

    this.theme =
      LIGHT_PLUS_LANGUAGES.indexOf(this.lang.toLowerCase()) > -1
        ? LIGHT_PLUS_THEME_EXTRA_SINGLE_READ
        : VS_LIGHT_THEME_EXTRA_SINGLE_READ;

    if (this.queryPart === 'JsonAppliedGivens') {
      let appliedGivens = this.chart.tiles[0].mconfig.appliedGivens;
      this.content = isDefined(appliedGivens)
        ? JSON.stringify(appliedGivens, null, 2)
        : '';
    } else if (this.queryPart === 'MalloyQuery') {
      this.content = this.chart.tiles[0].mconfig.malloyQueryExtra;
    } else if (this.queryPart === 'MalloyCompiledQuery') {
      let parsed = this.chart.tiles[0].mconfig.compiledQuery;
      delete parsed.sql;

      this.content = isDefined(parsed) ? JSON.stringify(parsed, null, 2) : '';
    } else if (this.queryPart === 'JsonResults') {
      let parsed = this.chart.tiles[0].query.data;

      this.content = isDefined(parsed) ? JSON.stringify(parsed, null, 2) : '';
    } else if (this.queryPart === 'SqlMalloy' || this.queryPart === 'SqlMain') {
      this.content = this.chart.tiles[0].query.sql;
    } else if (this.queryPart === 'JavascriptStoreRequestFunction') {
      this.content = `// Function to make Request urlPath and body
${this.chart.tiles[0].mconfig.storePart?.reqFunction}`;
    } else if (this.queryPart === 'JsonStoreRequestParts') {
      try {
        let jsonParts = this.chart.tiles[0].mconfig.storePart?.reqJsonParts;

        if (isDefined(jsonParts)) {
          let parsed = JSON.parse(jsonParts);
          this.content = JSON.stringify(parsed, null, 2);
        } else {
          this.content = '';
        }
      } catch (error: any) {
        this.content = 'Invalid JSON: ' + error.message;
      }
    } else if (this.queryPart === 'YamlTile') {
      let filePartTile: FilePartTile = prepareTile({
        isForDashboard: false,
        mconfig: this.chart.tiles[0].mconfig
      });

      this.content = toYaml({ tiles: [filePartTile] });
    } else if (
      ['MalloySource', 'YamlStore', 'YamlModel'].indexOf(this.queryPart) > -1
    ) {
      this.content = this.modelFileText;
    }

    let docText = this.content ?? '';

    this.highLightService.updateDocText({
      placeName: 'QueryInfo',
      docText: docText,
      shikiLanguage: this.lang.toLowerCase(),
      shikiTheme: 'light-plus-extended',
      isThrottle: false
    });
  }
}
