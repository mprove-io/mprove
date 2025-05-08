import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import type { editor as editorType } from 'monaco-editor';
import { MonacoEditorOptions, MonacoProviderService } from 'ng-monaco-editor';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, map, take, tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-files-right',
  templateUrl: './files-right.component.html'
})
export class FilesRightComponent implements OnInit {
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

  // prevSecondFileNodeId: string;

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

  secondFileContent: string;

  editorOptions: MonacoEditorOptions = {
    // autoIndent: 'keep',
    renderValidationDecorations: 'off',
    fixedOverflowWidgets: true,
    theme: constants.TEXTMATE_THEME,
    fontSize: 16,
    tabSize: 2,
    padding: {
      top: 12
    }
    // automaticLayout: true,
    // folding: true,
    // wordWrap: 'on',
    // minimap: { enabled: false },
    // lineNumbers: 'on',
    // scrollbar: {
    //   alwaysConsumeMouseWheel: false
    // }
  };

  isLoadedMonaco = false;

  editor: editorType.IStandaloneCodeEditor = null;

  monaco: typeof import('monaco-editor');

  constructor(
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private repoQuery: RepoQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private monacoService: MonacoProviderService
  ) {}

  async ngOnInit() {
    this.monaco = await this.monacoService.initMonaco();
    this.isLoadedMonaco = true;

    this.setEditorOptionsLanguage();

    this.cd.detectChanges();

    // setTimeout(() => {
    //   (document.activeElement as HTMLElement).blur();
    // }, 0);
  }

  setEditorOptionsLanguage() {
    if (
      this.isLoadedMonaco === false ||
      common.isUndefined(this.editor) ||
      common.isUndefined(this.secondFileNodeId)
    ) {
      return;
    }

    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        this.nav = x;
      });

    this.structQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        this.struct = x;
      });

    let mdir = this.struct.mproveDirValue;
    if (common.isDefined(this.struct.mproveDirValue)) {
      if (mdir.substring(0, 1) === '.') {
        mdir = mdir.substring(1);
      }
      if (mdir.substring(0, 1) === '/') {
        mdir = mdir.substring(1);
      }
    }

    // this.fileQuery
    //   .select()
    //   .pipe(take(1))
    //   .subscribe(x => {
    //     this.file = x;
    //   });

    let ar = this.secondFileName.split('.');
    let ext = ar.pop();
    let dotExt = `.${ext}`;

    if (
      this.secondFileName === common.MPROVE_CONFIG_FILENAME ||
      ((this.struct.mproveDirValue === common.MPROVE_CONFIG_DIR_DOT_SLASH ||
        (common.isDefined(mdir) &&
          this.secondFileNodeId.split(mdir)[0] === `${this.nav.projectId}/`)) &&
        constants.BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >=
          0)
    ) {
      this.showGoTo = true;

      let languageId = constants.YAML_LANGUAGE_ID;

      this.monaco.languages.setMonarchTokensProvider(
        languageId,
        constants.BLOCKML_LANGUAGE_DATA
      );

      // let schema: JSONSchema7 =
      //   dotExt === common.FileExtensionEnum.View
      //     ? common.VIEW_SCHEMA
      //     : dotExt === common.FileExtensionEnum.Store
      //     ? common.STORE_SCHEMA
      //     : dotExt === common.FileExtensionEnum.Model
      //     ? common.MODEL_SCHEMA
      //     : dotExt === common.FileExtensionEnum.Report
      //     ? common.REPORT_SCHEMA
      //     : dotExt === common.FileExtensionEnum.Dashboard
      //     ? common.DASHBOARD_SCHEMA
      //     : dotExt === common.FileExtensionEnum.Chart
      //     ? common.CHART_SCHEMA
      //     : dotExt === common.FileExtensionEnum.Udf
      //     ? common.UDF_SCHEMA
      //     : this.secondFileNodeId.split('/')[
      //         this.secondFileNodeId.split('/').length - 1
      //       ] === common.MPROVE_CONFIG_FILENAME
      //     ? common.CONFIG_SCHEMA
      //     : undefined;

      // setDiagnosticsOptions({
      //   validate: true,
      //   completion: true,
      //   format: true,
      //   enableSchemaRequest: true,
      //   schemas: common.isDefined(schema)
      //     ? [
      //         {
      //           uri: schema.$id,
      //           fileMatch: ['*'],
      //           schema: schema
      //         }
      //       ]
      //     : []
      // });

      this.monaco.editor.setModelLanguage(this.editor.getModel(), languageId);

      let patch: editorType.IStandaloneEditorConstructionOptions = {
        theme: constants.BLOCKML_THEME,
        renderValidationDecorations: 'off',
        readOnly: true,
        snippetSuggestions: 'none',
        suggestOnTriggerCharacters: false,
        wordBasedSuggestions: false
        // wordBasedSuggestionsOnlySameLanguage: true,
        // quickSuggestions: false,
        // suggestFontSize:  undefined,
        // suggestLineHeight: undefined,
        // suggestSelection: undefined,
        // quickSuggestionsDelay: undefined,
        // acceptSuggestionOnCommitCharacter: undefined,
        // acceptSuggestionOnEnter: undefined,
        // inlineSuggest: undefined,
        // suggest: undefined,
      };

      this.editorOptions = Object.assign({}, this.editorOptions, patch);

      // this.refreshMarkers();
    } else {
      this.showGoTo = false;

      let languageId =
        this.monaco.languages
          .getLanguages()
          .find(x => x.extensions?.indexOf(dotExt) > -1)?.id ||
        constants.MARKDOWN_LANGUAGE_ID;

      if (languageId === constants.YAML_LANGUAGE_ID) {
        this.monaco.languages.setMonarchTokensProvider(
          languageId,
          constants.YAML_LANGUAGE_DATA
        );

        // setDiagnosticsOptions({
        //   validate: false,
        //   completion: false,
        //   format: true,
        //   schemas: []
        // });
      }

      this.monaco.editor.setModelLanguage(this.editor.getModel(), languageId);

      let patch: editorType.IStandaloneEditorConstructionOptions = {
        theme: constants.TEXTMATE_THEME,
        renderValidationDecorations: 'off',
        readOnly: true,
        snippetSuggestions: 'none',
        suggestOnTriggerCharacters: false,
        wordBasedSuggestions: false,
        quickSuggestions: false
      };

      this.editorOptions = Object.assign({}, this.editorOptions, patch);

      // this.removeMarkers();
    }
    // // workaround for diff editor
    // this.monaco.editor.setTheme(this.editorOptions.theme);
    // // workaround for diff editor
    // this.editor.updateOptions(this.editorOptions);
  }

  async onEditorChange(editor: editorType.IStandaloneCodeEditor) {
    this.editor = editor;

    if (this.isLoadedMonaco === false) {
      return;
    }

    this.setEditorOptionsLanguage();
    // this.refreshMarkers();
    this.cd.detectChanges();
  }

  onTextChanged() {}

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

  checkContent() {
    if (common.isDefined(this.secondFileNodeId)) {
      // this.prevSecondFileNodeId = this.secondFileNodeId;

      let nav = this.navQuery.getValue();

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

              this.secondFileContent = resp.payload.content;

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
  }
}
