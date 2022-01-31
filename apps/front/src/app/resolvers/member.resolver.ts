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
import { ProjectQuery } from '../queries/project.query';
import { ApiService } from '../services/api.service';
import { MemberStore } from '../stores/member.store';

@Injectable({ providedIn: 'root' })
export class MemberResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private projectQuery: ProjectQuery,
    private memberStore: MemberStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let projectId;

    this.projectQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: apiToBackend.ToBackendGetProjectRequestPayload = {
      projectId: projectId
    };

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetProjectResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberStore.update(resp.payload.userMember);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
