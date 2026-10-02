import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { decodeFilePath } from '#common/functions/decode-file-path/decode-file-path';
import type { ToBackendGetFileRequest } from '#common/types/backend/routes/files/get-file/get-file-request';
import type { ToBackendGetFileResponse } from '#common/types/backend/routes/files/get-file/get-file-response';
import { getFileIds } from '#front/app/functions/get-file-ids';
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
    builderLeft: BuilderLeftEnum;
    skipCheck?: boolean;
  }) {
    let { fileId, builderLeft, skipCheck } = item;

    if (skipCheck !== true) {
      let repo = this.repoQuery.getValue();
      let fileIds = getFileIds({ nodes: repo.nodes });

      if (fileIds.indexOf(fileId) < 0) {
        return of(undefined).pipe(
          tap(() => this.navigateService.navigateToBuilder())
        );
      }
    }

    let fileName: string;

    let fileNodeId =
      this.nav.projectId + '/' + decodeFilePath({ filePath: fileId });

    let fileNodeIdParts = fileNodeId.split('/');

    fileName = fileNodeIdParts[fileNodeIdParts.length - 1];

    let getFilePayload: ToBackendGetFileRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fileNodeId: fileNodeId,
      builderLeft: builderLeft
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetFile',
        payload: getFilePayload
      })
      .pipe(
        map((resp: ToBackendGetFileResponse) => {
          if (resp?.type === 'Success') {
            let repoState = this.repoQuery.getValue();
            let newRepoState: RepoState = Object.assign(resp.output.repo, <
              RepoState
            >{
              conflicts: repoState.conflicts, // getFile does not check for conflicts
              repoStatus: repoState.repoStatus // getFile does not use git fetch
            });
            this.repoQuery.update(newRepoState);
            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
            });

            this.fileQuery.update({
              originalContent: resp.output.originalContent,
              content: resp.output.content,
              name: fileName,
              fileId: fileId,
              fileNodeId: fileNodeId,
              isExist: resp.output.isExist
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
