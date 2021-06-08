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
import { MconfigQuery } from '../queries/mconfig.query';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { MconfigState } from '../stores/mconfig.store';
import { NavState } from '../stores/nav.store';
import { QueryStore } from '../stores/query.store';

@Injectable({ providedIn: 'root' })
export class QueryResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private navQuery: NavQuery,
    private mconfigQuery: MconfigQuery,
    private queryStore: QueryStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let queryId = route.params[common.PARAMETER_QUERY_ID];

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

    let mconfig: MconfigState;
    this.mconfigQuery
      .select()
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
          this.queryStore.update(resp.payload.query);
          return true;
        })
      );
  }
}
