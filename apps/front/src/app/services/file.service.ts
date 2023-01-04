import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { FileQuery, FileState } from '../queries/file.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { RepoQuery, RepoState } from '../queries/repo.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery, UiState } from '../queries/ui.query';
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
    public repoQuery: RepoQuery,
    public structQuery: StructQuery,
    public navQuery: NavQuery,
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
            let repoState = this.repoQuery.getValue();
            let newRepoState: RepoState = Object.assign(resp.payload.repo, <
              RepoState
            >{
              conflicts: repoState.conflicts, // getFile does not check for conflicts
              repoStatus: repoState.repoStatus // getFile does not use git fetch
            });
            this.repoQuery.update(newRepoState);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.fileQuery.update({
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
