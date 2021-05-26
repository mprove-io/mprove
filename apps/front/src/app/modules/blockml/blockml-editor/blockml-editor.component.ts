import { ChangeDetectorRef, Component } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { FileState } from '~front/app/stores/file.store';
import { NavState } from '~front/app/stores/nav.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { UiState, UiStore } from '~front/app/stores/ui.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-blockml-editor',
  templateUrl: './blockml-editor.component.html',
  styleUrls: ['blockml-editor.component.scss']
})
export class BlockmlEditorComponent {
  fileEditorTheme = 'vs-dark';

  editor: monaco.editor.IStandaloneCodeEditor = null;

  editorOptions = {
    // automaticLayout: true,
    theme: this.fileEditorTheme,
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
      this.cd.detectChanges();
    })
  );

  constructor(
    public fileQuery: FileQuery,
    public uiQuery: UiQuery,
    public navQuery: NavQuery,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private repoStore: RepoStore,
    public structStore: StructStore,
    private uiStore: UiStore
  ) {}

  async onEditorInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;

    monaco.editor.setTheme(this.fileEditorTheme);

    this.editor.updateOptions({ readOnly: this.nav.isRepoProd });

    this.editor.getModel().updateOptions({ tabSize: 2 });

    this.refreshMarkers();
  }

  refreshMarkers() {}

  removeMarkers() {}

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
}
