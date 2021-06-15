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
import { ApiService } from '../services/api.service';
import { NavState, NavStore } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class OrgResolver implements Resolve<Observable<boolean>> {
  constructor(private navStore: NavStore, private apiService: ApiService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let payload: apiToBackend.ToBackendGetOrgRequestPayload = {
      orgId: route.params[common.PARAMETER_ORG_ID]
    };

    return this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrg, payload)
      .pipe(
        map((resp: apiToBackend.ToBackendGetOrgResponse) => {
          let org = resp.payload.org;

          this.navStore.update(state =>
            Object.assign({}, state, <NavState>{
              orgId: org.orgId,
              orgName: org.name
            })
          );

          localStorage.setItem(constants.LOCAL_STORAGE_ORG_ID, org.orgId);

          return true;
        })
      );
  }
}