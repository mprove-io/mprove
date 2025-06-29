import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Extension } from '@codemirror/state';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, take, tap } from 'rxjs/operators';
import { VS_LIGHT_THEME_EXTRA_MOD } from '~front/app/constants/code-themes/vs-light-theme';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

import * as languageData from '@codemirror/language-data';
import { ChartQuery } from '~front/app/queries/chart.query';

@Component({
  standalone: false,
  selector: 'm-query-info-viewer',
  templateUrl: './query-info-viewer.component.html'
})
export class QueryInfoViewerComponent implements OnChanges {
  @Input()
  queryPart: common.QueryPartEnum;

  @Input()
  modelFilePath: string;

  prevModelFilePath: string;

  theme: Extension = VS_LIGHT_THEME_EXTRA_MOD;

  languages = languageData.languages;
  lang: string;

  spinnerName = 'queryInfoGetFile';
  isShowSpinner = false;

  content: string;

  chart: common.ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;

      this.checkContent();
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

  ngOnChanges(changes: SimpleChanges): void {
    if (
      common.isDefined(changes.queryPart) &&
      changes.queryPart.currentValue !== changes.queryPart.previousValue
    ) {
      this.queryPart = changes.queryPart.currentValue;
      this.checkContent();
    }
  }

  setEditorOptionsLanguage() {
    if (common.isUndefined(this.chart.chartId)) {
      return;
    }

    this.lang =
      this.queryPart === common.QueryPartEnum.SqlQuery
        ? 'SQL'
        : this.queryPart === common.QueryPartEnum.MalloyCompiledQuery
          ? 'JSON'
          : this.queryPart === common.QueryPartEnum.MalloyQuery ||
              this.queryPart === common.QueryPartEnum.MalloySource
            ? 'JSON' // TODO: malloy
            : this.queryPart ===
                common.QueryPartEnum.JavascriptStoreRequestFunction
              ? 'JavaScript'
              : this.queryPart === common.QueryPartEnum.JsonStoreRequestParts
                ? 'JSON'
                : this.queryPart === common.QueryPartEnum.YamlTile ||
                    this.queryPart === common.QueryPartEnum.YamlStore ||
                    this.queryPart === common.QueryPartEnum.YamlModel
                  ? 'YAML'
                  : undefined;
  }

  checkContent() {
    if (common.isDefined(this.chart)) {
      if (this.queryPart === common.QueryPartEnum.MalloyQuery) {
        this.content = this.chart.tiles[0].mconfig.malloyQuery;
      } else if (this.queryPart === common.QueryPartEnum.MalloyCompiledQuery) {
        const parsed = this.chart.tiles[0].mconfig.compiledQuery;
        this.content = JSON.stringify(parsed, null, 2);
      } else if (this.queryPart === common.QueryPartEnum.SqlQuery) {
        this.content = this.chart.tiles[0].query.sql;
      } else if (
        this.queryPart === common.QueryPartEnum.JavascriptStoreRequestFunction
      ) {
        this.content = `// Function to make Request urlPath and body
${this.chart.tiles[0].mconfig.storePart?.reqFunction}`;
      } else if (
        this.queryPart === common.QueryPartEnum.JsonStoreRequestParts
      ) {
        try {
          let jsonParts = this.chart.tiles[0].mconfig.storePart?.reqJsonParts;

          if (common.isDefined(jsonParts)) {
            const parsed = JSON.parse(jsonParts);
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
              if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
                let repoState = this.repoQuery.getValue();
                let newRepoState: RepoState = Object.assign(resp.payload.repo, <
                  RepoState
                >{
                  conflicts: repoState.conflicts, // getFile does not check for conflicts
                  repoStatus: repoState.repoStatus // getFile does not use git fetch
                });
                this.repoQuery.update(newRepoState);
                this.structQuery.update(resp.payload.struct);
                this.navQuery.updatePart({
                  needValidate: resp.payload.needValidate
                });

                this.content = resp.payload.content;

                this.cd.detectChanges();
              }
            }),
            take(1),
            finalize(() => {
              this.spinner.hide(this.spinnerName);
              this.isShowSpinner = false;
            })
          )
          .subscribe();
      }

      if (this.queryPart !== common.QueryPartEnum.YamlModel) {
        this.prevModelFilePath = undefined;
      }

      this.setEditorOptionsLanguage();
      this.cd.detectChanges();
    }
  }
}
