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
export class VizsResolver implements Resolve<Observable<boolean>> {
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

    let payload: apiToBackend.ToBackendGetVizsRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      isRepoProd: nav.isRepoProd
    };

    return this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetVizs, payload)
      .pipe(
        map((resp: apiToBackend.ToBackendGetVizsResponse) => {
          this.vizsStore.update({
            vizs: resp.payload.vizs
          });
          return true;
        })
      );
  }
}
