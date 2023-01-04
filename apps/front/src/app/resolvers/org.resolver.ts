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
import { constants } from '~front/barrels/constants';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class OrgResolver implements Resolve<Observable<boolean>> {
  constructor(private navQuery: NavQuery, private apiService: ApiService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
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

            this.navQuery.updatePart({
              orgId: org.orgId,
              orgName: org.name,
              orgOwnerId: org.ownerId
            });

            localStorage.setItem(constants.LOCAL_STORAGE_ORG_ID, org.orgId);

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
