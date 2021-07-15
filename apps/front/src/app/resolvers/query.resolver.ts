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
import { emptyQuery, MqStore } from '../stores/mq.store';

@Injectable({ providedIn: 'root' })
export class QueryResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private mqQuery: MqQuery,
    private mqStore: MqStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let queryId = route.params[common.PARAMETER_QUERY_ID];

    if (queryId === common.EMPTY) {
      this.mqStore.update(state =>
        Object.assign({}, state, { query: emptyQuery })
      );

      return of(true);
    }

    let mconfig: common.Mconfig;
    this.mqQuery.mconfig$
      .pipe(
        tap(x => {
          mconfig = x;
        }),
        take(1)
      )
      .subscribe();

    let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
      mconfigId: mconfig.mconfigId,
      queryId: queryId
    };

    return this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery, payload)
      .pipe(
        map((resp: apiToBackend.ToBackendGetQueryResponse) => {
          this.mqStore.update(state =>
            Object.assign({}, state, { query: resp.payload.query })
          );

          return true;
        })
      );
  }
}
