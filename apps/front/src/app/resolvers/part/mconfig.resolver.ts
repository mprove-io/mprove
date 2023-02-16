import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { checkModel } from '~front/app/functions/check-model';
import { ModelQuery } from '~front/app/queries/model.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { checkNavOrgProjectRepoBranchEnv } from '../../functions/check-nav-org-project-repo-branch-env';
import { emptyMconfig, emptyQuery, MqQuery } from '../../queries/mq.query';
import { NavQuery, NavState } from '../../queries/nav.query';
import { UserQuery } from '../../queries/user.query';
import { ApiService } from '../../services/api.service';

@Injectable({ providedIn: 'root' })
export class MconfigResolver implements Resolve<Observable<boolean>> {
  constructor(
    private apiService: ApiService,
    private navigateService: NavigateService,
    private mqQuery: MqQuery,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private modelQuery: ModelQuery,
    private router: Router
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

    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    checkNavOrgProjectRepoBranchEnv({
      router: this.router,
      route: route,
      nav: nav,
      userId: userId
    });

    let modelId;
    this.modelQuery
      .select()
      .pipe(
        tap(x => (modelId = x.modelId)),
        take(1)
      )
      .subscribe();

    checkModel({
      modelId: modelId,
      route: route,
      navigateService: this.navigateService
    });

    let parametersMconfigId = route.params[common.PARAMETER_MCONFIG_ID];

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

    if (parametersMconfigId === common.EMPTY_REP_ID) {
      if (mconfig.mconfigId !== common.EMPTY_REP_ID) {
        this.mqQuery.updatePart({ mconfig: emptyMconfig, query: emptyQuery });
      }

      return of(true);
    }

    let payload: apiToBackend.ToBackendGetMconfigRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd,
      mconfigId: parametersMconfigId
    };

    if (mconfig.mconfigId === parametersMconfigId) {
      return of(true);
    } else {
      return this.apiService
        .req({
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMconfig,
          payload: payload
        })
        .pipe(
          map((resp: apiToBackend.ToBackendGetMconfigResponse) => {
            if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
              this.mqQuery.updatePart({
                mconfig: resp.payload.mconfig
              });
              return true;
            } else {
              return false;
            }
          })
        );
    }
  }
}
