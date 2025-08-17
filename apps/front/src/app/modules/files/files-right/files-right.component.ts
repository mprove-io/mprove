import { ChangeDetectorRef, Component } from '@angular/core';
import { defaultKeymap } from '@codemirror/commands';
import { LanguageDescription } from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, map, take, tap } from 'rxjs/operators';
import {
  LIGHT_PLUS_THEME_EXTRA_SINGLE_READ,
  VS_LIGHT_THEME_EXTRA_SINGLE_READ
} from '~front/app/constants/code-themes/themes';
import { LIGHT_PLUS_LANGUAGES } from '~front/app/constants/top';
import { FileQuery } from '~front/app/queries/file.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import {
  HighLightService,
  PlaceNameEnum
} from '~front/app/services/highlight.service';
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
export class FilesRightComponent {
  isEditorOptionsInitComplete = false;

  extensions: Extension[] = [];

  languages: LanguageDescription[] = [];
  lang: string;

  theme: Extension = VS_LIGHT_THEME_EXTRA_SINGLE_READ;

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
      }

      this.cd.detectChanges();
    })
  );

  mainFileNodeId: string;
  fileNodeId$ = this.fileQuery.fileNodeId$.pipe(
    tap(x => {
      this.mainFileNodeId = x;
      this.cd.detectChanges();
    })
  );

  secondFileContent: string;

  isHighlighterReady: boolean;
  isHighlighterReady$ = this.uiQuery.select().pipe(
    tap(x => {
      this.isHighlighterReady = x.isHighlighterReady;

      if (
        this.isHighlighterReady === true &&
        this.isEditorOptionsInitComplete === false
      ) {
        this.initEditorOptions();
      }
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private fileQuery: FileQuery,
    private structQuery: StructQuery,
    private highLightService: HighLightService,
    private repoQuery: RepoQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private uiService: UiService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService
  ) {}

  initEditorOptions() {
    let res = this.highLightService.getLanguages({
      placeName: PlaceNameEnum.Right
    });

    this.languages = res.languages;
    let lightLanguage = res.lightLanguage;

    // let filesRightLanguageConf = new Compartment();
    // this.extensions = [keymap.of(defaultKeymap), filesRightLanguageConf.of(ls)];
    this.extensions = [
      highlightSelectionMatches(),
      keymap.of([...defaultKeymap, ...searchKeymap])
    ];

    this.isEditorOptionsInitComplete = true;

    this.setLanguage();

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

    if (dotExt === common.FileExtensionEnum.Store) {
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
          .map(l =>
            common.encodeFilePath({
              filePath: l.fileId.split('/').slice(1).join('/')
            })
          )
          .flat()
      )
      .flat();

    if (common.isDefined(this.secondFileNodeId)) {
      let fileIdAr = this.secondFileNodeId.split('/');
      fileIdAr.shift();

      let filePath = fileIdAr.join('/');

      let secondFileId = common.encodeFilePath({ filePath: filePath });

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
            tap(async (resp: apiToBackend.ToBackendGetFileResponse) => {
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

                this.setLanguage();

                this.highLightService.updateDocText({
                  placeName: PlaceNameEnum.Right,
                  docText: this.secondFileContent,
                  shikiLanguage: this.lang?.toLowerCase(),
                  shikiTheme: 'light-plus-extended'
                });

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

  setLanguage() {
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
      LIGHT_PLUS_LANGUAGES.indexOf(this.lang?.toLowerCase()) > -1
        ? LIGHT_PLUS_THEME_EXTRA_SINGLE_READ
        : VS_LIGHT_THEME_EXTRA_SINGLE_READ;

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

  goToEditFile() {
    let fileIdAr = this.secondFileNodeId.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      encodedFileId: common.encodeFilePath({ filePath: filePath })
    });
  }
}
