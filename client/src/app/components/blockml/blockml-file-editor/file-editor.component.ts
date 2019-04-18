// tslint:disable-next-line:no-reference
/// <reference path="../../../../../node_modules/ngx-monaco-editor/monaco.d.ts" />

import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take, tap, map } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-file-editor',
  templateUrl: 'file-editor.component.html',
  styleUrls: ['file-editor.component.scss']
})
export class FileEditorComponent implements OnDestroy {
  fileEditorTheme: string = null;

  editorOptions = {
    // automaticLayout: true,
    theme: this.fileEditorTheme,
    fontSize: 16,
    language: 'yaml'
  };

  editor: monaco.editor.IStandaloneCodeEditor = null;

  text: string = '';
  code: string = '';
  specialText: string = '';

  errorsLines: Array<{ line_num: number; info: string }> = [];
  conflictsLines: number[] = [];

  isDev$ = this.store.select(selectors.getLayoutModeIsDev); // no filter here

  needSave: boolean = false;
  needSave$ = this.store
    .select(selectors.getLayoutNeedSave)
    .pipe(tap(x => (this.needSave = x))); // no filter here

  fileContent$ = this.store
    .select(selectors.getSelectedProjectModeRepoFileContent)
    .pipe(
      tap(x => {
        this.specialText = x;

        if (this.needSave === false) {
          this.code = x;
          this.text = x;
        }
      }) // no filter here
    );

  fileLastPath$ = this.store
    .select(selectors.getSelectedProjectModeRepoFileLastPath)
    .pipe(filter(v => !!v));

  fileErrorsLines$ = this.store
    .select(selectors.getSelectedProjectModeRepoFileErrorsLines)
    .pipe(
      filter(v => !!v),
      tap(x => {
        this.errorsLines = x;
        this.refreshMarkers();
      })
    );

  fileConflictsLines$ = this.store
    .select(selectors.getSelectedProjectModeRepoFileConflictsLines)
    .pipe(
      filter(v => !!v),
      tap(x => {
        this.conflictsLines = x;
        this.refreshMarkers();
      })
    );

  fileEditorTheme$ = this.store.select(selectors.getUserFileTheme).pipe(
    filter(v => !!v),
    tap(x => {
      this.fileEditorTheme =
        x === api.UserFileThemeEnum.Light ? 'vs' : 'vs-dark';

      if (this.editor) {
        monaco.editor.setTheme(this.fileEditorTheme);
      }
    })
  );

  line: number;

  routeLine$ = this.route.queryParams.pipe(
    tap(params => {
      this.line = Number(params['line'] ? params['line'] : 1);
      this.moveToLine();
    })
  );

  fileId$ = this.store.select(selectors.getSelectedProjectModeRepoFileId).pipe(
    filter(v => !!v),
    tap((fileId: string) => {
      this.moveToLine();
    })
  );
  fileIsView$ = this.store.select(
    selectors.getSelectedProjectModeRepoFileIsView
  ); // no filter

  fileViewJoins: Array<{ model: api.Model; join_as: string }> = [];
  fileViewJoins$ = this.store
    .select(selectors.getSelectedProjectModeRepoFileViewJoins)
    .pipe(
      filter(v => !!v),
      tap(x => {
        this.fileViewJoins = x;
      })
    );

  fileIsModel$ = this.store.select(
    selectors.getSelectedProjectModeRepoFileIsModel
  ); // no filter
  fileIsDashboard$ = this.store.select(
    selectors.getSelectedProjectModeRepoFileIsDashboard
  ); // no filter

  fileModelExist$ = this.store.select(
    selectors.getSelectedProjectModeRepoFileModelExist
  ); // no filter
  fileDashboardExist$ = this.store.select(
    selectors.getSelectedProjectModeRepoFileDashboardExist
  ); // no filter

  constructor(
    private store: Store<interfaces.AppState>,
    private printer: services.PrinterService,
    private dialogService: services.DialogService,
    private navigateService: services.NavigateService,
    private route: ActivatedRoute
  ) {}

  async onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;

    let modeIsDev: boolean;
    this.store
      .select(selectors.getLayoutModeIsDev)
      .pipe(take(1))
      .subscribe(x => (modeIsDev = x));

    monaco.editor.setTheme(this.fileEditorTheme);

    this.editor.updateOptions({
      readOnly: !modeIsDev
    });

    this.editor.getModel().updateOptions({
      tabSize: 2
    });

    this.refreshMarkers();
  }

  canDeactivate(): Promise<boolean> | boolean {
    // used in component-deactivate-guard
    this.printer.log(
      enums.busEnum.CAN_DEACTIVATE_CHECK,
      'from FileEditorComponent'
    );

    let needSave: boolean;
    this.store
      .select(selectors.getLayoutNeedSave)
      .pipe(take(1))
      .subscribe(x => (needSave = x));

    if (needSave) {
      return this.dialogService.confirm('Discard changes?').then(answer => {
        if (answer === true) {
          this.store.dispatch(new actions.SetLayoutNeedSaveFalseAction());
          return true;
        } else {
          return false;
        }
      });
    } else {
      return true;
    }
  }

  ngOnDestroy() {
    this.store.dispatch(new actions.UpdateLayoutFileIdAction(undefined));
  }

  async moveToLine() {
    setTimeout(() => {
      if (this.editor) {
        this.editor.revealLineInCenter(this.line);
        this.editor.setPosition({ column: 1, lineNumber: this.line });
      }
    }, 50);
  }

  goToFileModel(): void {
    this.store
      .select(selectors.getSelectedProjectModeRepoFile)
      .pipe(take(1))
      .subscribe(selectedFile => {
        const [name, ext] = selectedFile.name.split('.');

        this.navigateService.navigateModel(name);
      });
  }

  goToFileDashboard(): void {
    this.store
      .select(selectors.getSelectedProjectModeRepoFile)
      .pipe(take(1))
      .subscribe(selectedFile => {
        const [name, ext] = selectedFile.name.split('.');

        this.navigateService.navigateDashboard(name);
      });
  }

  goToModelFromView(modelId: string, joinAs: string) {
    this.navigateService.navigateModel(modelId, joinAs);
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

    let repoIsNeedResolve: boolean;
    this.store
      .select(selectors.getSelectedProjectModeRepoIsNeedResolve)
      .pipe(take(1))
      .subscribe(x => (repoIsNeedResolve = x));

    if (repoIsNeedResolve) {
      let conflictMarkers: monaco.editor.IMarkerData[] = [];

      this.conflictsLines.forEach(cLine => {
        if (cLine !== 0) {
          conflictMarkers.push({
            startLineNumber: cLine,
            endLineNumber: cLine,
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
      this.errorsLines.forEach(eLine => {
        if (eLine.line_num !== 0) {
          errorMarkers.push({
            startLineNumber: eLine.line_num,
            endLineNumber: eLine.line_num,
            startColumn: 1,
            endColumn: 99,
            message: eLine.info,
            severity: monaco.MarkerSeverity.Error
          });
        }
      });

      monaco.editor.setModelMarkers(
        this.editor.getModel(),
        'BlockML',
        errorMarkers
      );
    }
  }

  onTextChanged() {
    this.removeMarkers();
    if (!this.needSave && this.code !== this.text) {
      this.store.dispatch(new actions.SetLayoutNeedSaveTrueAction());
    } else {
      this.refreshMarkers();
    }
  }

  onCancel() {
    this.text = this.specialText;
    this.code = this.text;
    this.store.dispatch(new actions.SetLayoutNeedSaveFalseAction());
  }

  onSave() {
    let selectedFile: api.CatalogFile;
    this.store
      .select(selectors.getSelectedProjectModeRepoFile)
      .pipe(take(1))
      .subscribe(x => (selectedFile = x));

    this.store.dispatch(
      new actions.SaveFileAction({
        project_id: selectedFile.project_id,
        repo_id: selectedFile.repo_id,
        file_id: selectedFile.file_id,
        server_ts: selectedFile.server_ts,
        content: this.code
      })
    );
  }
}
