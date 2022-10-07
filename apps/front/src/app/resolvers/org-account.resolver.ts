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
import { OrgStore } from '../stores/org.store';

@Injectable({ providedIn: 'root' })
export class OrgAccountResolver implements Resolve<Observable<boolean>> {
  constructor(private orgStore: OrgStore, private apiService: ApiService) {}

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
            this.orgStore.update(org);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
