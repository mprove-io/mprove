import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { ApiService } from '../services/api.service';
import { ProjectStore } from '../stores/project.store';

@Injectable({ providedIn: 'root' })
export class ProjectTeamResolver implements Resolve<Observable<boolean>> {
  constructor(
    private projectStore: ProjectStore,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let payload: apiToBackend.ToBackendGetMembersRequestPayload = {
      projectId: route.params[common.PARAMETER_PROJECT_ID]
    };

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMembers,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetMembersResponse) => {
          let members = resp.payload.members;
          this.projectStore.update({ members: members });
          return true;
        })
      );
  }
}
