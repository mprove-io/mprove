import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { NavState, NavStore } from '../stores/nav.store';
import { StructStore } from '../stores/struct.store';

@Injectable({ providedIn: 'root' })
export class StructResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private structStore: StructStore,
    private apiService: ApiService,
    private navStore: NavStore
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let branchId = route.params[common.PARAMETER_BRANCH_ID];
    let envId = route.params[common.PARAMETER_ENV_ID];

    let payload: apiToBackend.ToBackendGetStructRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: branchId,
      envId: envId
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetStruct,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetStructResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                branchId: branchId,
                envId: envId,
                needValidate: resp.payload.needValidate
              })
            );

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
