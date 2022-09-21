import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { ModelStore } from '../stores/model.store';
import { NavState } from '../stores/nav.store';
import { StackResolver } from './stack.resolver';

@Injectable({ providedIn: 'root' })
export class StackModelResolver implements Resolve<Promise<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private stackResolver: StackResolver,
    private modelStore: ModelStore
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Promise<boolean> {
    let pass = await this.stackResolver.resolve(route);

    if (pass === false) {
      return false;
    }

    let parametersModelId = route.params[common.PARAMETER_MODEL_ID];

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

    let payload: apiToBackend.ToBackendGetModelRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      modelId: parametersModelId
    };

    return this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModel, payload)
      .pipe(
        map((resp: apiToBackend.ToBackendGetModelResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.modelStore.update(resp.payload.model);
            return true;
          } else {
            return false;
          }
        })
      )
      .toPromise();
  }
}
