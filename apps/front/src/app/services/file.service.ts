import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { FileQuery } from '../queries/file.query';
import { NavQuery } from '../queries/nav.query';
import { UiQuery } from '../queries/ui.query';
import { FileState, FileStore } from '../stores/file.store';
import { NavState, NavStore } from '../stores/nav.store';
import { RepoState, RepoStore } from '../stores/repo.store';
import { StructStore } from '../stores/struct.store';
import { UiState, UiStore } from '../stores/ui.store';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FileService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  file: FileState;
  file$ = this.fileQuery.select().pipe(
    tap(x => {
      this.file = x;
    })
  );

  ui: UiState;
  ui$ = this.uiQuery.select().pipe(
    tap(x => {
      this.ui = x;
    })
  );

  constructor(
    public fileQuery: FileQuery,
    public uiQuery: UiQuery,
    public repoStore: RepoStore,
    public structStore: StructStore,
    public fileStore: FileStore,
    public uiStore: UiStore,
    public navQuery: NavQuery,
    private navStore: NavStore,
    private apiService: ApiService
  ) {
    this.file$.subscribe();
    this.ui$.subscribe();
    this.nav$.subscribe();
  }

  getFile(item: { fileId: string; panel: common.PanelEnum }) {
    let { fileId, panel } = item;

    let fileName: string;

    let fileNodeId =
      this.nav.projectId +
      '/' +
      fileId.split(common.TRIPLE_UNDERSCORE).join('/');

    let fileIdArr = fileId.split(common.TRIPLE_UNDERSCORE);
    fileName = fileIdArr[fileIdArr.length - 1];

    let getFilePayload: apiToBackend.ToBackendGetFileRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fileNodeId: fileNodeId,
      panel: panel || common.PanelEnum.Tree
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetFile,
        payload: getFilePayload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetFileResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(state =>
              Object.assign(resp.payload.repo, <RepoState>{
                conflicts: state.conflicts, // getFile does not check for conflicts
                repoStatus: state.repoStatus // getFile does not use git fetch
              })
            );
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            this.fileStore.update({
              originalContent: resp.payload.originalContent,
              content: resp.payload.content,
              name: fileName,
              fileId: fileId,
              fileNodeId: fileNodeId,
              isExist: resp.payload.isExist
            });
          }
        })
      );
  }
}
