// tslint:disable-next-line:no-reference
/// <reference path="../../../../../node_modules/monaco-editor/monaco.d.ts" />

import { AfterViewInit, Component, ViewChild, OnDestroy } from '@angular/core';
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
export class FileEditorComponent implements AfterViewInit, OnDestroy {
  // automaticLayout: boolean = true;

  fileEditorTheme: string = null;

  editorOptions = {
    theme: this.fileEditorTheme,
    fontSize: 16,
    language: 'yaml'
  };

  codeEditor: monaco.editor.IEditor = null;

  text: string = '';
  newText: string = '';
  specialText: string = '';

  errorsLines: number[] = [];
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
          this.newText = x;
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
        // this.removeMarkers();
        // this.addMarkers();
      })
    );

  fileConflictsLines$ = this.store
    .select(selectors.getSelectedProjectModeRepoFileConflictsLines)
    .pipe(
      filter(v => !!v),
      tap(x => {
        this.conflictsLines = x;
        // this.removeMarkers();
        // this.addMarkers();
      })
    );

  fileEditorTheme$ = this.store.select(selectors.getUserFileTheme).pipe(
    filter(v => !!v),
    tap(x => {
      this.fileEditorTheme =
        x === api.UserFileThemeEnum.Light ? 'vs' : 'vs-dark';

      if (this.codeEditor) {
        monaco.editor.setTheme(this.fileEditorTheme);
      }
    })
  );

  line: number;

  routeLine$ = this.route.queryParams.pipe(
    tap(params => {
      this.line = Number(params['line'] ? params['line'] : 1);

      setTimeout(() => {
        // this.editor.getEditor().gotoLine(this.line);
        // this.editor.getEditor().navigateLineEnd();
      }, 1);
    })
  );

  fileId$ = this.store.select(selectors.getSelectedProjectModeRepoFileId).pipe(
    filter(v => !!v),
    tap((fileId: string) => {
      setTimeout(() => {
        // this.editor.getEditor().gotoLine(this.line);
        // this.editor.getEditor().navigateLineEnd();
      }, 1);
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

  async onEditorInit(editor: monaco.editor.IEditor) {
    this.codeEditor = editor;

    let modeIsDev: boolean;
    this.store
      .select(selectors.getLayoutModeIsDev)
      .pipe(take(1))
      .subscribe(x => (modeIsDev = x));

    monaco.editor.setTheme(this.fileEditorTheme);

    editor.updateOptions({
      readOnly: !modeIsDev
    });
  }

  ngAfterViewInit() {
    //   highlightActiveLine: modeIsDev,
    //   highlightGutterLine: modeIsDev
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
    console.log(123);
    this.store.dispatch(new actions.UpdateLayoutFileIdAction(undefined));
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
    // let frontMarkers = this.editor.getEditor().session.getMarkers(true); // returns Object, not Array (wrong docs!)
    // for (let id in frontMarkers) {
    //   if (
    //     frontMarkers.hasOwnProperty(id) &&
    //     frontMarkers[id].clazz === 'myMarker'
    //   ) {
    //     this.editor.getEditor().session.removeMarker(frontMarkers[id].id);
    //   }
    // }
  }

  addMarkers() {
    // let repoIsNeedResolve: boolean;
    // this.store
    //   .select(selectors.getSelectedProjectModeRepoIsNeedResolve)
    //   .pipe(take(1))
    //   .subscribe(x => (repoIsNeedResolve = x));
    // let Range = require('brace').acequire('ace/range').Range;
    // if (repoIsNeedResolve) {
    //   // conflicts markers
    //   this.conflictsLines.forEach(cLine => {
    //     if (cLine !== 0) {
    //       this.editor
    //         .getEditor()
    //         .session.addMarker(
    //           new Range(cLine - 1, 0, cLine - 1, 1),
    //           'myMarker',
    //           'fullLine',
    //           true
    //         );
    //     }
    //   });
    // } else {
    //   // errors markers
    //   this.errorsLines.forEach(eLine => {
    //     if (eLine !== 0) {
    //       this.editor
    //         .getEditor()
    //         .session.addMarker(
    //           new Range(eLine - 1, 0, eLine - 1, 1),
    //           'myMarker',
    //           'fullLine',
    //           true
    //         );
    //     }
    //   });
    // }
  }

  onTextChanged() {
    if (!this.needSave && this.newText !== this.text) {
      // this.removeMarkers();
      this.store.dispatch(new actions.SetLayoutNeedSaveTrueAction());
    } else {
      // this.removeMarkers();
      // this.addMarkers();
    }
  }

  onCancel() {
    this.text = this.specialText;
    this.newText = this.text;
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
        content: this.newText
      })
    );
  }
}
