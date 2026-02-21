import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { defaultKeymap } from '@codemirror/commands';
import { LanguageDescription } from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { Extension } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { finalize, map, take, tap } from 'rxjs/operators';
import {
  LIGHT_PLUS_THEME_EXTRA_SINGLE_READ,
  VS_LIGHT_THEME_EXTRA_SINGLE_READ
} from '#common/constants/code-themes/themes';
import {
  EMPTY_CHART_ID,
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_CONFIG_FILENAME
} from '#common/constants/top';
import {
  APP_SPINNER_NAME,
  BLOCKML_EXT_LIST,
  LIGHT_PLUS_LANGUAGES
} from '#common/constants/top-front';
import { BuilderCenterEnum } from '#common/enums/builder-center.enum';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { BuilderRightEnum } from '#common/enums/builder-right.enum';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { getFileItems } from '#common/functions/get-file-items';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ModelX } from '#common/interfaces/backend/model-x';
import {
  ToBackendGetChartRequestPayload,
  ToBackendGetChartResponse
} from '#common/interfaces/to-backend/charts/to-backend-get-chart';
import {
  ToBackendGetFileRequestPayload,
  ToBackendGetFileResponse
} from '#common/interfaces/to-backend/files/to-backend-get-file';
import {
  ToBackendGetModelsRequestPayload,
  ToBackendGetModelsResponse
} from '#common/interfaces/to-backend/models/to-backend-get-models';
import { FileQuery } from '#front/app/queries/file.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import {
  HighLightService,
  PlaceNameEnum
} from '#front/app/services/highlight.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-builder-right',
  templateUrl: './builder-right.component.html'
})
export class BuilderRightComponent implements OnInit, OnDestroy {
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
        isDefined(this.prevEnvId) &&
        isDefined(this.prevBranchId) &&
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

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  builderRightSessions = BuilderRightEnum.Sessions;
  builderRightValidation = BuilderRightEnum.Validation;

  builderRight = BuilderRightEnum.Sessions;
  builderRight$ = this.uiQuery.builderRight$.pipe(
    tap(x => {
      this.builderRight = x;
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

      if (isDefined(this.secondFileNodeId)) {
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

  workerTaskCompletedSubscription: Subscription;

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
    private myDialogService: MyDialogService,
    private uiService: UiService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.workerTaskCompletedSubscription = new Subscription();

    this.workerTaskCompletedSubscription.add(
      this.highLightService.workerTaskCompleted.subscribe(eventData => {
        if (eventData.placeName === PlaceNameEnum.Right) {
          let prevSecondFileContent = this.secondFileContent;
          this.secondFileContent = this.secondFileContent + ' ';
          // this.cd.detectChanges();

          setTimeout(() => {
            this.secondFileContent = prevSecondFileContent;
            // this.cd.detectChanges();
          }, 0);
        }
      })
    );
  }

  ngOnDestroy() {
    this.workerTaskCompletedSubscription?.unsubscribe();
  }

  initEditorOptions() {
    let res = this.highLightService.getLanguages({
      placeName: PlaceNameEnum.Right
    });

    this.languages = res.languages;
    let lightLanguage = res.lightLanguage;

    this.extensions = [
      highlightSelectionMatches(),
      keymap.of([...defaultKeymap, ...searchKeymap])
    ];

    this.isEditorOptionsInitComplete = true;

    this.setLanguage();

    this.cd.detectChanges();
  }

  goTo() {
    let uiState = this.uiQuery.getValue();

    let ar = this.secondFileName.split('.');
    let ext = ar.pop();
    let id = ar.join('.');
    let dotExt = `.${ext}`;

    if (dotExt === FileExtensionEnum.Store) {
      this.navigateService.navigateToChart({
        modelId: id,
        chartId: EMPTY_CHART_ID
      });
    } else if (dotExt === FileExtensionEnum.Malloy) {
      this.spinner.show(APP_SPINNER_NAME);

      let models: ModelX[] = [];

      let nav = this.navQuery.getValue();

      let payload: ToBackendGetModelsRequestPayload = {
        projectId: nav.projectId,
        isRepoProd: nav.isRepoProd,
        branchId: nav.branchId,
        envId: nav.envId
      };

      this.apiService
        .req({
          pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetModels,
          payload: payload
        })
        .pipe(
          tap((resp: ToBackendGetModelsResponse) => {
            if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
              models = resp.payload.models.filter(
                y => y.filePath === this.secondFileNodeId
              );

              if (
                models.length === 1 &&
                models.filter(x => x.hasAccess === true).length === 1
              ) {
                this.navigateService.navigateToChart({
                  modelId: models[0].modelId,
                  chartId: EMPTY_CHART_ID
                });
              } else {
                this.spinner.hide(APP_SPINNER_NAME);

                this.myDialogService.showMalloyModels({
                  apiService: this.apiService,
                  models: models
                });
              }
            } else {
              this.spinner.hide(APP_SPINNER_NAME);
            }
          })
        )
        .toPromise();
    } else if (dotExt === FileExtensionEnum.Report) {
      this.navigateService.navigateToReport({ reportId: id });
    } else if (dotExt === FileExtensionEnum.Dashboard) {
      this.navigateService.navigateToDashboard({
        dashboardId: id
      });
    } else if (dotExt === FileExtensionEnum.Chart) {
      let nav = this.navQuery.getValue();

      let payload: ToBackendGetChartRequestPayload = {
        projectId: nav.projectId,
        isRepoProd: nav.isRepoProd,
        branchId: nav.branchId,
        envId: nav.envId,
        chartId: id,
        timezone: uiState.timezone
      };

      this.spinner.show(APP_SPINNER_NAME);

      this.apiService
        .req({
          pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetChart,
          payload: payload
        })
        .pipe(
          map((resp: ToBackendGetChartResponse) => {
            if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
              this.memberQuery.update(resp.payload.userMember);

              if (isDefined(resp.payload.chart)) {
                this.navigateService.navigateToChart({
                  modelId: resp.payload.chart.modelId,
                  chartId: id
                });
              } else {
                this.spinner.hide(APP_SPINNER_NAME);
              }
            } else {
              this.spinner.hide(APP_SPINNER_NAME);
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
            encodeFilePath({
              filePath: l.fileId.split('/').slice(1).join('/')
            })
          )
          .flat()
      )
      .flat();

    if (isDefined(this.secondFileNodeId)) {
      let fileIdAr = this.secondFileNodeId.split('/');
      fileIdAr.shift();

      let filePath = fileIdAr.join('/');

      let secondFileId = encodeFilePath({ filePath: filePath });

      this.isSecondFileValid = isUndefined(secondFileId)
        ? true
        : errorFileIds.indexOf(secondFileId) < 0;
    } else {
      this.isSecondFileValid = true;
    }
  }

  checkContent() {
    if (isDefined(this.secondFileNodeId)) {
      let nav = this.navQuery.getValue();

      let fileItems = getFileItems({ nodes: this.repo.nodes });

      if (fileItems.map(x => x.fileNodeId).indexOf(this.secondFileNodeId) < 0) {
        setTimeout(() => {
          this.uiQuery.updatePart({ secondFileNodeId: undefined });
        }, 0);
      } else {
        let getFilePayload: ToBackendGetFileRequestPayload = {
          projectId: nav.projectId,
          isRepoProd: nav.isRepoProd,
          branchId: nav.branchId,
          envId: nav.envId,
          fileNodeId: this.secondFileNodeId,
          builderCenter: BuilderCenterEnum.File
        };

        this.isShowSpinner = true;
        this.spinner.show(this.spinnerName);

        this.cd.detectChanges();

        this.apiService
          .req({
            pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetFile,
            payload: getFilePayload,
            showSpinner: false
          })
          .pipe(
            tap(async (resp: ToBackendGetFileResponse) => {
              if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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
                  shikiTheme: 'light-plus-extended',
                  isThrottle: false
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
      isUndefined(this.secondFileNodeId) ||
      this.isEditorOptionsInitComplete === false
    ) {
      return;
    }

    this.nav = this.navQuery.getValue();
    this.struct = this.structQuery.getValue();

    let mdir = this.struct.mproveConfig.mproveDirValue;
    if (isDefined(this.struct.mproveConfig.mproveDirValue)) {
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

    if (BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >= 0) {
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
      this.secondFileName === MPROVE_CONFIG_FILENAME ||
      ((this.struct.mproveConfig.mproveDirValue ===
        MPROVE_CONFIG_DIR_DOT_SLASH ||
        (isDefined(mdir) &&
          this.secondFileNodeId.split(mdir)[0] === `${this.nav.projectId}/`)) &&
        [...BLOCKML_EXT_LIST, '.malloy']
          .map(ex => ex.toString())
          .indexOf(dotExt) >= 0)
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

    this.uiService.ensureFilesLeftPanel();
    this.navigateService.navigateToFileLine({
      builderLeft: BuilderLeftEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath })
    });
  }
}
