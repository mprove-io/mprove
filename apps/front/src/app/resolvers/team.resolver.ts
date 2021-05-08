import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { constants } from '~front/barrels/constants';
import { ProjectQuery } from '../queries/project.query';
import { ApiService } from '../services/api.service';
import { TeamStore } from '../stores/team.store';

@Injectable({ providedIn: 'root' })
export class TeamResolver implements Resolve<Observable<boolean>> {
  constructor(
    private projectQuery: ProjectQuery,
    private apiService: ApiService,
    private teamStore: TeamStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let projectId;

    this.projectQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: apiToBackend.ToBackendGetMembersRequestPayload = {
      projectId: projectId,
      pageNum: 1,
      perPage: constants.MEMBERS_PER_PAGE
    };

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMembers,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetMembersResponse) => {
          this.teamStore.update(resp.payload);
          return true;
        })
      );
  }
}
