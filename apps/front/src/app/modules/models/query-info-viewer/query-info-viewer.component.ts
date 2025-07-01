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
import { Compartment, Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, take, tap } from 'rxjs/operators';
import {
  MALLOY_LIGHT_THEME_EXTRA_MOD,
  createMalloyLanguage
} from '~front/app/constants/code-themes/malloy-light-theme';
import { VS_LIGHT_THEME_EXTRA_MOD } from '~front/app/constants/code-themes/vs-light-theme';
import { ChartQuery } from '~front/app/queries/chart.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
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
  modelFilePath: string;

  isEditorOptionsInitComplete = false;

  extensions: Extension[] = [];

  languages: LanguageDescription[] = [];
  lang: string;

  theme: Extension = VS_LIGHT_THEME_EXTRA_MOD;

  prevModelFilePath: string;

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
    private structQuery: StructQuery,
    private chartQuery: ChartQuery,
    private repoQuery: RepoQuery,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService
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
      extensions: ['.malloy', '.malloysql', '.malloynb'],
      load: async () => {
        return ls;
      }
    });

    this.languages = [...languageData.languages, malloyLanguageDescription];

    let originalLanguageConf = new Compartment();

    this.extensions = [keymap.of(standardKeymap), originalLanguageConf.of(ls)];

    this.checkContent();

    this.isEditorOptionsInitComplete = true;
  }

  checkContent() {
    if (common.isUndefined(this.chart) || this.languages.length === 0) {
      return;
    }

    // console.log('checkContent');

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
      ].indexOf(this.queryPart) > -1 &&
      this.prevModelFilePath !== this.modelFilePath
    ) {
      this.prevModelFilePath = this.modelFilePath;

      let nav = this.navQuery.getValue();

      let getFilePayload: apiToBackend.ToBackendGetFileRequestPayload = {
        projectId: nav.projectId,
        isRepoProd: nav.isRepoProd,
        branchId: nav.branchId,
        envId: nav.envId,
        fileNodeId: this.modelFilePath,
        panel: common.PanelEnum.Tree
      };

      this.isShowSpinner = true;

      this.spinner.show(this.spinnerName);

      this.apiService
        .req({
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetFile,
          payload: getFilePayload,
          showSpinner: false
        })
        .pipe(
          tap((resp: apiToBackend.ToBackendGetFileResponse) => {
            if (
              resp.info?.status === common.ResponseInfoStatusEnum.Ok &&
              [
                common.QueryPartEnum.MalloySource,
                common.QueryPartEnum.YamlStore,
                common.QueryPartEnum.YamlModel
              ].indexOf(this.queryPart) > -1
            ) {
              let repoState = this.repoQuery.getValue();

              // biome-ignore format: theme breaks
              let newRepoState: RepoState = Object.assign(resp.payload.repo, <RepoState>{
                conflicts: repoState.conflicts, // getFile does not check for conflicts
                repoStatus: repoState.repoStatus // getFile does not use git fetch
              });
              this.repoQuery.update(newRepoState);
              this.structQuery.update(resp.payload.struct);
              this.navQuery.updatePart({
                needValidate: resp.payload.needValidate
              });

              this.content = resp.payload.content;
            }
          }),
          take(1),
          finalize(() => {
            this.spinner.hide(this.spinnerName);
            this.isShowSpinner = false;

            this.cd.detectChanges();
          })
        )
        .subscribe();
    }

    if (
      [
        common.QueryPartEnum.MalloySource,
        common.QueryPartEnum.YamlStore,
        common.QueryPartEnum.YamlModel
      ].indexOf(this.queryPart) < 0
    ) {
      this.prevModelFilePath = undefined;
    }
  }
}
