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
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetOrgRequestPayload,
  ToBackendGetOrgResponse
} from '#common/interfaces/to-backend/orgs/to-backend-get-org';
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

    let payload: ToBackendGetOrgRequestPayload = {
      orgId: route.params[PARAMETER_ORG_ID]
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetOrg,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetOrgResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
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
