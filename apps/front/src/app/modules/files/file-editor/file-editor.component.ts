import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as languageData from '@codemirror/language-data';
import { EditorState, Extension } from '@codemirror/state';
// import { JSONSchema7 } from 'json-schema';
// import type { editor as editorType } from 'monaco-editor';
// import { MarkerSeverity } from 'monaco-editor';
// import { setDiagnosticsOptions } from 'monaco-yaml';
// import { MonacoEditorOptions, MonacoProviderService } from 'ng-monaco-editor';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, map, take, tap } from 'rxjs/operators';
import { VS_LIGHT_THEME } from '~front/app/constants/code-themes/vs-light-theme';
import { FileQuery, FileState } from '~front/app/queries/file.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { ConfirmService } from '~front/app/services/confirm.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['file-editor.component.scss']
})
export class FileEditorComponent implements OnInit, OnDestroy {
  panelTree = common.PanelEnum.Tree;

  theme: Extension = VS_LIGHT_THEME;

  languages = languageData.languages;
  lang: string;

  originalExtensions: Extension[] = [EditorState.readOnly.of(true)];

  modifiedExtensions: Extension[] = [EditorState.readOnly.of(false)];

  line = 1;

  // isLoadedMonaco = false;

  // editor: editorType.IStandaloneCodeEditor = null;

  // monaco: typeof import('monaco-editor');

  // diffEditorOptions: editorType.IDiffEditorOptions = {
  //   renderValidationDecorations: 'on',
  //   ignoreTrimWhitespace: false,
  //   fixedOverflowWidgets: true,
  //   fontSize: 16,
  //   renderSideBySide: true
  // };

  // editorOptions: MonacoEditorOptions = {
  //   // autoIndent: 'keep',
  //   renderValidationDecorations: 'off',
  //   fixedOverflowWidgets: true,
  //   theme: constants.TEXTMATE_THEME,
  //   fontSize: 16,
  //   tabSize: 2,
  //   padding: {
  //     top: 12
  //   }
  //   // automaticLayout: true,
  //   // folding: true,
  //   // wordWrap: 'on',
  //   // minimap: { enabled: false },
  //   // lineNumbers: 'on',
  //   // scrollbar: {
  //   //   alwaysConsumeMouseWheel: false
  //   // }
  // };

  showGoTo = false;

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  panel: common.PanelEnum;
  panel$ = this.uiQuery.panel$.pipe(tap(x => (this.panel = x)));

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  originalContent: string;
  content: string;

  diffContent: { original: string; modified: string } = {
    original: '',
    modified: ''
  };

  startText: string;
  specialText: string;

  isSelectedFileValid = true;

  file: FileState;
  file$ = this.fileQuery.select().pipe(
    tap(x => {
      this.file = x;

      this.originalContent = x.originalContent;
      this.content = x.content;
      this.startText = x.content;

      this.diffContent = {
        original: this.originalContent,
        modified: this.content
      };

      this.setEditorOptionsLanguage();
      this.checkSelectedFile();

      this.cd.detectChanges();
    })
  );

  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;

      this.refreshMarkers();
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      // console.log(this.struct.mproveDirValue);
      this.refreshMarkers();
      this.checkSelectedFile();

      this.cd.detectChanges();
    })
  );

  routeLine$ = this.route.queryParams.pipe(
    tap(params => {
      this.line = Number(params['line'] ? params['line'] : 1);
      this.moveToLine(this.line);
    })
  );

  fileId$ = this.fileQuery.fileId$.pipe(
    filter(v => !!v),
    tap((fileId: string) => {
      this.moveToLine(this.line);
    })
  );

  member: common.Member;
  member$ = this.memberQuery.select().pipe(
    tap(x => {
      this.member = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private fileQuery: FileQuery,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
    private repoQuery: RepoQuery,
    private memberQuery: MemberQuery,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private confirmService: ConfirmService,
    private navigateService: NavigateService,
    private route: ActivatedRoute // , // private monacoService: MonacoProviderService
  ) {}

  async ngOnInit() {
    // this.monaco = await this.monacoService.initMonaco();
    // this.isLoadedMonaco = true;

    this.setEditorOptionsLanguage();
    this.refreshMarkers();
  }

  checkSelectedFile() {
    let errorFileIds = this.structQuery
      .getValue()
      .errors.map(e =>
        e.lines
          .map(l => l.fileId.split('/').slice(1).join(common.TRIPLE_UNDERSCORE))
          .flat()
      )
      .flat();

    this.isSelectedFileValid = common.isUndefined(this.file.fileId)
      ? true
      : errorFileIds.indexOf(this.file.fileId) < 0;
  }

  // async onEditorChange(editor: editorType.IStandaloneCodeEditor) {
  //   this.editor = editor;

  //   if (this.isLoadedMonaco === false) {
  //     return;
  //   }

  //   this.setEditorOptionsLanguage();
  //   this.refreshMarkers();
  //   this.cd.detectChanges();
  // }

  setEditorOptionsLanguage() {
    if (
      // this.isLoadedMonaco === false ||
      // common.isUndefined(this.editor) ||
      common.isUndefined(this.file?.name)
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

    this.fileQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        this.file = x;
      });

    let ar = this.file.name.split('.');
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

    if (
      this.file.fileId === common.MPROVE_CONFIG_FILENAME ||
      ((this.struct.mproveDirValue === common.MPROVE_CONFIG_DIR_DOT_SLASH ||
        (common.isDefined(mdir) &&
          this.file.fileNodeId.split(mdir)[0] === `${this.nav.projectId}/`)) &&
        constants.BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >=
          0)
    ) {
      this.showGoTo = true;

      // let languageId = constants.YAML_LANGUAGE_ID;

      // // this.monaco.languages.register({ id: languageId });
      // this.monaco.languages.setMonarchTokensProvider(
      //   languageId,
      //   constants.BLOCKML_LANGUAGE_DATA
      // );

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
      //     : this.file.fileId === common.MPROVE_CONFIG_FILENAME
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

      // this.monaco.editor.setModelLanguage(this.editor.getModel(), languageId);

      // let patch: editorType.IStandaloneEditorConstructionOptions = {
      //   theme: constants.BLOCKML_THEME,
      //   renderValidationDecorations: 'on',
      //   readOnly: this.nav.isRepoProd === true || this.file.isExist === false,
      //   snippetSuggestions: 'none',
      //   suggestOnTriggerCharacters: true,
      //   wordBasedSuggestions: false
      //   // wordBasedSuggestionsOnlySameLanguage: true,
      //   // quickSuggestions: false,
      //   // suggestFontSize:  undefined,
      //   // suggestLineHeight: undefined,
      //   // suggestSelection: undefined,
      //   // quickSuggestionsDelay: undefined,
      //   // acceptSuggestionOnCommitCharacter: undefined,
      //   // acceptSuggestionOnEnter: undefined,
      //   // inlineSuggest: undefined,
      //   // suggest: undefined,
      // };
      // this.editorOptions = Object.assign({}, this.editorOptions, patch);

      // let pc: monacoLanguages.CompletionItemProvider = {
      //   triggerCharacters: [' ', ':'],

      //   async provideCompletionItems(model, position) {
      //     let mySuggestions: monacoLanguages.CompletionItem[] = [
      //       {
      //         label: '"label10"',
      //         kind: 1,
      //         // kind: monaco.languages.CompletionItemKind.Function,
      //         documentation: '...',
      //         insertText: '"abc": "*"',
      //         range: {
      //           startLineNumber: 1,
      //           endLineNumber: 2,
      //           startColumn: 1,
      //           endColumn: 10
      //         }
      //       }
      //     ];

      //     return {
      //       // incomplete: info.isIncomplete,
      //       // suggestions: items
      //       suggestions: mySuggestions
      //     };
      //   }
      // };

      // this.monaco.languages.registerCompletionItemProvider(languageId, pc);

      this.refreshMarkers();
    } else {
      this.showGoTo = false;

      // let languageId =
      //   this.monaco.languages
      //     .getLanguages()
      //     .find(x => x.extensions?.indexOf(dotExt) > -1)?.id ||
      //   constants.MARKDOWN_LANGUAGE_ID;

      // if (languageId === constants.YAML_LANGUAGE_ID) {
      //   // this.monaco.languages.register({ id: languageId });
      //   this.monaco.languages.setMonarchTokensProvider(
      //     languageId,
      //     constants.YAML_LANGUAGE_DATA
      //   );

      //   setDiagnosticsOptions({
      //     validate: false,
      //     completion: false,
      //     format: true,
      //     schemas: []
      //   });
      // }

      // this.monaco.editor.setModelLanguage(this.editor.getModel(), languageId);

      // let patch: editorType.IStandaloneEditorConstructionOptions = {
      //   theme: constants.TEXTMATE_THEME,
      //   renderValidationDecorations: 'off',
      //   readOnly: this.nav.isRepoProd === true || this.file.isExist === false,
      //   snippetSuggestions: 'none',
      //   suggestOnTriggerCharacters: false,
      //   wordBasedSuggestions: false,
      //   quickSuggestions: false
      // };

      // this.editorOptions = Object.assign({}, this.editorOptions, patch);

      this.removeMarkers();
    }
    // // workaround for diff editor
    // this.monaco.editor.setTheme(this.editorOptions.theme);
    // // workaround for diff editor
    // this.editor.updateOptions(this.editorOptions);
  }

  removeMarkers() {
    // if (this.isLoadedMonaco === false || common.isUndefined(this.editor)) {
    //   return;
    // }
    // this.monaco.editor.setModelMarkers(this.editor.getModel(), 'Conflicts', []);
    // this.monaco.editor.setModelMarkers(
    //   this.editor.getModel(),
    //   'MproveYAML',
    //   []
    // );
  }

  refreshMarkers() {
    // if (this.isLoadedMonaco === false || common.isUndefined(this.editor)) {
    //   return;
    // }

    this.repoQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        this.repo = x;
      });

    this.structQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        this.struct = x;
      });

    this.fileQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        this.file = x;
      });

    if (this.repo.conflicts.length > 0) {
      let conflictMarkers: any[] = [];
      this.repo.conflicts
        .filter(x => x.fileId === this.file.fileId)
        .map(x => x.lineNumber)
        .forEach(cLineNumber => {
          if (cLineNumber !== 0) {
            conflictMarkers.push({
              startLineNumber: cLineNumber,
              endLineNumber: cLineNumber,
              startColumn: 1,
              endColumn: 99,
              message: `conflict`
              // severity: MarkerSeverity.Error
            });
          }
        });
      // this.monaco.editor.setModelMarkers(
      //   this.editor.getModel(),
      //   'Conflicts',
      //   conflictMarkers
      // );
    } else {
      let errorMarkers: any[] = [];
      this.struct.errors.forEach(error =>
        error.lines
          .filter(x => {
            let lineFileIdAr = x.fileId.split('/');
            lineFileIdAr.shift();
            let fileId = lineFileIdAr.join(common.TRIPLE_UNDERSCORE);
            return fileId === this.file.fileId;
          })
          .map(eLine => {
            if (eLine.lineNumber !== 0) {
              errorMarkers.push({
                startLineNumber: eLine.lineNumber,
                endLineNumber: eLine.lineNumber,
                startColumn: 1,
                endColumn: 99,
                message: `${error.title}: ${error.message}`
                // severity: MarkerSeverity.Error
              });
            }
          })
      );
      // this.monaco.editor.setModelMarkers(
      //   this.editor.getModel(),
      //   'MproveYAML',
      //   errorMarkers
      // );
    }
  }

  onTextChanged(item: { isDiffEditor: boolean }) {
    if (item.isDiffEditor === true) {
      this.content = this.diffContent.modified;
    }

    this.removeMarkers();

    if (this.content === this.startText) {
      this.refreshMarkers();
    }

    if (!this.needSave && this.content !== this.startText) {
      this.uiQuery.updatePart({ needSave: true });
    } else if (this.needSave && this.content === this.startText) {
      this.uiQuery.updatePart({ needSave: false });
    }
  }

  save() {
    let payload: apiToBackend.ToBackendSaveFileRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fileNodeId:
        this.nav.projectId +
        '/' +
        this.file.fileId.split(common.TRIPLE_UNDERSCORE).join('/'),
      content: this.content
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendSaveFileResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.startText = this.content;

            this.uiQuery.updatePart({
              needSave: false,
              panel: common.PanelEnum.Tree
            });

            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.content = this.startText;

    this.diffContent = {
      original: this.originalContent,
      modified: this.startText
    };

    this.uiQuery.updatePart({ needSave: false });
  }

  async moveToLine(line: number) {
    // setTimeout(() => {
    //   if (this.editor) {
    //     this.editor.revealLineInCenter(line);
    //     this.editor.setPosition({ column: 1, lineNumber: line });
    //   }
    // }, 50);
  }

  goTo() {
    let uiState = this.uiQuery.getValue();

    let ar = this.file.name.split('.');
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

  canDeactivate(): Promise<boolean> | boolean {
    if (this.needSave === false) {
      return true;
    }

    return this.confirmService.confirm('Discard changes?').then(answer => {
      if (answer === true) {
        this.uiQuery.updatePart({ needSave: false });

        return true;
      } else {
        return false;
      }
    });
  }

  ngOnDestroy() {
    this.fileQuery.reset();
  }
}
