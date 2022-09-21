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
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { emptyQuery, MqStore } from '../stores/mq.store';
import { NavState } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class QueryResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private mqQuery: MqQuery,
    private mqStore: MqStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let parametersQueryId = route.params[common.PARAMETER_QUERY_ID];

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

    let mconfig: common.MconfigX;
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

    if (query.queryId === parametersQueryId) {
      return of(true);
    }

    if (parametersQueryId === common.EMPTY) {
      if (query.queryId !== common.EMPTY) {
        this.mqStore.update(state =>
          Object.assign({}, state, { query: emptyQuery })
        );
      }

      return of(true);
    }

    let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      mconfigId: mconfig.mconfigId,
      queryId: parametersQueryId
    };

    if (query.queryId === parametersQueryId) {
      return of(true);
    } else {
      return this.apiService
        .req(
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
          payload
        )
        .pipe(
          map((resp: apiToBackend.ToBackendGetQueryResponse) => {
            if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
              this.mqStore.update(state =>
                Object.assign({}, state, { query: resp.payload.query })
              );
              return true;
            } else {
              return false;
            }
          })
        );
    }
  }
}
