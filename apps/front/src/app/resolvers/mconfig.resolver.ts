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
import { emptyMconfig, emptyQuery, MqState, MqStore } from '../stores/mq.store';
import { NavState } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class MconfigResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private mqQuery: MqQuery,
    private navQuery: NavQuery,
    private mqStore: MqStore
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let parametersMconfigId = route.params[common.PARAMETER_MCONFIG_ID];

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
      projectId: nav.projectId,
      branchId: nav.branchId,
      isRepoProd: nav.isRepoProd,
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
            if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
              this.mqStore.update(state =>
                Object.assign({}, state, <MqState>{
                  mconfig: resp.payload.mconfig
                })
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
