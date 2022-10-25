import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { NavState, NavStore } from '../stores/nav.store';
import { RepoStore } from '../stores/repo.store';
import { StructStore } from '../stores/struct.store';
import { StackResolver } from './stack.resolver';

@Injectable({ providedIn: 'root' })
export class StackFilesResolver implements Resolve<Promise<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private stackResolver: StackResolver,
    private repoStore: RepoStore,
    private structStore: StructStore,
    private navStore: NavStore
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
    let pass = await this.stackResolver.resolve(route);

    if (pass === false) {
      return false;
    }

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
      envId: envId,
      isFetch: false
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRepo,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            // if (
            //   common.isUndefined(resp?.payload?.repo) ||
            //   common.isUndefined(resp?.payload?.struct)
            // ) {
            //   return false;
            // }

            this.repoStore.update(resp.payload.repo);
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
      )
      .toPromise();
  }
}
