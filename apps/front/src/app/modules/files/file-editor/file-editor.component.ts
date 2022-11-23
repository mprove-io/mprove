import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JSONSchema7 } from 'json-schema';
import type { editor as editorType } from 'monaco-editor';
import { MarkerSeverity } from 'monaco-editor';
import { setDiagnosticsOptions } from 'monaco-yaml';
import { MonacoEditorOptions, MonacoProviderService } from 'ng-monaco-editor';
import { filter, take, tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { ConfirmService } from '~front/app/services/confirm.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { FileState, FileStore } from '~front/app/stores/file.store';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { StructState, StructStore } from '~front/app/stores/struct.store';
import { UiState, UiStore } from '~front/app/stores/ui.store';
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

  line = 1;

  isLoadedMonaco = false;

  editor: editorType.IStandaloneCodeEditor = null;

  monaco: typeof import('monaco-editor');

  diffEditorOptions: editorType.IDiffEditorOptions = {
    renderValidationDecorations: 'on',
    fixedOverflowWidgets: true,
    fontSize: 16,
    renderSideBySide: true
  };

  editorOptions: MonacoEditorOptions = {
    // autoIndent: 'keep',
    renderValidationDecorations: 'off',
    fixedOverflowWidgets: true,
    theme: constants.TEXTMATE_THEME,
    fontSize: 16,
    tabSize: 2
    // automaticLayout: true,
    // folding: true,
    // wordWrap: 'on',
    // minimap: { enabled: false },
    // lineNumbers: 'on',
    // scrollbar: {
    //   alwaysConsumeMouseWheel: false
    // }
  };

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

  startText: string;
  specialText: string;

  file: FileState;
  file$ = this.fileQuery.select().pipe(
    tap(x => {
      this.file = x;
      this.originalContent = x.originalContent;
      this.content = x.content;
      this.startText = x.content;

      this.setEditorOptionsLanguage();

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
      this.refreshMarkers();
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
    public fileQuery: FileQuery,
    public structQuery: StructQuery,
    public uiQuery: UiQuery,
    public navQuery: NavQuery,
    public repoQuery: RepoQuery,
    public memberQuery: MemberQuery,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private confirmService: ConfirmService,
    private navigateService: NavigateService,
    private repoStore: RepoStore,
    private fileStore: FileStore,
    private navStore: NavStore,
    public structStore: StructStore,
    private uiStore: UiStore,
    private route: ActivatedRoute,
    private monacoService: MonacoProviderService
  ) {}

  async ngOnInit() {
    this.monaco = await this.monacoService.initMonaco();
    this.isLoadedMonaco = true;

    this.setEditorOptionsLanguage();
    this.refreshMarkers();
  }

  async onEditorChange(editor: editorType.IStandaloneCodeEditor) {
    this.editor = editor;

    if (this.isLoadedMonaco === false) {
      return;
    }

    this.setEditorOptionsLanguage();
    this.refreshMarkers();
    this.cd.detectChanges();
  }

  setEditorOptionsLanguage() {
    if (this.isLoadedMonaco === false || common.isUndefined(this.editor)) {
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
      this.file.fileId === common.MPROVE_CONFIG_FILENAME ||
      ((this.struct.mproveDirValue === common.MPROVE_CONFIG_DIR_DOT ||
        this.struct.mproveDirValue === common.MPROVE_CONFIG_DIR_DOT_SLASH ||
        (common.isDefined(mdir) &&
          this.file.fileNodeId.split(mdir)[0] === `${this.nav.projectId}/`)) &&
        constants.BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >=
          0)
    ) {
      let languageId = constants.YAML_LANGUAGE_ID;

      // this.monaco.languages.register({ id: languageId });
      this.monaco.languages.setMonarchTokensProvider(
        languageId,
        constants.BLOCKML_LANGUAGE_DATA
      );

      let schema: JSONSchema7 =
        this.file.fileId === common.MPROVE_CONFIG_FILENAME
          ? common.CONFIG_SCHEMA
          : dotExt === common.FileExtensionEnum.Dashboard
          ? common.DASHBOARD_SCHEMA
          : dotExt === common.FileExtensionEnum.Vis
          ? common.VISUALIZATION_SCHEMA
          : dotExt === common.FileExtensionEnum.Model
          ? common.MODEL_SCHEMA
          : dotExt === common.FileExtensionEnum.View
          ? common.VIEW_SCHEMA
          : dotExt === common.FileExtensionEnum.Udf
          ? common.UDF_SCHEMA
          : undefined;

      setDiagnosticsOptions({
        validate: true,
        completion: true,
        format: true,
        enableSchemaRequest: true,
        schemas: common.isDefined(schema)
          ? [
              {
                uri: schema.$id,
                fileMatch: ['*'],
                schema: schema
              }
            ]
          : []
      });

      this.monaco.editor.setModelLanguage(this.editor.getModel(), languageId);

      let patch: editorType.IStandaloneEditorConstructionOptions = {
        theme: constants.BLOCKML_THEME,
        renderValidationDecorations: 'on',
        readOnly: this.nav.isRepoProd,
        snippetSuggestions: 'none',
        suggestOnTriggerCharacters: true,
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
      let languageId =
        this.monaco.languages
          .getLanguages()
          .find(x => x.extensions?.indexOf(dotExt) > -1)?.id ||
        constants.MARKDOWN_LANGUAGE_ID;

      if (languageId === constants.YAML_LANGUAGE_ID) {
        // this.monaco.languages.register({ id: languageId });
        this.monaco.languages.setMonarchTokensProvider(
          languageId,
          constants.YAML_LANGUAGE_DATA
        );

        setDiagnosticsOptions({
          validate: false,
          completion: false,
          format: true,
          schemas: []
        });
      }

      this.monaco.editor.setModelLanguage(this.editor.getModel(), languageId);

      let patch: editorType.IStandaloneEditorConstructionOptions = {
        theme: constants.TEXTMATE_THEME,
        renderValidationDecorations: 'off',
        readOnly: this.nav.isRepoProd,
        snippetSuggestions: 'none',
        suggestOnTriggerCharacters: false,
        wordBasedSuggestions: false,
        quickSuggestions: false
      };

      this.editorOptions = Object.assign({}, this.editorOptions, patch);

      this.removeMarkers();
    }
    // workaround for diff editor, because it doesn't accept theme as option
    this.monaco.editor.setTheme(this.editorOptions.theme);
  }

  removeMarkers() {
    if (this.isLoadedMonaco === false || common.isUndefined(this.editor)) {
      return;
    }

    this.monaco.editor.setModelMarkers(this.editor.getModel(), 'Conflicts', []);
    this.monaco.editor.setModelMarkers(this.editor.getModel(), 'BlockML', []);
  }

  refreshMarkers() {
    if (this.isLoadedMonaco === false || common.isUndefined(this.editor)) {
      return;
    }

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
      let conflictMarkers: editorType.IMarkerData[] = [];
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
              message: `conflict`,
              severity: MarkerSeverity.Error
            });
          }
        });
      this.monaco.editor.setModelMarkers(
        this.editor.getModel(),
        'Conflicts',
        conflictMarkers
      );
    } else {
      let errorMarkers: editorType.IMarkerData[] = [];
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
                message: `${error.title}: ${error.message}`,
                severity: MarkerSeverity.Error
              });
            }
          })
      );
      this.monaco.editor.setModelMarkers(
        this.editor.getModel(),
        'BlockML',
        errorMarkers
      );
    }
  }

  onTextChanged() {
    this.removeMarkers();
    if (this.content === this.startText) {
      this.refreshMarkers();
    }

    if (!this.needSave && this.content !== this.startText) {
      this.uiStore.update(state =>
        Object.assign({}, state, <UiState>{ needSave: true })
      );
    } else if (this.needSave && this.content === this.startText) {
      this.uiStore.update(state =>
        Object.assign({}, state, <UiState>{ needSave: false })
      );
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
            console.log('resp.payload.repo.changesToCommit');
            console.log(resp.payload.repo.changesToCommit);
            console.log('resp.payload.repo.changesToPush');
            console.log(resp.payload.repo.changesToPush);

            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            this.startText = this.content;

            this.uiStore.update(state =>
              Object.assign({}, state, <UiState>{
                needSave: false,
                panel: common.PanelEnum.Tree
              })
            );

            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.content = this.startText;
    this.uiStore.update(state =>
      Object.assign({}, state, <UiState>{ needSave: false })
    );
  }

  async moveToLine(line: number) {
    setTimeout(() => {
      if (this.editor) {
        this.editor.revealLineInCenter(line);
        this.editor.setPosition({ column: 1, lineNumber: line });
      }
    }, 50);
  }

  goTo() {
    let ar = this.file.name.split('.');
    let ext = ar.pop();
    let id = ar.join('.');
    let dotExt = `.${ext}`;

    if (dotExt === common.FileExtensionEnum.Model) {
      this.navigateService.navigateToModel(id);
    }
    if (dotExt === common.FileExtensionEnum.Dashboard) {
      this.navigateService.navigateToDashboard(id);
    } else if (dotExt === common.FileExtensionEnum.Vis) {
      this.navigateService.navigateToVizs({
        extra: {
          queryParams: { search: id }
        }
      });
    }
  }

  canDeactivate(): Promise<boolean> | boolean {
    if (this.needSave === false) {
      return true;
    }

    return this.confirmService.confirm('Discard changes?').then(answer => {
      if (answer === true) {
        this.uiStore.update(state =>
          Object.assign({}, state, <UiState>{ needSave: false })
        );

        return true;
      } else {
        return false;
      }
    });
  }

  ngOnDestroy() {
    this.fileStore.reset();
  }
}
