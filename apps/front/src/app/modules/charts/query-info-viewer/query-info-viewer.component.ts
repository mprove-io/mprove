/* eslint-disable @typescript-eslint/naming-convention */
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
import { VS_LIGHT_THEME_EXTRA } from '~front/app/constants/code-themes/vs-light-theme';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

import * as languageData from '@codemirror/language-data';
import { ChartQuery } from '~front/app/queries/chart.query';

@Component({
  selector: 'm-query-info-viewer',
  templateUrl: './query-info-viewer.component.html'
})
export class QueryInfoViewerComponent implements OnChanges {
  @Input()
  queryPart: common.QueryPartEnum;

  @Input()
  jsContent: string;

  @Input()
  jsonContent: string;

  @Input()
  modelFilePath: string;

  prevModelFilePath: string;

  theme: Extension = VS_LIGHT_THEME_EXTRA;

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
      this.queryPart === common.QueryPartEnum.MainSql
        ? 'SQL'
        : this.queryPart === common.QueryPartEnum.StoreReqFunction ||
            this.queryPart === common.QueryPartEnum.StoreReqTemplate
          ? 'JavaScript'
          : this.queryPart === common.QueryPartEnum.StoreReqJsonParts
            ? 'JSON'
            : this.queryPart === common.QueryPartEnum.TileYaml ||
                this.queryPart === common.QueryPartEnum.ModelYaml
              ? 'YAML'
              : undefined;
  }

  checkContent() {
    if (common.isDefined(this.chart)) {
      if (this.queryPart === common.QueryPartEnum.MainSql) {
        this.content = this.chart.tiles[0].query.sql;
      } else if (
        this.queryPart === common.QueryPartEnum.StoreReqFunction ||
        this.queryPart === common.QueryPartEnum.StoreReqTemplate
      ) {
        this.content = this.jsContent;
      } else if (this.queryPart === common.QueryPartEnum.StoreReqJsonParts) {
        try {
          if (this.jsonContent) {
            const parsed = JSON.parse(this.jsonContent);
            this.content = JSON.stringify(parsed, null, 2);
          } else {
            this.content = '';
          }
        } catch (error: any) {
          this.content = 'Invalid JSON: ' + error.message;
        }
      } else if (this.queryPart === common.QueryPartEnum.TileYaml) {
        let filePartTile: common.FilePartTile = common.prepareTile({
          isForDashboard: false,
          mconfig: this.chart.tiles[0].mconfig
        });

        this.content = common.toYaml({ tiles: [filePartTile] });
      } else if (
        this.queryPart === common.QueryPartEnum.ModelYaml &&
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
        // this.cd.detectChanges();

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

      if (this.queryPart !== common.QueryPartEnum.ModelYaml) {
        this.prevModelFilePath = undefined;
      }

      this.setEditorOptionsLanguage();
      this.cd.detectChanges();
    }
  }
}
