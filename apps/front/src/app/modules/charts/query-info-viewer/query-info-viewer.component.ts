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
import { VS_LIGHT_THEME } from '~front/app/constants/code-themes/vs-light-theme';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { UiService } from '~front/app/services/ui.service';
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

  theme: Extension = VS_LIGHT_THEME;

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

  // showGoTo = false;

  // isSecondFileValid = true;

  // secondFileName: string;

  // secondFileNodeId: string;
  // secondFileNodeId$ = this.uiQuery.secondFileNodeId$.pipe(
  //   tap(x => {
  //     this.secondFileNodeId = x;

  //     if (common.isDefined(this.secondFileNodeId)) {
  //       let ar = this.secondFileNodeId.split('/');
  //       this.secondFileName = ar[ar.length - 1];

  //       this.checkSecondFile();
  //       this.checkContent();
  //     } else {
  //       this.secondFileName = undefined;
  //       this.uiService.setProjectFileLink();
  //     }

  //     this.cd.detectChanges();
  //   })
  // );

  // repo: RepoState;
  // repo$ = this.repoQuery.select().pipe(
  //   tap(x => {
  //     this.repo = x;
  //     this.cd.detectChanges();
  //   })
  // );

  // struct: StructState;
  // struct$ = this.structQuery.select().pipe(
  //   tap(x => {
  //     this.struct = x;

  //     this.checkSecondFile();
  //     this.cd.detectChanges();
  //   })
  // );

  // prevBranchId: string;
  // prevEnvId: string;

  // nav: NavState;
  // nav$ = this.navQuery.select().pipe(
  //   tap(x => {
  //     this.nav = x;

  //     if (
  //       common.isDefined(this.prevEnvId) &&
  //       common.isDefined(this.prevBranchId) &&
  //       (this.prevEnvId !== this.nav.envId ||
  //         this.prevBranchId !== this.nav.branchId)
  //     ) {
  //       this.prevEnvId = this.nav.envId;
  //       this.prevBranchId = this.nav.branchId;

  //       this.checkContent();
  //     }

  //     this.cd.detectChanges();
  //   })
  // );

  // isEditor: boolean;
  // isEditor$ = this.memberQuery.isEditor$.pipe(
  //   tap(x => {
  //     this.isEditor = x;
  //     this.cd.detectChanges();
  //   })
  // );

  // isExplorer = false;
  // isExplorer$ = this.memberQuery.isExplorer$.pipe(
  //   tap(x => {
  //     this.isExplorer = x;
  //     this.cd.detectChanges();
  //   })
  // );

  constructor(
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private chartQuery: ChartQuery,
    private repoQuery: RepoQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private uiService: UiService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService
  ) {}

  // ngOnInit() {
  //   this.setEditorOptionsLanguage();

  //   this.cd.detectChanges();
  // }

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

// checkContent() {
//   if (common.isDefined(this.secondFileNodeId)) {
//     let nav = this.navQuery.getValue();

//     let fileItems = common.getFileItems({ nodes: this.repo.nodes });

//     if (fileItems.map(x => x.fileNodeId).indexOf(this.secondFileNodeId) < 0) {
//       setTimeout(
//         () => this.uiQuery.updatePart({ secondFileNodeId: undefined }),
//         0
//       );
//     } else {
//       let getFilePayload: apiToBackend.ToBackendGetFileRequestPayload = {
//         projectId: nav.projectId,
//         isRepoProd: nav.isRepoProd,
//         branchId: nav.branchId,
//         envId: nav.envId,
//         fileNodeId: this.secondFileNodeId,
//         panel: common.PanelEnum.Tree
//       };

//       this.isShowSpinner = true;
//       this.spinner.show(this.spinnerName);

//       this.cd.detectChanges();

//       this.apiService
//         .req({
//           pathInfoName:
//             apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetFile,
//           payload: getFilePayload,
//           showSpinner: false
//         })
//         .pipe(
//           tap((resp: apiToBackend.ToBackendGetFileResponse) => {
//             if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
//               let repoState = this.repoQuery.getValue();
//               let newRepoState: RepoState = Object.assign(resp.payload.repo, <
//                 RepoState
//               >{
//                 conflicts: repoState.conflicts, // getFile does not check for conflicts
//                 repoStatus: repoState.repoStatus // getFile does not use git fetch
//               });
//               this.repoQuery.update(newRepoState);
//               this.structQuery.update(resp.payload.struct);
//               this.navQuery.updatePart({
//                 needValidate: resp.payload.needValidate
//               });

//               this.secondFileContent = resp.payload.content;

//               this.setEditorOptionsLanguage();

//               this.uiService.setProjectFileLink();

//               this.cd.detectChanges();
//             }
//           }),
//           take(1),
//           finalize(() => {
//             this.spinner.hide(this.spinnerName);
//             this.isShowSpinner = false;
//           })
//         )
//         .subscribe();
//     }
//   }
// }
