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
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { EvsStore } from '../stores/evs.store';
import { MemberStore } from '../stores/member.store';
import { NavState } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class ProjectEnvEvsResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private router: Router,
    private apiService: ApiService,
    private memberStore: MemberStore,
    private evsStore: EvsStore
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

    let environmentId = route.params[common.PARAMETER_ENVIRONMENT_ID];

    let payload: apiToBackend.ToBackendGetEvsRequestPayload = {
      projectId: nav.projectId,
      envId: environmentId
    };

    return this.apiService
      .req({
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEvs,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetEvsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberStore.update(resp.payload.userMember);

            this.evsStore.update(resp.payload);
            return true;
          } else {
            this.router.navigate([
              common.PATH_ORG,
              nav.orgId,
              common.PATH_PROJECT,
              nav.projectId,
              common.PATH_SETTINGS
            ]);
            return false;
          }
        })
      );
  }
}
