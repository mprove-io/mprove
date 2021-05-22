import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { FileStore } from '../stores/file.store';
import { NavState } from '../stores/nav.store';
import { RepoStore } from '../stores/repo.store';

@Injectable({ providedIn: 'root' })
export class FileResolver implements Resolve<Observable<boolean>> {
  constructor(
    private repoStore: RepoStore,
    private fileStore: FileStore,
    private navQuery: NavQuery,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let fileId = route.params[common.PARAMETER_FILE_ID];

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let fileIdArr = fileId.split(common.TRIPLE_UNDERSCORE);
    let fileName = fileIdArr[fileIdArr.length - 1];

    let payload: apiToBackend.ToBackendGetFileRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      fileNodeId:
        nav.projectId + '/' + fileId.split(common.TRIPLE_UNDERSCORE).join('/')
    };

    return this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetFile, payload)
      .pipe(
        map((resp: apiToBackend.ToBackendGetFileResponse) => {
          this.repoStore.update(resp.payload.repo);
          this.fileStore.update({
            content: resp.payload.content,
            name: fileName,
            fileId: fileId
          });
          return true;
        })
      );
  }
}
