import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { standardKeymap } from '@codemirror/commands';
import { LanguageDescription, LanguageSupport } from '@codemirror/language';
import * as languageData from '@codemirror/language-data';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { tap } from 'rxjs/operators';
import { createMalloyLanguage } from '~front/app/constants/code-themes/languages/create-malloy-language';
import { MALLOY_LIGHT_THEME_EXTRA_MOD } from '~front/app/constants/code-themes/malloy-light-theme';
import { VS_LIGHT_THEME_EXTRA_MOD } from '~front/app/constants/code-themes/vs-light-theme';
import { ChartQuery } from '~front/app/queries/chart.query';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-query-info-viewer',
  templateUrl: './query-info-viewer.component.html'
})
export class QueryInfoViewerComponent implements OnInit, OnChanges {
  @Input()
  queryPart: common.QueryPartEnum;

  @Input()
  modelFileText: string;

  isEditorOptionsInitComplete = false;

  extensions: Extension[] = [];

  languages: LanguageDescription[] = [];
  lang: string;

  theme: Extension = VS_LIGHT_THEME_EXTRA_MOD;

  spinnerName = 'queryInfoGetFile';
  isShowSpinner = false;

  content: string;

  chart: common.ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;

      if (this.isEditorOptionsInitComplete === true) {
        this.checkContent();
        this.cd.detectChanges();
      }
    })
  );

  constructor(
    private chartQuery: ChartQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initEditorOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      common.isDefined(changes.queryPart) &&
      changes.queryPart.currentValue !== changes.queryPart.previousValue
    ) {
      this.queryPart = changes.queryPart.currentValue;

      if (this.isEditorOptionsInitComplete === true) {
        this.checkContent();
      }
    }
  }

  async initEditorOptions() {
    let malloyLanguage = await createMalloyLanguage();

    let ls = new LanguageSupport(malloyLanguage);

    let malloyLanguageDescription = LanguageDescription.of({
      name: 'Malloy',
      alias: ['malloy'],
      extensions: ['malloy', 'malloysql', 'malloynb'],
      load: async () => {
        return ls;
      }
    });

    this.languages = [...languageData.languages, malloyLanguageDescription];

    // let queryInfoLanguageConf = new Compartment();
    // this.extensions = [keymap.of(standardKeymap), queryInfoLanguageConf.of(ls)];
    this.extensions = [keymap.of(standardKeymap)];

    this.isEditorOptionsInitComplete = true;

    this.checkContent();

    this.cd.detectChanges();
  }

  checkContent() {
    if (
      common.isUndefined(this.chart) ||
      this.isEditorOptionsInitComplete === false
    ) {
      return;
    }

    this.lang =
      this.queryPart === common.QueryPartEnum.SqlMalloy ||
      this.queryPart === common.QueryPartEnum.SqlMain
        ? 'SQL'
        : this.queryPart === common.QueryPartEnum.MalloyCompiledQuery ||
            this.queryPart === common.QueryPartEnum.JsonStoreRequestParts ||
            this.queryPart === common.QueryPartEnum.JsonResults
          ? 'JSON'
          : this.queryPart === common.QueryPartEnum.MalloyQuery ||
              this.queryPart === common.QueryPartEnum.MalloySource
            ? 'Malloy'
            : this.queryPart ===
                common.QueryPartEnum.JavascriptStoreRequestFunction
              ? 'JavaScript'
              : this.queryPart === common.QueryPartEnum.YamlTile ||
                  this.queryPart === common.QueryPartEnum.YamlStore ||
                  this.queryPart === common.QueryPartEnum.YamlModel
                ? 'YAML'
                : undefined;

    this.theme =
      this.queryPart === common.QueryPartEnum.MalloyQuery ||
      this.queryPart === common.QueryPartEnum.MalloySource
        ? MALLOY_LIGHT_THEME_EXTRA_MOD
        : VS_LIGHT_THEME_EXTRA_MOD;

    if (this.queryPart === common.QueryPartEnum.MalloyQuery) {
      this.content = this.chart.tiles[0].mconfig.malloyQuery;
    } else if (this.queryPart === common.QueryPartEnum.MalloyCompiledQuery) {
      let parsed = this.chart.tiles[0].mconfig.compiledQuery;

      this.content = common.isDefined(parsed)
        ? JSON.stringify(parsed, null, 2)
        : '';
    } else if (this.queryPart === common.QueryPartEnum.JsonResults) {
      let parsed = this.chart.tiles[0].query.data;

      this.content = common.isDefined(parsed)
        ? JSON.stringify(parsed, null, 2)
        : '';
    } else if (
      this.queryPart === common.QueryPartEnum.SqlMalloy ||
      this.queryPart === common.QueryPartEnum.SqlMain
    ) {
      this.content = this.chart.tiles[0].query.sql;
    } else if (
      this.queryPart === common.QueryPartEnum.JavascriptStoreRequestFunction
    ) {
      this.content = `// Function to make Request urlPath and body
${this.chart.tiles[0].mconfig.storePart?.reqFunction}`;
    } else if (this.queryPart === common.QueryPartEnum.JsonStoreRequestParts) {
      try {
        let jsonParts = this.chart.tiles[0].mconfig.storePart?.reqJsonParts;

        if (common.isDefined(jsonParts)) {
          let parsed = JSON.parse(jsonParts);
          this.content = JSON.stringify(parsed, null, 2);
        } else {
          this.content = '';
        }
      } catch (error: any) {
        this.content = 'Invalid JSON: ' + error.message;
      }
    } else if (this.queryPart === common.QueryPartEnum.YamlTile) {
      let filePartTile: common.FilePartTile = common.prepareTile({
        isForDashboard: false,
        mconfig: this.chart.tiles[0].mconfig
      });

      this.content = common.toYaml({ tiles: [filePartTile] });
    } else if (
      [
        common.QueryPartEnum.MalloySource,
        common.QueryPartEnum.YamlStore,
        common.QueryPartEnum.YamlModel
      ].indexOf(this.queryPart) > -1
    ) {
      this.content = this.modelFileText;
    }
  }
}
