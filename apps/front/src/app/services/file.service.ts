import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { FileQuery, FileState } from '../queries/file.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { RepoQuery, RepoState } from '../queries/repo.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery, UiState } from '../queries/ui.query';
import { ApiService } from './api.service';
import { NavigateService } from './navigate.service';

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
    private fileQuery: FileQuery,
    private uiQuery: UiQuery,
    private repoQuery: RepoQuery,
    private structQuery: StructQuery,
    private navQuery: NavQuery,
    private navigateService: NavigateService,
    private apiService: ApiService
  ) {
    this.file$.subscribe();
    this.ui$.subscribe();
    this.nav$.subscribe();
  }

  getFile(item: {
    fileId: string;
    panel: common.PanelEnum;
    skipCheck?: boolean;
  }) {
    let { fileId, panel, skipCheck } = item;

    if (skipCheck !== true) {
      let repo = this.repoQuery.getValue();
      let fileIds = common.getFileIds({ nodes: repo.nodes });

      if (fileIds.indexOf(fileId) < 0) {
        return of(undefined).pipe(
          tap(() => this.navigateService.navigateToFiles())
        );
      }
    }

    let fileName: string;

    let fileNodeId =
      this.nav.projectId + '/' + common.decodeFilePath({ filePath: fileId });
    // fileId.split(common.TRIPLE_UNDERSCORE).join('/');

    let fileNodeIdParts = fileNodeId.split('/');
    // let fileIdArr = fileId.split(common.TRIPLE_UNDERSCORE);

    fileName = fileNodeIdParts[fileNodeIdParts.length - 1];

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
