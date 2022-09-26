import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { NavState, NavStore } from '../stores/nav.store';
import { RepoStore } from '../stores/repo.store';
import { StructStore } from '../stores/struct.store';

@Injectable({ providedIn: 'root' })
export class RepoStructResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private repoStore: RepoStore,
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

    let payload: apiToBackend.ToBackendGetRepoRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: branchId,
      envId: envId
    };

    return this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRepo, payload)
      .pipe(
        map((resp: apiToBackend.ToBackendGetRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            if (
              common.isUndefined(resp?.payload?.repo) ||
              common.isUndefined(resp?.payload?.struct)
            ) {
              return false;
            }

            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                branchId: branchId,
                envId: envId,
                needValidate: resp.payload.needValidate
              })
            );

            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
