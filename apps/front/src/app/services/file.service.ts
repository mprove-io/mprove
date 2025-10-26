import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PanelEnum } from '~common/enums/panel.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { decodeFilePath } from '~common/functions/decode-file-path';
import { getFileIds } from '~common/functions/get-file-ids';
import {
  ToBackendGetFileRequestPayload,
  ToBackendGetFileResponse
} from '~common/interfaces/to-backend/files/to-backend-get-file';
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
    panel: PanelEnum;
    skipCheck?: boolean;
  }) {
    let { fileId, panel, skipCheck } = item;

    if (skipCheck !== true) {
      let repo = this.repoQuery.getValue();
      let fileIds = getFileIds({ nodes: repo.nodes });

      if (fileIds.indexOf(fileId) < 0) {
        return of(undefined).pipe(
          tap(() => this.navigateService.navigateToFiles())
        );
      }
    }

    let fileName: string;

    let fileNodeId =
      this.nav.projectId + '/' + decodeFilePath({ filePath: fileId });

    let fileNodeIdParts = fileNodeId.split('/');

    fileName = fileNodeIdParts[fileNodeIdParts.length - 1];

    let getFilePayload: ToBackendGetFileRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fileNodeId: fileNodeId,
      panel: panel || PanelEnum.Tree
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetFile,
        payload: getFilePayload
      })
      .pipe(
        map((resp: ToBackendGetFileResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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

  refreshSecondFile() {
    let secondFileNodeId = this.uiQuery.getValue().secondFileNodeId;

    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    setTimeout(() => {
      this.uiQuery.updatePart({ secondFileNodeId: secondFileNodeId });
    }, 0);
  }
}
