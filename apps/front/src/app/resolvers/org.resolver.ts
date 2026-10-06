import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PARAMETER_ORG_ID } from '#common/constants/top';
import { LOCAL_STORAGE_ORG_ID } from '#common/constants/top-front';
import type { ToBackendGetOrgRequest } from '#common/types/backend/routes/orgs/get-org/get-org-request';
import type { ToBackendGetOrgResponse } from '#common/types/backend/routes/orgs/get-org/get-org-response';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class OrgResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let payload: ToBackendGetOrgRequest['input'] = {
      orgId: route.params[PARAMETER_ORG_ID]
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetOrg',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetOrgResponse) => {
          if (resp.type === 'Success') {
            let org = resp.output.org;

            this.navQuery.updatePart({
              orgId: org.orgId,
              orgName: org.name,
              orgOwnerId: org.ownerId
            });

            localStorage.setItem(LOCAL_STORAGE_ORG_ID, org.orgId);

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
