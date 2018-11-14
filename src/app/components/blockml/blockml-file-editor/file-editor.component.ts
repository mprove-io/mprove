import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import 'brace';
import 'brace/ext/searchbox';
import 'brace/mode/yaml';
import 'brace/theme/chrome';
import 'brace/theme/solarized_dark';
import { AceEditorComponent } from 'ng2-ace-editor';
import { filter, take, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-file-editor',
  templateUrl: 'file-editor.component.html',
  styleUrls: ['file-editor.component.scss']
})
export class FileEditorComponent implements AfterViewInit {
  text: string = '';
  newText: string = '';
  errorsLines: number[] = [];
  conflictsLines: number[] = [];
  fileEditorTheme: string = 'chrome';

  @ViewChild('editor') editor: AceEditorComponent;

  isDev$ = this.store.select(selectors.getLayoutModeIsDev); // no filter here

  needSave$ = this.store.select(selectors.getLayoutNeedSave); // no filter here

  fileContent$ = this.store
    .select(selectors.getSelectedProjectModeRepoFileContent)
    .pipe(
      tap(x => (this.text = x)) // no filter here
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
        this.removeMarkers();
        this.addMarkers();
      })
    );

  fileConflictsLines$ = this.store
    .select(selectors.getSelectedProjectModeRepoFileConflictsLines)
    .pipe(
      filter(v => !!v),
      tap(x => {
        this.conflictsLines = x;
        this.removeMarkers();
        this.addMarkers();
      })
    );

  fileEditorTheme$ = this.store
    .select(selectors.getSelectedProjectUserFileTheme)
    .pipe(
      filter(v => !!v),
      tap(x => {
        this.fileEditorTheme =
          x === api.MemberFileThemeEnum.Light ? 'chrome' : 'solarized_dark';
        if (this.editor !== null) {
          this.editor.setTheme(this.fileEditorTheme);
        }
      })
    );

  line: number;

  routeLine$ = this.route.queryParams.pipe(
    tap(params => {
      this.line = Number(params['line'] ? params['line'] : 1);

      setTimeout(() => {
        this.editor.getEditor().gotoLine(this.line);
        this.editor.getEditor().navigateLineEnd();
      }, 1);
    })
  );

  fileId$ = this.store.select(selectors.getSelectedProjectModeRepoFileId).pipe(
    filter(v => !!v),
    tap((fileId: string) => {
      setTimeout(() => {
        this.editor.getEditor().gotoLine(this.line);
        this.editor.getEditor().navigateLineEnd();
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

  ngAfterViewInit() {
    this.editor.getEditor().$blockScrolling = Infinity; // TODO: update ace later (1 instead of 2 by using this line)
    this.editor.getEditor().setFontSize(16);

    let modeIsDev: boolean;
    this.store
      .select(selectors.getLayoutModeIsDev)
      .pipe(take(1))
      .subscribe(x => (modeIsDev = x));

    if (!modeIsDev) {
      this.editor.getEditor().renderer.$cursorLayer.element.style.display =
        'none';
    }

    this.editor.setOptions({
      readOnly: !modeIsDev,
      tabSize: 2,
      useSoftTabs: true,
      highlightActiveLine: modeIsDev,
      highlightGutterLine: modeIsDev
    });

    this.editor.setTheme(this.fileEditorTheme);
    this.editor.setMode('yaml');

    // this.editor.getEditor().setOptions({
    //   enableBasicAutocompletion: true
    // });

    // this.editor.getEditor().commands.addCommand({
    //   name: 'showOtherCompletions',
    //   bindKey: 'Ctrl-.',
    //   exec: function (editor: any) {
    //
    //   }
    // });
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
    let frontMarkers = this.editor.getEditor().session.getMarkers(true); // returns Object, not Array (wrong docs!)
    for (let id in frontMarkers) {
      if (
        frontMarkers.hasOwnProperty(id) &&
        frontMarkers[id].clazz === 'myMarker'
      ) {
        this.editor.getEditor().session.removeMarker(frontMarkers[id].id);
      }
    }
  }

  addMarkers() {
    let repoIsNeedResolve: boolean;
    this.store
      .select(selectors.getSelectedProjectModeRepoIsNeedResolve)
      .pipe(take(1))
      .subscribe(x => (repoIsNeedResolve = x));

    let Range = require('brace').acequire('ace/range').Range;

    if (repoIsNeedResolve) {
      // conflicts markers
      this.conflictsLines.forEach(cLine => {
        if (cLine !== 0) {
          this.editor
            .getEditor()
            .session.addMarker(
              new Range(cLine - 1, 0, cLine - 1, 1),
              'myMarker',
              'fullLine',
              true
            );
        }
      });
    } else {
      // errors markers
      this.errorsLines.forEach(eLine => {
        if (eLine !== 0) {
          this.editor
            .getEditor()
            .session.addMarker(
              new Range(eLine - 1, 0, eLine - 1, 1),
              'myMarker',
              'fullLine',
              true
            );
        }
      });
    }
  }

  onTextChanged(e: any) {
    if (!!e) {
      if (e !== this.text) {
        this.newText = e;

        this.removeMarkers();

        this.store
          .select(selectors.getLayoutNeedSave)
          .pipe(take(1))
          .subscribe(needSave => {
            if (!needSave) {
              this.store.dispatch(new actions.SetLayoutNeedSaveTrueAction());
            }
          });
      } else {
        this.removeMarkers();
        this.addMarkers();
      }
    }
  }

  onCancel() {
    this.editor.setText(this.text);
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
          this.store.dispatch(new actions.UpdateLayoutFileIdAction(undefined));
          this.store.dispatch(new actions.SetLayoutNeedSaveFalseAction());
          return true;
        } else {
          return false;
        }
      });
    } else {
      this.store.dispatch(new actions.UpdateLayoutFileIdAction(undefined));
      return true;
    }
  }
}
