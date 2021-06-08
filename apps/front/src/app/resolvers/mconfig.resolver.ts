import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { MconfigStore } from '../stores/mconfig.store';
import { NavState } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class MconfigResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private mconfigStore: MconfigStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let mconfigId = route.params[common.PARAMETER_MCONFIG_ID];

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

    let payload: apiToBackend.ToBackendGetMconfigRequestPayload = {
      mconfigId: mconfigId
    };

    return this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMconfig,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetMconfigResponse) => {
          this.mconfigStore.update(resp.payload.mconfig);
          return true;
        })
      );
  }
}
