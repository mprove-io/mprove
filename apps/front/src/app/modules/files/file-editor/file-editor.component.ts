import { CodeEditor, DiffEditor } from '@acrodata/code-editor';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { standardKeymap } from '@codemirror/commands';
import { LanguageDescription } from '@codemirror/language';
import { Diagnostic, linter } from '@codemirror/lint';
import { EditorState, Extension } from '@codemirror/state';
import { Compartment } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { NgxSpinnerService } from 'ngx-spinner';
import { filter, map, take, tap } from 'rxjs/operators';
import {
  LIGHT_PLUS_THEME_EXTRA,
  LIGHT_PLUS_THEME_EXTRA_MOD
} from '~front/app/constants/code-themes/light-plus-theme';
import {
  VS_LIGHT_THEME_EXTRA,
  VS_LIGHT_THEME_EXTRA_MOD
} from '~front/app/constants/code-themes/vs-light-theme';
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
  standalone: false,
  selector: 'm-file-editor',
  templateUrl: './file-editor.component.html'
})
export class FileEditorComponent implements OnDestroy, AfterViewInit {
  isEditorOptionsInitComplete = false;

  panelTree = common.PanelEnum.Tree;

  @ViewChild('codeEditor', { static: false })
  codeEditorRef: CodeEditor;

  @ViewChild('diffEditor', { static: false })
  diffEditorRef: DiffEditor;

  syncScrollCleanups: (() => void)[] = [];

  indentWithTab = true;
  indentUnit = '  ';

  languages: LanguageDescription[] = [];
  lang: string;

  theme: Extension = VS_LIGHT_THEME_EXTRA_MOD;

  diagnostics: Diagnostic[] = [];

  baseExtensions: Extension[] = [keymap.of(standardKeymap)];

  mainPrepExtensions: Extension[] = [...this.baseExtensions];
  mainExtensions: Extension[] = [];

  diffOriginalExtensions: Extension[] = [
    ...this.baseExtensions,
    EditorState.readOnly.of(true)
  ];

  diffModifiedExtensions: Extension[] = [
    ...this.baseExtensions,
    EditorState.readOnly.of(false)
  ];

  originalExtensions: Extension[];
  modifiedExtensions: Extension[];

  line: number;

  showGoTo = false;

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  panel: common.PanelEnum;
  panel$ = this.uiQuery.panel$.pipe(
    tap(x => {
      this.panel = x;
      this.cd.detectChanges();

      if (this.panel === common.PanelEnum.Tree) {
        // console.log('panel$ cleanupSyncScroll');
        this.cleanupSyncScroll();
      }
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  originalContent: string;
  content: string;

  showDiff = false;

  diffContent: { original: string; modified: string } = {
    original: '',
    modified: ''
  };

  startText: string;
  specialText: string;

  isSelectedFileValid = true;

  file: FileState;
  file$ = this.fileQuery.select().pipe(
    tap(async x => {
      this.file = x;

      this.originalContent = x.originalContent;
      this.content = x.content;
      this.startText = x.content;

      this.diffContent = {
        original: this.originalContent,
        modified: this.content
      };

      await this.setEditorOptionsLanguage();
      this.checkSelectedFile();

      if (
        (this.panel === common.PanelEnum.ChangesToCommit ||
          this.panel === common.PanelEnum.ChangesToPush) &&
        common.isDefined(this.file.fileId)
      ) {
        // console.log('file$ setupDiffEditorSyncScroll');
        this.setupDiffEditorSyncScroll();
      } else {
        // console.log('file$ cleanupSyncScroll');
        this.cleanupSyncScroll();
      }

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
      this.moveMainEditorToLine();
    })
  );

  fileId$ = this.fileQuery.fileId$.pipe(
    filter(v => !!v),
    tap((fileId: string) => {
      this.moveMainEditorToLine();
    })
  );

  member: common.Member;
  member$ = this.memberQuery.select().pipe(
    tap(x => {
      this.member = x;
      this.cd.detectChanges();
    })
  );

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
    private route: ActivatedRoute
  ) {}

  initEditorOptions() {
    // let malloyLanguage = createLightLanguage(this.isHighlighterReady);
    // let ls = new LanguageSupport(malloyLanguage);
    // let malloyLanguageDescription = LanguageDescription.of({
    //   name: 'Malloy',
    //   alias: ['malloy'],
    //   extensions: ['malloy'],
    //   support: ls
    // });
    // this.languages = [...languageData.languages, malloyLanguageDescription];
    // // let mainLanguageConf = new Compartment();
    // // this.mainPrepExtensions = [...this.baseExtensions, mainLanguageConf.of(ls)];
    // this.mainExtensions = [...this.mainPrepExtensions];
    // this.isEditorOptionsInitComplete = true;
    // this.setEditorOptionsLanguage();
    // this.cd.detectChanges();
  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit');
    this.moveMainEditorToLine();
    // this.setupDiffEditorSyncScroll();
  }

  setupDiffEditorSyncScroll() {
    setTimeout(() => {
      // console.log('setupDiffEditorSyncScroll');

      if (
        this.diffEditorRef?.mergeView?.a &&
        this.diffEditorRef?.mergeView?.b
      ) {
        let editorA = this.diffEditorRef.mergeView.a;
        let editorB = this.diffEditorRef.mergeView.b;

        this.cleanupSyncScroll();

        let isSyncing = false;

        let syncScrollHandler = (source: EditorView, target: EditorView) => {
          // console.log('isSyncing');
          // console.log(isSyncing);
          return () => {
            if (isSyncing === true) {
              return;
            }
            isSyncing = true;
            target.scrollDOM.scrollTop = source.scrollDOM.scrollTop;
            requestAnimationFrame(() => (isSyncing = false));
          };
        };

        let aToB = syncScrollHandler(editorA, editorB);
        let bToA = syncScrollHandler(editorB, editorA);

        editorA.scrollDOM.addEventListener('scroll', aToB);
        editorB.scrollDOM.addEventListener('scroll', bToA);

        this.syncScrollCleanups.push(
          () => editorA.scrollDOM.removeEventListener('scroll', aToB),
          () => editorB.scrollDOM.removeEventListener('scroll', bToA)
        );

        // Initial sync
        editorB.scrollDOM.scrollTop = editorA.scrollDOM.scrollTop;
      } else {
        console.warn('Diff editor is not defined');
        // setTimeout(() => this.setupDiffEditorSyncScroll(), 1000);
      }
    });
  }

  cleanupSyncScroll() {
    // console.log('cleanupSyncScroll');
    this.syncScrollCleanups.forEach(cleanup => cleanup());
    this.syncScrollCleanups = [];
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

  async setEditorOptionsLanguage() {
    if (
      common.isUndefined(this.file?.name) ||
      this.isEditorOptionsInitComplete === false
    ) {
      return;
    }

    this.showDiff = false;

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

    this.file = this.fileQuery.getValue();

    let ar = this.file.name.split('.');
    let ext = ar.pop();
    let dotExt = `.${ext}`;

    let language: any;

    if (
      constants.BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >= 0
    ) {
      this.lang = 'YAML';
      language = this.languages.find((x: any) => x.name === this.lang);
    } else {
      language = this.languages.find(
        (x: any) => x.extensions.indexOf(ext) > -1
      );

      this.lang = language?.name;
    }

    this.theme =
      this.lang === 'Malloy'
        ? LIGHT_PLUS_THEME_EXTRA_MOD
        : VS_LIGHT_THEME_EXTRA_MOD;

    let themeExtra =
      this.lang === 'Malloy' ? LIGHT_PLUS_THEME_EXTRA : VS_LIGHT_THEME_EXTRA;

    let originalExtensions = [...this.diffOriginalExtensions, themeExtra];
    let modifiedExtensions = [...this.diffModifiedExtensions, themeExtra];

    if (common.isDefined(language)) {
      let loadedLanguage = await language.load();
      // console.log('loadedLanguage');
      // console.log(loadedLanguage);

      let originalLanguageConf = new Compartment();
      let modifiedLanguageConf = new Compartment();

      originalExtensions.push(originalLanguageConf.of(loadedLanguage));
      modifiedExtensions.push(modifiedLanguageConf.of(loadedLanguage));
    }

    this.originalExtensions = originalExtensions;
    this.modifiedExtensions = modifiedExtensions;

    if (
      this.file.fileId === common.MPROVE_CONFIG_FILENAME ||
      ((this.struct.mproveDirValue === common.MPROVE_CONFIG_DIR_DOT_SLASH ||
        (common.isDefined(mdir) &&
          this.file.fileNodeId.split(mdir)[0] === `${this.nav.projectId}/`)) &&
        constants.BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >=
          0)
    ) {
      this.showGoTo = true;

      this.refreshMarkers();
    } else {
      this.showGoTo = false;

      this.removeMarkers();
    }
    this.cd.detectChanges();

    setTimeout(() => {
      this.showDiff = true;
      this.cd.detectChanges();
    }, 0);
  }

  removeMarkers() {
    if (this.panel !== common.PanelEnum.Tree) {
      return;
    }

    this.diagnostics = [];
    this.createLinter();
  }

  refreshMarkers() {
    if (this.panel !== common.PanelEnum.Tree) {
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

    let tempDoc = this.getEditorDocument();

    if (this.repo.conflicts.length > 0) {
      let conflictMarkers: Diagnostic[] = [];

      this.repo.conflicts
        .filter(x => x.fileId === this.file.fileId)
        .map(x => x.lineNumber)
        .forEach(cLineNumber => {
          if (cLineNumber !== 0) {
            let line = tempDoc.line(cLineNumber);

            conflictMarkers.push({
              from: line.from,
              to: line.to,
              message: `conflict`,
              severity: 'error'
            });
          }
        });

      this.diagnostics = conflictMarkers;
    } else {
      let errorMarkers: Diagnostic[] = [];

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
              let line = tempDoc.line(eLine.lineNumber);

              errorMarkers.push({
                from: line.from,
                to: line.to,
                message: `${error.title}: ${error.message}`,
                severity: 'error'
              });
            }
          })
      );

      this.diagnostics = errorMarkers;
    }

    this.createLinter();
  }

  getEditorDocument() {
    let state = EditorState.create({ doc: this.content });
    return state.doc;
  }

  createLinter() {
    let linterExtension = linter((view: EditorView) => this.diagnostics);
    this.mainExtensions = [...this.mainPrepExtensions, linterExtension];
  }

  onTextChanged(item: { isDiffEditor: boolean }) {
    if (item.isDiffEditor === true) {
      this.content = this.diffContent.modified;
    }

    if (this.content === this.startText) {
      this.refreshMarkers();
    } else {
      this.removeMarkers();
    }

    if (!this.needSave && this.content !== this.startText) {
      this.uiQuery.updatePart({ needSave: true });
    } else if (this.needSave && this.content === this.startText) {
      this.uiQuery.updatePart({ needSave: false });
    }

    this.cd.detectChanges();
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

  moveMainEditorToLine() {
    setTimeout(() => {
      let editorView = this.codeEditorRef?.view;

      if (
        common.isDefinedAndNotEmpty(this.content) &&
        common.isDefined(this.line) &&
        common.isDefined(editorView)
      ) {
        let lineNumber = this.line;

        let lines = this.content.split('\n');

        if (lineNumber < 1 || lineNumber > lines.length) {
          console.warn(
            `Invalid line number: ${lineNumber}. Must be between 1 and ${lines.length}.`
          );
          return;
        }

        try {
          let line = editorView.state.doc.line(lineNumber);

          editorView.dispatch({
            effects: EditorView.scrollIntoView(line.from, { y: 'center' })
          });
        } catch (error) {
          console.warn(`Failed to scroll to line ${lineNumber}:`, error);
        }

        // if (this.editor) {
        //   this.editor.revealLineInCenter(line);
        //   this.editor.setPosition({ column: 1, lineNumber: line });
        // }
      }
    }, 0);
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
    // console.log('ngOnDestroy cleanupSyncScroll');
    this.cleanupSyncScroll();
  }
}
