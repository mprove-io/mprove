import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { ModelsStore } from '../stores/models.store';
import { NavState } from '../stores/nav.store';
import { StructResolver } from './struct.resolver';

@Injectable({ providedIn: 'root' })
export class StructModelsResolver implements Resolve<Promise<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private structResolver: StructResolver,
    private modelsStore: ModelsStore
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
    let pass = await this.structResolver.resolve(route).toPromise();

    if (pass === false) {
      return false;
    }

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

    let payload: apiToBackend.ToBackendGetModelsRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModels,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetModelsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.modelsStore.update({
              models: resp.payload.models
            });

            return true;
          } else {
            return false;
          }
        })
      )
      .toPromise();
  }
}
