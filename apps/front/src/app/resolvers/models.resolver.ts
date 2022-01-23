import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { ModelsStore } from '../stores/models.store';
import { NavState } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class ModelsResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private modelsStore: ModelsStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
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
      branchId: nav.branchId
    };

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModels,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetModelsResponse) => {
          this.modelsStore.update({
            models: resp.payload.models
          });

          return true;
        })
      );
  }
}
