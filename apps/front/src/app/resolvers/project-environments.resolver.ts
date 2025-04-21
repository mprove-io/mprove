import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { checkNavOrgProject } from '../functions/check-nav-org-project';
import { EnvironmentsQuery } from '../queries/environments.query';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProjectEnvironmentsResolver
  implements Resolve<Observable<boolean>>
{
  constructor(
    private navQuery: NavQuery,
    private router: Router,
    private apiService: ApiService,
    private memberQuery: MemberQuery,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let nav: NavState;
    this.navQuery
      .select()
      .pipe(
        tap(x => {
          nav = x;
        }),
        take(1)
      )
      .subscribe();

    checkNavOrgProject({
      router: this.router,
      route: route,
      nav: nav
    });

    let projectId;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: apiToBackend.ToBackendGetEnvsRequestPayload = {
      projectId: projectId
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvs,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetEnvsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            let newSortedEnvironments = resp.payload.envs.sort((a, b) =>
              a.envId !== common.PROJECT_ENV_PROD &&
              b.envId === common.PROJECT_ENV_PROD
                ? 1
                : a.envId === common.PROJECT_ENV_PROD &&
                  b.envId !== common.PROJECT_ENV_PROD
                ? -1
                : a.envId > b.envId
                ? 1
                : b.envId > a.envId
                ? -1
                : 0
            );

            this.environmentsQuery.update({
              environments: newSortedEnvironments
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
