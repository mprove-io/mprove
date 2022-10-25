import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { NavState } from '../stores/nav.store';
import { VizsStore } from '../stores/vizs.store';
import { StructModelsResolver } from './struct-models.resolver';

@Injectable({ providedIn: 'root' })
export class StructModelsVizsResolver implements Resolve<Promise<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private structModelsResolver: StructModelsResolver,
    private vizsStore: VizsStore
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
    let pass = await this.structModelsResolver.resolve(route);

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

    let payload: apiToBackend.ToBackendGetVizsRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetVizsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.vizsStore.update({
              vizs: resp.payload.vizs
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
