import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MonacoEditorLoaderService } from '@materia-ui/ngx-monaco-editor';
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
export class FileEditorComponent implements OnDestroy {
  line = 1;

  editor: monaco.editor.IStandaloneCodeEditor = null;

  languages: monaco.languages.ILanguageExtensionPoint[] = [];

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    // automaticLayout: true,
    fontSize: 16,
    language: constants.DEFAULT_LANGUAGE_NAME,
    theme: constants.DEFAULT_THEME_NAME,
    renderValidationDecorations: 'off',
    // suggestFontSize:  undefined,
    // suggestLineHeight: undefined,
    // suggestSelection: undefined,
    // quickSuggestionsDelay: undefined,
    // acceptSuggestionOnCommitCharacter: undefined,
    // acceptSuggestionOnEnter: undefined,
    // inlineSuggest: undefined,
    // suggest: undefined,
    snippetSuggestions: 'none',
    suggestOnTriggerCharacters: false,
    quickSuggestions: false,
    wordBasedSuggestionsOnlySameLanguage: true,
    wordBasedSuggestions: false
  };

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  originalText: string;
  content: string;
  specialText: string;

  file: FileState;
  file$ = this.fileQuery.select().pipe(
    tap(x => {
      this.file = x;
      this.content = x.content;
      this.originalText = x.content;

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

  isLoadedMonaco = false;

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
    private monacoEditorLoaderService: MonacoEditorLoaderService
  ) {
    this.monacoEditorLoaderService.isMonacoLoaded$
      .pipe(
        filter(isLoaded => isLoaded),
        take(1)
      )
      .subscribe(async () => {
        monaco.languages.register({ id: constants.BLOCKML_LANGUAGE_NAME });

        // monaco.languages.setMonarchTokensProvider(
        //   constants.BLOCKML_LANGUAGE_NAME,
        //   constants.BLOCKML_YAML_LANGUAGE
        // );

        monaco.editor.defineTheme(
          constants.BLOCKML_TEXTMATE_THEME_NAME,
          constants.BLOCKML_TEXTMATE_THEME as any
        );

        this.languages = monaco.languages.getLanguages();

        this.isLoadedMonaco = true;

        this.setEditorOptionsLanguage();
      });
  }

  async onEditorInit(editor: any) {
    this.editor = editor;

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    this.editor.updateOptions({ readOnly: nav.isRepoProd });

    this.editor.getModel().updateOptions({ tabSize: 2 });

    this.refreshMarkers();
  }

  removeMarkers() {
    if (!this.editor || !this.editor.getModel()) {
      return;
    }
    monaco.editor.setModelMarkers(this.editor.getModel(), 'Conflicts', []);
    monaco.editor.setModelMarkers(this.editor.getModel(), 'BlockML', []);
  }

  refreshMarkers() {
    if (!this.editor || !this.editor.getModel()) {
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
      let conflictMarkers: monaco.editor.IMarkerData[] = [];

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
              severity: monaco.MarkerSeverity.Error
            });
          }
        });

      monaco.editor.setModelMarkers(
        this.editor.getModel(),
        'Conflicts',
        conflictMarkers
      );
    } else {
      let errorMarkers: monaco.editor.IMarkerData[] = [];

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
                severity: monaco.MarkerSeverity.Error
              });
            }
          })
      );

      monaco.editor.setModelMarkers(
        this.editor.getModel(),
        'BlockML',
        errorMarkers
      );
    }
  }

  onTextChanged() {
    this.removeMarkers();
    if (this.content === this.originalText) {
      this.refreshMarkers();
    }

    if (!this.needSave && this.content !== this.originalText) {
      this.uiStore.update(state =>
        Object.assign({}, state, <UiState>{ needSave: true })
      );
    } else if (this.needSave && this.content === this.originalText) {
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
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            this.originalText = this.content;
            this.uiStore.update(state =>
              Object.assign({}, state, <UiState>{ needSave: false })
            );
            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.content = this.originalText;
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
    // console.log('canDeactivateFileEditor');
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

  setEditorOptionsLanguage() {
    if (this.isLoadedMonaco === false) {
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
      (this.file.fileId === common.MPROVE_CONFIG_FILENAME ||
        (common.isDefined(mdir) &&
          this.file.fileNodeId.split(mdir)[0] === `${this.nav.projectId}/`) ||
        this.struct.mproveDirValue === common.MPROVE_CONFIG_DIR_DOT ||
        this.struct.mproveDirValue === common.MPROVE_CONFIG_DIR_DOT_SLASH) &&
      constants.YAML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >= 0
    ) {
      monaco.editor.setTheme(constants.BLOCKML_TEXTMATE_THEME_NAME);

      let patch: monaco.editor.IStandaloneEditorConstructionOptions = {
        language: constants.BLOCKML_LANGUAGE_NAME,
        theme: constants.BLOCKML_TEXTMATE_THEME_NAME,
        renderValidationDecorations: 'on'
      };

      this.editorOptions = Object.assign({}, this.editorOptions, patch);
      this.refreshMarkers();
    } else {
      let langId;

      this.languages.forEach(language => {
        if (language.extensions?.indexOf(dotExt) > -1) {
          langId = language.id;
          return;
        }
      });

      monaco.editor.setTheme(constants.DEFAULT_THEME_NAME);
      // monaco.editor.set

      let patch: monaco.editor.IStandaloneEditorConstructionOptions = {
        language: common.isDefined(langId)
          ? langId
          : constants.DEFAULT_LANGUAGE_NAME,
        theme: constants.DEFAULT_THEME_NAME,
        renderValidationDecorations: 'off'
      };

      this.editorOptions = Object.assign({}, this.editorOptions, patch);
      this.removeMarkers();
    }
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyFileEditor');
    this.fileStore.reset();
  }
}
