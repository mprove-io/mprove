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
import { NavState } from '../stores/nav.store';
import { VizsStore } from '../stores/vizs.store';

@Injectable({ providedIn: 'root' })
export class VizsModelsListResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private vizsStore: VizsStore
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

    let payload: apiToBackend.ToBackendGetModelsListRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId
    };

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModelsList,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetModelsListResponse) => {
          this.vizsStore.update({
            modelsList: resp.payload.modelsList,
            allModelsList: resp.payload.allModelsList
          });
          return true;
        })
      );
  }
}
