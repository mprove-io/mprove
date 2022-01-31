import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { ModelQuery } from '../queries/model.query';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { ModelStore } from '../stores/model.store';
import { NavState } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class ModelResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private modelQuery: ModelQuery,
    private modelStore: ModelStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let parametersModelId = route.params[common.PARAMETER_MODEL_ID];

    let model: common.Model;
    this.modelQuery
      .select()
      .pipe(
        tap(x => {
          model = x;
        }),
        take(1)
      )
      .subscribe();

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
      isRepoProd: nav.isRepoProd,
      modelId: parametersModelId
    };

    if (model.modelId === parametersModelId) {
      return of(true);
    } else {
      return this.apiService
        .req(
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModel,
          payload
        )
        .pipe(
          map((resp: apiToBackend.ToBackendGetModelResponse) => {
            if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
              this.modelStore.update(resp.payload.model);
              return true;
            } else {
              return false;
            }
          })
        );
    }
  }
}
