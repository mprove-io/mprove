import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { FileQuery } from '../queries/file.query';
import { NavQuery } from '../queries/nav.query';
import { FileState, FileStore } from '../stores/file.store';
import { NavState } from '../stores/nav.store';
import { RepoStore } from '../stores/repo.store';
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

  constructor(
    public fileQuery: FileQuery,
    public repoStore: RepoStore,
    public fileStore: FileStore,
    public navQuery: NavQuery,
    private apiService: ApiService
  ) {
    this.file$.subscribe();
    this.nav$.subscribe();
  }

  getFile() {
    let getFilePayload: apiToBackend.ToBackendGetFileRequestPayload;

    let fileId = this.file.fileId;
    let fileName: string;

    if (common.isDefined(fileId)) {
      let fileIdArr = fileId.split(common.TRIPLE_UNDERSCORE);
      fileName = fileIdArr[fileIdArr.length - 1];

      getFilePayload = {
        projectId: this.nav.projectId,
        isRepoProd: this.nav.isRepoProd,
        branchId: this.nav.branchId,
        fileNodeId:
          this.nav.projectId +
          '/' +
          fileId.split(common.TRIPLE_UNDERSCORE).join('/')
      };
    }

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetFile,
        getFilePayload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetFileResponse) => {
          this.repoStore.update(resp.payload.repo);
          this.fileStore.update({
            content: resp.payload.content,
            name: fileName,
            fileId: fileId
          });
        })
      );
  }
}
