import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { ProjectStore } from '../stores/project.store';
import { MemberResolver } from './member.resolver';

@Injectable({ providedIn: 'root' })
export class MemberProjectSettingsResolver
  implements Resolve<Promise<boolean>> {
  constructor(
    private projectStore: ProjectStore,
    private navQuery: NavQuery,
    private memberResolver: MemberResolver,
    private apiService: ApiService
  ) {}

  async resolve(): Promise<boolean> {
    let pass = await this.memberResolver.resolve().toPromise();

    if (pass === false) {
      return false;
    }

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
