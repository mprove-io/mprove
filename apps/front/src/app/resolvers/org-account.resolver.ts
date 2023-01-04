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
import { checkNavOrg } from '../functions/check-nav-org';
import { NavQuery, NavState } from '../queries/nav.query';
import { OrgQuery } from '../queries/org.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class OrgAccountResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private orgQuery: OrgQuery,
    private apiService: ApiService,
    private router: Router
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

    checkNavOrg({
      router: this.router,
      route: route,
      nav: nav
    });

    let payload: apiToBackend.ToBackendGetOrgRequestPayload = {
      orgId: route.params[common.PARAMETER_ORG_ID]
    };

    return this.apiService
      .req({
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrg,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetOrgResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let org = resp.payload.org;
            this.orgQuery.update(org);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
