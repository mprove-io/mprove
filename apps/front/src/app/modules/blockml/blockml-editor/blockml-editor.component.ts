import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { NavState } from '~front/app/stores/nav.store';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { StructState, StructStore } from '~front/app/stores/struct.store';
import { UiState, UiStore } from '~front/app/stores/ui.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-blockml-editor',
  templateUrl: './blockml-editor.component.html',
  styleUrls: ['blockml-editor.component.scss']
})
export class BlockmlEditorComponent implements OnDestroy {
  editorTheme = 'vs-dark';

  line = 1;

  editor: monaco.editor.IStandaloneCodeEditor = null;

  editorOptions = {
    // automaticLayout: true,
    theme: this.editorTheme,
    fontSize: 16,
    language: 'yaml'
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
      this.refreshMarkers();
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
    public structStore: StructStore,
    private uiStore: UiStore,
    private route: ActivatedRoute
  ) {}

  async onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;

    monaco.editor.setTheme(this.editorTheme);

    this.editor.updateOptions({ readOnly: this.nav.isRepoProd });

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

    if (this.repo.repoStatus === common.RepoStatusEnum.NeedResolve) {
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
    if (!this.needSave && this.content !== this.originalText) {
      this.uiStore.update(state =>
        Object.assign({}, state, <UiState>{ needSave: true })
      );
    } else if (this.needSave && this.content === this.originalText) {
      this.uiStore.update(state =>
        Object.assign({}, state, <UiState>{ needSave: false })
      );
    } else {
      this.refreshMarkers();
    }
  }

  save() {
    let payload: apiToBackend.ToBackendSaveFileRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      fileNodeId:
        this.nav.projectId +
        '/' +
        this.file.fileId.split(common.TRIPLE_UNDERSCORE).join('/'),
      content: this.content
    };

    this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveFile, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendSaveFileResponse) => {
          this.repoStore.update(resp.payload.repo);
          this.structStore.update(resp.payload.struct);

          this.originalText = this.content;
          this.uiStore.update(state =>
            Object.assign({}, state, <UiState>{ needSave: false })
          );
          this.cd.detectChanges();
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

  goTo() {
    let ar = this.file.name.split('.');
    let ext = ar[ar.length - 1];

    let dotExt = `.${ext}`;

    if (dotExt === common.FileExtensionEnum.Model) {
      this.navigateService.navigateToModel(ar[0]);
    } else if (dotExt === common.FileExtensionEnum.Viz) {
      this.navigateService.navigateToVizs({
        extra: {
          queryParams: { searchFileName: this.file.name }
        }
      });
    }
  }

  ngOnDestroy() {
    this.fileStore.reset();
  }
}
