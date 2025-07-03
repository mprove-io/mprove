import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { standardKeymap } from '@codemirror/commands';
import { LanguageDescription, LanguageSupport } from '@codemirror/language';
import * as languageData from '@codemirror/language-data';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, map, take, tap } from 'rxjs/operators';
import { createMalloyLanguage } from '~front/app/constants/code-themes/languages/create-malloy-language';
import { MALLOY_LIGHT_THEME_EXTRA_MOD } from '~front/app/constants/code-themes/malloy-light-theme';
import { VS_LIGHT_THEME_EXTRA_MOD } from '~front/app/constants/code-themes/vs-light-theme';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { UiService } from '~front/app/services/ui.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  standalone: false,
  selector: 'm-files-right',
  templateUrl: './files-right.component.html'
})
export class FilesRightComponent implements OnInit {
  isEditorOptionsInitComplete = false;

  extensions: Extension[] = [];

  languages: LanguageDescription[] = [];
  lang: string;

  theme: Extension = VS_LIGHT_THEME_EXTRA_MOD;

  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;

      this.checkSecondFile();
      this.cd.detectChanges();
    })
  );

  prevBranchId: string;
  prevEnvId: string;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;

      if (
        common.isDefined(this.prevEnvId) &&
        common.isDefined(this.prevBranchId) &&
        (this.prevEnvId !== this.nav.envId ||
          this.prevBranchId !== this.nav.branchId)
      ) {
        this.prevEnvId = this.nav.envId;
        this.prevBranchId = this.nav.branchId;

        this.checkContent();
      }

      this.cd.detectChanges();
    })
  );

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
      this.cd.detectChanges();
    })
  );

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  spinnerName = 'filesRightGetFile';
  isShowSpinner = false;

  showGoTo = false;

  isSecondFileValid = true;

  secondFileName: string;

  secondFileNodeId: string;
  secondFileNodeId$ = this.uiQuery.secondFileNodeId$.pipe(
    tap(x => {
      this.secondFileNodeId = x;

      if (common.isDefined(this.secondFileNodeId)) {
        let ar = this.secondFileNodeId.split('/');
        this.secondFileName = ar[ar.length - 1];

        this.checkSecondFile();
        this.checkContent();
      } else {
        this.secondFileName = undefined;
        this.uiService.setProjectFileLink();
      }

      this.cd.detectChanges();
    })
  );

  secondFileContent: string;

  constructor(
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private repoQuery: RepoQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private uiService: UiService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.initEditorOptions();
  }

  async initEditorOptions() {
    let malloyLanguage = await createMalloyLanguage();

    let ls = new LanguageSupport(malloyLanguage);

    let malloyLanguageDescription = LanguageDescription.of({
      name: 'Malloy',
      alias: ['malloy'],
      extensions: ['malloy'],
      load: async () => {
        return ls;
      }
    });

    this.languages = [...languageData.languages, malloyLanguageDescription];

    // let filesRightLanguageConf = new Compartment();
    // this.extensions = [keymap.of(standardKeymap), filesRightLanguageConf.of(ls)];
    this.extensions = [keymap.of(standardKeymap)];

    this.isEditorOptionsInitComplete = true;

    this.setEditorOptionsLanguage();

    this.cd.detectChanges();
  }

  validate() {
    let payload: apiToBackend.ToBackendValidateFilesRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendValidateFiles,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendValidateFilesResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  goTo() {
    let uiState = this.uiQuery.getValue();

    let ar = this.secondFileName.split('.');
    let ext = ar.pop();
    let id = ar.join('.');
    let dotExt = `.${ext}`;

    if (dotExt === common.FileExtensionEnum.View) {
      this.navigateService.navigateToChart({
        modelId: `${common.VIEW_MODEL_PREFIX}_${id}`,
        chartId: common.EMPTY_CHART_ID
      });
    } else if (dotExt === common.FileExtensionEnum.Store) {
      this.navigateService.navigateToChart({
        modelId: `${common.STORE_MODEL_PREFIX}_${id}`,
        chartId: common.EMPTY_CHART_ID
      });
    } else if (dotExt === common.FileExtensionEnum.Model) {
      this.navigateService.navigateToChart({
        modelId: id,
        chartId: common.EMPTY_CHART_ID
      });
    } else if (dotExt === common.FileExtensionEnum.Report) {
      this.navigateService.navigateToReport({ reportId: id });
    } else if (dotExt === common.FileExtensionEnum.Dashboard) {
      this.navigateService.navigateToDashboard({
        dashboardId: id
      });
    } else if (dotExt === common.FileExtensionEnum.Chart) {
      let nav = this.navQuery.getValue();

      let payload: apiToBackend.ToBackendGetChartRequestPayload = {
        projectId: nav.projectId,
        isRepoProd: nav.isRepoProd,
        branchId: nav.branchId,
        envId: nav.envId,
        chartId: id,
        timezone: uiState.timezone
      };

      this.spinner.show(constants.APP_SPINNER_NAME);

      this.apiService
        .req({
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetChart,
          payload: payload
        })
        .pipe(
          map((resp: apiToBackend.ToBackendGetChartResponse) => {
            if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
              this.memberQuery.update(resp.payload.userMember);

              if (common.isDefined(resp.payload.chart)) {
                this.navigateService.navigateToChart({
                  modelId: resp.payload.chart.modelId,
                  chartId: id
                });
              } else {
                this.spinner.hide(constants.APP_SPINNER_NAME);
              }
            } else {
              this.spinner.hide(constants.APP_SPINNER_NAME);
            }
          }),
          take(1)
        )
        .subscribe();
    }
  }

  closeSecondFile() {
    this.uiQuery.updatePart({ secondFileNodeId: undefined });
  }

  checkSecondFile() {
    let errorFileIds = this.structQuery
      .getValue()
      .errors.map(e =>
        e.lines
          .map(l => l.fileId.split('/').slice(1).join(common.TRIPLE_UNDERSCORE))
          .flat()
      )
      .flat();

    if (common.isDefined(this.secondFileNodeId)) {
      let fileIdAr = this.secondFileNodeId.split('/');
      fileIdAr.shift();

      let secondFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      this.isSecondFileValid = common.isUndefined(secondFileId)
        ? true
        : errorFileIds.indexOf(secondFileId) < 0;
    } else {
      this.isSecondFileValid = true;
    }
  }

  checkContent() {
    if (common.isDefined(this.secondFileNodeId)) {
      let nav = this.navQuery.getValue();

      let fileItems = common.getFileItems({ nodes: this.repo.nodes });

      if (fileItems.map(x => x.fileNodeId).indexOf(this.secondFileNodeId) < 0) {
        setTimeout(() => {
          this.uiQuery.updatePart({ secondFileNodeId: undefined });
        }, 0);
      } else {
        let getFilePayload: apiToBackend.ToBackendGetFileRequestPayload = {
          projectId: nav.projectId,
          isRepoProd: nav.isRepoProd,
          branchId: nav.branchId,
          envId: nav.envId,
          fileNodeId: this.secondFileNodeId,
          panel: common.PanelEnum.Tree
        };

        this.isShowSpinner = true;
        this.spinner.show(this.spinnerName);

        this.cd.detectChanges();

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

                this.secondFileContent = resp.payload.content;

                this.setEditorOptionsLanguage();

                this.uiService.setProjectFileLink();

                this.cd.detectChanges();
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
    }
  }

  setEditorOptionsLanguage() {
    if (
      common.isUndefined(this.secondFileNodeId) ||
      this.isEditorOptionsInitComplete === false
    ) {
      return;
    }

    this.nav = this.navQuery.getValue();
    this.struct = this.structQuery.getValue();

    let mdir = this.struct.mproveDirValue;
    if (common.isDefined(this.struct.mproveDirValue)) {
      if (mdir.substring(0, 1) === '.') {
        mdir = mdir.substring(1);
      }
      if (mdir.substring(0, 1) === '/') {
        mdir = mdir.substring(1);
      }
    }

    let ar = this.secondFileName.split('.');
    let ext = ar.pop();
    let dotExt = `.${ext}`;

    if (
      constants.BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >= 0
    ) {
      this.lang = 'YAML';
    } else {
      let language = this.languages.find(
        (x: any) => x.extensions.indexOf(ext) > -1
      );

      this.lang = language?.name;
    }

    this.theme =
      this.lang === 'Malloy'
        ? MALLOY_LIGHT_THEME_EXTRA_MOD
        : VS_LIGHT_THEME_EXTRA_MOD;

    if (
      this.secondFileName === common.MPROVE_CONFIG_FILENAME ||
      ((this.struct.mproveDirValue === common.MPROVE_CONFIG_DIR_DOT_SLASH ||
        (common.isDefined(mdir) &&
          this.secondFileNodeId.split(mdir)[0] === `${this.nav.projectId}/`)) &&
        constants.BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >=
          0)
    ) {
      this.showGoTo = true;
    } else {
      this.showGoTo = false;
    }
  }
}
