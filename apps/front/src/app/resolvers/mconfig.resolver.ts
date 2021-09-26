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
import { MqQuery } from '../queries/mq.query';
import { ApiService } from '../services/api.service';
import { emptyMconfig, emptyQuery, MqStore } from '../stores/mq.store';

@Injectable({ providedIn: 'root' })
export class MconfigResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private mqQuery: MqQuery,
    private mqStore: MqStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let parametersMconfigId = route.params[common.PARAMETER_MCONFIG_ID];

    let mconfig: common.Mconfig;
    let query: common.Query;
    this.mqQuery
      .select()
      .pipe(
        tap(x => {
          mconfig = x.mconfig;
          query = x.query;
        }),
        take(1)
      )
      .subscribe();

    if (mconfig.mconfigId === parametersMconfigId) {
      return of(true);
    }

    if (parametersMconfigId === common.EMPTY) {
      if (mconfig.mconfigId !== common.EMPTY) {
        this.mqStore.update(state =>
          Object.assign({}, state, { mconfig: emptyMconfig, query: emptyQuery })
        );
      }

      return of(true);
    }

    let payload: apiToBackend.ToBackendGetMconfigRequestPayload = {
      mconfigId: parametersMconfigId
    };

    if (mconfig.mconfigId === parametersMconfigId) {
      return of(true);
    } else {
      return this.apiService
        .req(
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMconfig,
          payload
        )
        .pipe(
          map((resp: apiToBackend.ToBackendGetMconfigResponse) => {
            this.mqStore.update(state =>
              Object.assign({}, state, { mconfig: resp.payload.mconfig })
            );
            return true;
          })
        );
    }
  }
}
