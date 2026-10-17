import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { PARAMETER_ORG_ID } from '#common/constants/top';
import type { ToBackendGetOrgOutput } from '#common/types/backend/routes/orgs/get-org/get-org-output';
import type { ToBackendGetOrgRequest } from '#common/types/backend/routes/orgs/get-org/get-org-request';
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

    let payload: ToBackendGetOrgRequest['input'] = {
      orgId: route.params[PARAMETER_ORG_ID]
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetOrg',
        payload: payload
      })
      .pipe(
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendGetOrgOutput = resp.output;

            let org = output.org;
            this.orgQuery.update(org);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
