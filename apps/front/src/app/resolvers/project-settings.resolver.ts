import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { MemberStore } from '../stores/member.store';
import { ProjectStore } from '../stores/project.store';

@Injectable({ providedIn: 'root' })
export class ProjectSettingsResolver implements Resolve<Promise<boolean>> {
  constructor(
    private projectStore: ProjectStore,
    private navQuery: NavQuery,
    private memberStore: MemberStore,
    private apiService: ApiService
  ) {}

  async resolve(): Promise<boolean> {
    let projectId;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: apiToBackend.ToBackendGetProjectRequestPayload = {
      projectId: projectId
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetProjectResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberStore.update(resp.payload.userMember);

            this.projectStore.update(resp.payload.project);
            return true;
          } else {
            return false;
          }
        })
      )
      .toPromise();
  }
}
