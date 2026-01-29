import { CodeEditor, DiffEditor } from '@acrodata/code-editor';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { LanguageDescription } from '@codemirror/language';
import { Diagnostic, linter } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import {
  Annotation,
  Compartment,
  EditorSelection,
  EditorState,
  Extension,
  Transaction,
  TransactionSpec
} from '@codemirror/state';
import { EditorView, KeyBinding, keymap } from '@codemirror/view';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import {
  LIGHT_PLUS_THEME_EXTRA_DIFF,
  LIGHT_PLUS_THEME_EXTRA_DIFF_READ,
  LIGHT_PLUS_THEME_EXTRA_SINGLE,
  LIGHT_PLUS_THEME_EXTRA_SINGLE_READ,
  VS_LIGHT_THEME_EXTRA_DIFF,
  VS_LIGHT_THEME_EXTRA_DIFF_READ,
  VS_LIGHT_THEME_EXTRA_SINGLE,
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
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { PanelEnum } from '#common/enums/panel.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { decodeFilePath } from '#common/functions/decode-file-path';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { Member } from '#common/interfaces/backend/member';
import { ModelX } from '#common/interfaces/backend/model-x';
import {
  ToBackendGetChartRequestPayload,
  ToBackendGetChartResponse
} from '#common/interfaces/to-backend/charts/to-backend-get-chart';
import {
  ToBackendSaveFileRequestPayload,
  ToBackendSaveFileResponse
} from '#common/interfaces/to-backend/files/to-backend-save-file';
import {
  ToBackendGetModelsRequestPayload,
  ToBackendGetModelsResponse
} from '#common/interfaces/to-backend/models/to-backend-get-models';
import { FileQuery, FileState } from '#front/app/queries/file.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { ConfirmService } from '#front/app/services/confirm.service';
import { FileService } from '#front/app/services/file.service';
import {
  HighLightService,
  PlaceNameEnum
} from '#front/app/services/highlight.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';

interface HistoryEntry {
  fullDocContent: string;
  positionToA: number;
  positionToB: number;
}

export const malloyCommentToggle = Annotation.define<'toggle'>();

@Component({
  standalone: false,
  selector: 'm-file-editor',
  templateUrl: './file-editor.component.html'
})
export class FileEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  isEditorOptionsInitComplete = false;

  panelTree = PanelEnum.Tree;

  @ViewChild('codeEditor', { static: false })
  codeEditorRef: CodeEditor;

  @ViewChild('diffEditor', { static: false })
  diffEditorRef: DiffEditor;

  syncScrollCleanups: (() => void)[] = [];

  indentWithTab = true;
  indentUnit = '  ';

  languages: LanguageDescription[] = [];
  originalLanguages: LanguageDescription[] = [];

  lang: string;

  theme: Extension = VS_LIGHT_THEME_EXTRA_SINGLE;

  diagnostics: Diagnostic[] = [];

  customHistoryAnnotation = Annotation.define();
  maxHistoryOperations = 100;

  undoStack: HistoryEntry[] = [];
  redoStack: HistoryEntry[] = [];

  beforeChangeFilter = EditorState.transactionFilter.of(
    (transaction: Transaction): Transaction => {
      let trackedEvents: string[] = [
        'input',
        'input.type',
        'input.type.compose',
        'input.paste',
        'input.drop',
        'input.complete',
        'delete',
        'delete.selection',
        'delete.forward',
        'delete.backward',
        'delete.cut',
        'move',
        'move.drop',
        'select',
        'select.pointer',
        'comment',
        'uncomment'
      ];

      if (
        (transaction.annotation(malloyCommentToggle) ||
          trackedEvents.some(event => transaction.isUserEvent(event))) &&
        transaction.docChanged
      ) {
        // console.log('fileEditor - beforeChangeFilter - updateDocText ');

        if (transaction.annotation(this.customHistoryAnnotation)) {
          return transaction;
        }

        let positionToA: number;
        let positionToB: number;

        if (transaction.changes && !transaction.changes.empty) {
          transaction.changes.iterChanges(
            (fromA: number, toA: number, fromB: number, toB: number) => {
              if (positionToA === undefined) {
                positionToA = toA;
              }
              if (positionToB === undefined) {
                positionToB = toB;
              }
            }
          );
        }

        this.undoStack.push({
          fullDocContent: transaction.startState.doc.toString(),
          positionToA: positionToA,
          positionToB: positionToB
        });

        this.redoStack = [];

        if (this.undoStack.length > this.maxHistoryOperations) {
          this.undoStack.shift();
        }
      }

      return transaction;
    }
  );

  customUndo: (view: EditorView) => boolean = ({
    state,
    dispatch
  }: EditorView) => {
    if (this.undoStack.length === 0) {
      return false;
    }

    let undoOperation: HistoryEntry = this.undoStack.pop();

    let tr: TransactionSpec = {
      changes: {
        from: 0,
        to: state.doc.length,
        insert: undoOperation.fullDocContent
      },
      selection: EditorSelection.cursor(undoOperation.positionToA),
      annotations: [
        Transaction.userEvent.of('undo'),
        this.customHistoryAnnotation.of(true)
      ],
      scrollIntoView: true,
      effects: [
        EditorView.scrollIntoView(undoOperation.positionToA, {
          y: 'center',
          x: 'nearest'
        })
      ]
    };

    this.redoStack.push({
      fullDocContent: state.doc.toString(),
      positionToA: undoOperation.positionToA,
      positionToB: undoOperation.positionToB
    });

    if (this.redoStack.length > this.maxHistoryOperations) {
      this.redoStack.shift();
    }

    dispatch(state.update(tr));

    return true;
  };

  customRedo: (view: EditorView) => boolean = ({
    state,
    dispatch
  }: EditorView) => {
    if (this.redoStack.length === 0) {
      return false;
    }

    let redoOperation: HistoryEntry = this.redoStack.pop();

    let tr: TransactionSpec = {
      changes: {
        from: 0,
        to: state.doc.length,
        insert: redoOperation.fullDocContent
      },
      selection: EditorSelection.cursor(redoOperation.positionToB),
      annotations: [
        Transaction.userEvent.of('redo'),
        this.customHistoryAnnotation.of(true)
      ],
      scrollIntoView: true,
      effects: [
        EditorView.scrollIntoView(redoOperation.positionToB, {
          y: 'center',
          x: 'nearest',
          yMargin: 50,
          xMargin: 20
        })
      ]
    };

    this.undoStack.push({
      fullDocContent: state.doc.toString(),
      positionToA: redoOperation.positionToA,
      positionToB: redoOperation.positionToB
    });

    if (this.undoStack.length > this.maxHistoryOperations) {
      this.undoStack.shift();
    }

    dispatch(state.update(tr));

    return true;
  };

  malloyKeymap: KeyBinding[] = [
    {
      key: 'Cmd-/',
      run(view: EditorView) {
        let selection = view.state.selection;
        let changes: { from: number; to: number; insert: string }[] = [];

        if (selection.ranges.length === 1 && selection.main.empty) {
          // Single cursor: Handle as before (toggle the one line)
          let { from } = selection.main;
          let line = view.state.doc.lineAt(from);
          let lineText = view.state.doc.sliceString(line.from, line.to);

          let isCommented =
            lineText.startsWith('-- ') || lineText.startsWith('// ');
          let newLineText: string;
          if (isCommented) {
            let prefix = lineText.startsWith('-- ') ? '-- ' : '// ';
            let prefixLength = prefix.length;
            let newContent = lineText.slice(prefixLength);
            newLineText = newContent; // Remove prefix from most left
          } else {
            newLineText = '-- ' + lineText; // Add at most left (column 0)
          }
          changes.push({ from: line.from, to: line.to, insert: newLineText });
        } else {
          // Multi-line selection: Check if ALL lines are commented; if yes, uncomment all; else, comment all (double on already commented)
          let ranges = selection.ranges;
          let minLine = Infinity;
          let maxLine = -Infinity;

          // Find the overall line range
          for (let range of ranges) {
            let startLine = view.state.doc.lineAt(range.from).number;
            let endLine = view.state.doc.lineAt(range.to).number;
            minLine = Math.min(minLine, startLine);
            maxLine = Math.max(maxLine, endLine);
          }

          // Collect lines and check if all are commented
          let allCommented = true;
          let lineInfos: {
            line: any;
            lineText: string;
            isCommented: boolean;
            prefix?: string;
          }[] = [];

          for (let lineNum = minLine; lineNum <= maxLine; lineNum++) {
            let line = view.state.doc.line(lineNum);
            let lineText = view.state.doc.sliceString(line.from, line.to);

            let isCommented =
              lineText.startsWith('-- ') || lineText.startsWith('// ');
            let prefix = lineText.startsWith('-- ') ? '-- ' : '// ';

            lineInfos.push({
              line,
              lineText,
              isCommented,
              prefix
            });

            if (!isCommented) {
              allCommented = false;
            }
          }

          // Apply changes based on state
          let shouldUncomment = allCommented;
          for (let info of lineInfos) {
            let newLineText: string;
            if (shouldUncomment) {
              // Uncomment: Remove prefix from most left
              let prefixLength = info.prefix.length;
              let newContent = info.lineText.slice(prefixLength);
              newLineText = newContent;
            } else {
              // Comment: Add "-- " at most left (double if already)
              newLineText = '-- ' + info.lineText;
            }

            // Only add if changed
            if (newLineText !== info.lineText) {
              changes.push({
                from: info.line.from,
                to: info.line.to,
                insert: newLineText
              });
            }
          }
        }

        if (changes.length > 0) {
          view.dispatch({
            changes,
            annotations: malloyCommentToggle.of('toggle')
          });
        }

        return true;
      }
    }
  ];

  customHistoryKeymap: KeyBinding[] = [
    { key: 'Mod-z', run: this.customUndo, preventDefault: true },
    {
      key: 'Mod-y',
      mac: 'Mod-Shift-z',
      run: this.customRedo,
      preventDefault: true
    },
    { linux: 'Ctrl-Shift-z', run: this.customRedo, preventDefault: true }
  ];

  baseExtensions: Extension[] = [
    highlightSelectionMatches(),
    keymap.of([...defaultKeymap, ...searchKeymap, ...this.customHistoryKeymap])
  ];

  mainPrepExtensions: Extension[] = [
    ...this.baseExtensions,
    this.beforeChangeFilter
  ];

  mainExtensions: Extension[] = [];

  diffOriginalExtensions: Extension[] = [
    ...this.baseExtensions,
    EditorState.readOnly.of(true)
  ];

  diffModifiedExtensions: Extension[] = [
    ...this.baseExtensions,
    this.beforeChangeFilter,
    EditorState.readOnly.of(false),
    keymap.of([indentWithTab])
  ];

  originalExtensions: Extension[];
  modifiedExtensions: Extension[];

  line: number;

  showGoTo = false;

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  cachedCanDeactivateAnswerNoTimestamp: number;

  panel: PanelEnum;
  panel$ = this.uiQuery.panel$.pipe(
    tap(x => {
      this.panel = x;
      this.cd.detectChanges();

      if (this.panel === PanelEnum.Tree) {
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

      // console.log('this.file');
      // console.log(this.file);

      await this.setLanguage();

      this.cd.detectChanges();

      this.checkSelectedFile();

      this.undoStack = [];
      this.redoStack = [];

      this.originalContent = x.originalContent;
      this.content = x.content;
      this.startText = x.content;

      this.diffContent = {
        original: this.originalContent,
        modified: this.content
      };

      if (
        (this.panel === PanelEnum.ChangesToCommit ||
          this.panel === PanelEnum.ChangesToPush) &&
        isDefined(this.file.fileId)
      ) {
        this.setupDiffEditorSyncScroll();
      } else {
        this.cleanupSyncScroll();
      }

      this.cd.detectChanges();

      // console.log('fileEditor - file$ - updateDocText ');

      this.highLightService.updateDocText({
        placeName: PlaceNameEnum.Main,
        docText: x.content,
        shikiLanguage: this.lang?.toLowerCase(),
        shikiTheme: 'light-plus-extended',
        isThrottle: false
      });

      if (this.panel !== PanelEnum.Tree) {
        this.highLightService.updateDocText({
          placeName: PlaceNameEnum.Original,
          docText: x.originalContent,
          shikiLanguage: this.lang?.toLowerCase(),
          shikiTheme: 'light-plus-extended',
          isThrottle: false
        });
      }
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

  member: Member;
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

  workerTaskCompletedSubscription: Subscription;

  constructor(
    private fileQuery: FileQuery,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
    private fileService: FileService,
    private repoQuery: RepoQuery,
    private memberQuery: MemberQuery,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private highLightService: HighLightService,
    private confirmService: ConfirmService,
    private navigateService: NavigateService,
    private myDialogService: MyDialogService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.workerTaskCompletedSubscription = new Subscription();

    this.workerTaskCompletedSubscription.add(
      this.highLightService.workerTaskCompleted.subscribe(eventData => {
        if (eventData.placeName === PlaceNameEnum.Original) {
          this.updateDockAndDispatchOriginal();
        } else if (eventData.placeName === PlaceNameEnum.Main) {
          this.updateDockAndDispatch();
        }
      })
    );
  }

  initEditorOptions() {
    let mainLanguagesResult = this.highLightService.getLanguages({
      placeName: PlaceNameEnum.Main
    });

    let originalLanguagesResult = this.highLightService.getLanguages({
      placeName: PlaceNameEnum.Original
    });

    this.languages = mainLanguagesResult.languages;
    this.originalLanguages = originalLanguagesResult.languages;

    this.mainExtensions = [...this.mainPrepExtensions];

    this.isEditorOptionsInitComplete = true;

    this.setLanguage();

    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    this.moveMainEditorToLine();
  }

  setupDiffEditorSyncScroll() {
    setTimeout(() => {
      if (
        this.diffEditorRef?.mergeView?.a &&
        this.diffEditorRef?.mergeView?.b
      ) {
        let editorA = this.diffEditorRef.mergeView.a;
        let editorB = this.diffEditorRef.mergeView.b;

        this.cleanupSyncScroll();

        let isSyncing = false;

        let syncScrollHandler = (source: EditorView, target: EditorView) => {
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
      }
    });
  }

  cleanupSyncScroll() {
    this.syncScrollCleanups.forEach(cleanup => cleanup());
    this.syncScrollCleanups = [];
  }

  checkSelectedFile() {
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

    this.isSelectedFileValid = isUndefined(this.file.fileId)
      ? true
      : errorFileIds.indexOf(this.file.fileId) < 0;
  }

  async setLanguage() {
    if (
      isUndefined(this.file?.name) ||
      this.isEditorOptionsInitComplete === false
    ) {
      return;
    }

    this.showDiff = false;

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

    this.file = this.fileQuery.getValue();

    let ar = this.file.name.split('.');
    let ext = ar.pop();
    let dotExt = `.${ext}`;

    let language: any;
    let originalLanguage: any;

    if (BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >= 0) {
      this.lang = 'YAML';
      language = this.languages.find((x: any) => x.name === this.lang);
      originalLanguage = this.originalLanguages.find(
        (x: any) => x.name === this.lang
      );
    } else {
      language = this.languages.find(
        (x: any) => x.extensions.indexOf(ext) > -1
      );
      originalLanguage = this.originalLanguages.find(
        (x: any) => x.extensions.indexOf(ext) > -1
      );

      this.lang = language?.name;
    }

    if (
      this.lang === 'malloy' ||
      this.lang === 'malloysql' ||
      this.lang === 'malloynb'
    ) {
      // also in createLinter()
      this.mainExtensions = [
        ...this.mainPrepExtensions,
        keymap.of([...this.malloyKeymap])
      ];
    }

    let nav = this.navQuery.getValue();

    this.theme =
      LIGHT_PLUS_LANGUAGES.indexOf(this.lang?.toLowerCase()) > -1
        ? nav.isRepoProd === true
          ? LIGHT_PLUS_THEME_EXTRA_SINGLE_READ
          : LIGHT_PLUS_THEME_EXTRA_SINGLE
        : nav.isRepoProd === true
          ? VS_LIGHT_THEME_EXTRA_SINGLE_READ
          : VS_LIGHT_THEME_EXTRA_SINGLE;

    let themeDIff =
      LIGHT_PLUS_LANGUAGES.indexOf(this.lang?.toLowerCase()) > -1
        ? nav.isRepoProd === true
          ? LIGHT_PLUS_THEME_EXTRA_DIFF_READ
          : LIGHT_PLUS_THEME_EXTRA_DIFF
        : nav.isRepoProd === true
          ? VS_LIGHT_THEME_EXTRA_DIFF_READ
          : VS_LIGHT_THEME_EXTRA_DIFF;

    let originalExtensions = [...this.diffOriginalExtensions, themeDIff];
    let modifiedExtensions =
      this.lang === 'malloy' ||
      this.lang === 'malloysql' ||
      this.lang === 'malloynb'
        ? [
            ...this.diffModifiedExtensions,
            themeDIff,
            keymap.of([...this.malloyKeymap])
          ]
        : [...this.diffModifiedExtensions, themeDIff];

    if (isDefined(language)) {
      let loadedLanguage = await language.load(); // language.support
      let originalLoadedLanguage = await originalLanguage.load();

      let modifiedLanguageConf = new Compartment();
      let originalLanguageConf = new Compartment();

      modifiedExtensions.push(modifiedLanguageConf.of(loadedLanguage));
      originalExtensions.push(originalLanguageConf.of(originalLoadedLanguage));
    }

    this.modifiedExtensions = modifiedExtensions;
    this.originalExtensions = originalExtensions;

    if (
      this.file.fileId === MPROVE_CONFIG_FILENAME ||
      ((this.struct.mproveConfig.mproveDirValue ===
        MPROVE_CONFIG_DIR_DOT_SLASH ||
        (isDefined(mdir) &&
          this.file.fileNodeId.split(mdir)[0] === `${this.nav.projectId}/`)) &&
        [...BLOCKML_EXT_LIST, '.malloy']
          .map(ex => ex.toString())
          .indexOf(dotExt) >= 0)
    ) {
      this.showGoTo = true;

      this.refreshMarkers();
    } else {
      this.showGoTo = false;

      this.removeMarkers();
    }

    setTimeout(() => {
      this.showDiff = true;
      this.cd.detectChanges();
    }, 0);
  }

  removeMarkers() {
    if (this.panel !== PanelEnum.Tree) {
      return;
    }

    this.diagnostics = [];
    this.createLinter();
  }

  refreshMarkers() {
    if (this.panel !== PanelEnum.Tree) {
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
          if (cLineNumber !== 0 && cLineNumber <= tempDoc.lines) {
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

            let filePath = lineFileIdAr.join('/');

            let fileId = encodeFilePath({ filePath: filePath });
            return fileId === this.file.fileId;
          })
          .map(eLine => {
            if (eLine.lineNumber !== 0 && eLine.lineNumber <= tempDoc.lines) {
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

    // also in setLanguage()
    this.mainExtensions =
      this.lang === 'malloy' ||
      this.lang === 'malloysql' ||
      this.lang === 'malloynb'
        ? [
            ...this.mainPrepExtensions,
            keymap.of([...this.malloyKeymap]),
            linterExtension
          ]
        : [...this.mainPrepExtensions, linterExtension];
  }

  onOriginalTextChanged() {
    // console.log('fileEditor - onOriginalTextChanged');

    if (this.panel !== PanelEnum.Tree) {
      this.highLightService.updateDocText({
        placeName: PlaceNameEnum.Original,
        docText: this.originalContent,
        shikiLanguage: this.lang?.toLowerCase(),
        shikiTheme: 'light-plus-extended',
        isThrottle: true
      });
    }
  }

  onTextChanged(item: { isDiffEditor: boolean }) {
    let { isDiffEditor } = item;

    // console.log('fileEditor - onTextChanged');

    if (isDiffEditor === true) {
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

    this.highLightService.updateDocText({
      placeName: PlaceNameEnum.Main,
      docText: this.content,
      shikiLanguage: this.lang?.toLowerCase(),
      shikiTheme: 'light-plus-extended',
      isThrottle: true
    });
  }

  updateDockAndDispatchOriginal() {
    // console.log('fileEditor - updateDockAndDispatchOriginal - updateDocText');

    this.highLightService.updateDocText({
      placeName: PlaceNameEnum.Original,
      docText: this.originalContent,
      shikiLanguage: this.lang?.toLowerCase(),
      shikiTheme: 'light-plus-extended',
      isThrottle: false
    });

    let editorV = this.diffEditorRef.mergeView.a;

    let transaction = editorV.state.update({
      changes: {
        from: 0,
        to: editorV.state.doc.length,
        insert: editorV.state.doc.toString()
      },
      selection: editorV.state.selection,
      scrollIntoView: false
    });

    editorV.dispatch(transaction);
  }

  updateDockAndDispatch() {
    // console.log('fileEditor - updateDockAndDispatch - updateDocText');

    this.highLightService.updateDocText({
      placeName: PlaceNameEnum.Main,
      docText: this.content,
      shikiLanguage: this.lang?.toLowerCase(),
      shikiTheme: 'light-plus-extended',
      isThrottle: false
    });

    let editorV =
      this.panel === PanelEnum.Tree
        ? this.codeEditorRef.view
        : this.diffEditorRef.mergeView.b;

    let currentScrollTop = editorV.scrollDOM.scrollTop;

    let transaction = editorV.state.update({
      changes: {
        from: 0,
        to: editorV.state.doc.length,
        insert: editorV.state.doc.toString()
      },
      selection: editorV.state.selection,
      scrollIntoView: false
    });

    editorV.dispatch(transaction);

    requestAnimationFrame(() => {
      editorV.scrollDOM.scrollTop = currentScrollTop;
    });
  }

  save() {
    let fileNodeId =
      this.nav.projectId + '/' + decodeFilePath({ filePath: this.file.fileId });

    let payload: ToBackendSaveFileRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fileNodeId: fileNodeId,
      content: this.content
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveFile,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSaveFileResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.startText = this.content;

            this.undoStack = [];
            this.redoStack = [];

            this.uiQuery.updatePart({
              needSave: false,
              panel: PanelEnum.Tree
            });

            this.navigateService.navigateToFileLine({
              panel: PanelEnum.Tree,
              encodedFileId: this.file.fileId
            });

            let secondFileNodeId = this.uiQuery.getValue().secondFileNodeId;

            if (isDefined(secondFileNodeId)) {
              let secondFilePathAr = secondFileNodeId.split('/');
              secondFilePathAr.shift();

              let secondFileEncodedFileId = encodeFilePath({
                filePath: secondFilePathAr.join('/')
              });

              if (this.file.fileId === secondFileEncodedFileId) {
                this.fileService.refreshSecondFile();
              }
            }

            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    // console.log('fileEditor - cancel - updateDocText');

    this.highLightService.updateDocText({
      placeName: PlaceNameEnum.Main,
      docText: this.content,
      shikiLanguage: this.lang?.toLowerCase(),
      shikiTheme: 'light-plus-extended',
      isThrottle: false
    });

    this.undoStack = [];
    this.redoStack = [];

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
        isDefinedAndNotEmpty(this.content) &&
        isDefined(this.line) &&
        isDefined(editorView)
      ) {
        let lineNumber = this.line;

        let lines = this.content.split('\n');

        if (lineNumber < 1 || lineNumber > lines.length) {
          return;
        }

        try {
          let line = editorView.state.doc.line(lineNumber);

          editorView.dispatch({
            selection: { anchor: line.from },
            effects: EditorView.scrollIntoView(line.from, { y: 'center' })
          });
        } catch (error) {
          console.warn(`Failed to scroll to line ${lineNumber}:`, error);
        }
      }
    }, 0);
  }

  goTo() {
    let uiState = this.uiQuery.getValue();

    let ar = this.file.name.split('.');
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
                y => y.filePath === this.file.fileNodeId
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

  canDeactivate(): Promise<boolean> | boolean {
    // prevents the dialog from trigger twice after cancel clicked
    if (
      this.cachedCanDeactivateAnswerNoTimestamp > 0 &&
      Date.now() - this.cachedCanDeactivateAnswerNoTimestamp < 500
    ) {
      this.cachedCanDeactivateAnswerNoTimestamp = 0;
      return false;
    }

    this.cachedCanDeactivateAnswerNoTimestamp = 0;

    if (this.needSave === false) {
      return true;
    }

    return this.confirmService.confirm('Discard changes?').then(answer => {
      if (answer === true) {
        this.uiQuery.updatePart({ needSave: false });
        return true;
      } else {
        this.cachedCanDeactivateAnswerNoTimestamp = Date.now();
        return false;
      }
    });
  }

  ngOnDestroy() {
    this.workerTaskCompletedSubscription?.unsubscribe();

    this.fileQuery.reset();
    this.cleanupSyncScroll();
  }
}
