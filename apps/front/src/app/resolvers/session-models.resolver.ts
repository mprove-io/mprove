import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendGetSessionProviderModelsRequestPayload,
  ToBackendGetSessionProviderModelsResponse
} from '#common/zod/to-backend/sessions/to-backend-get-session-provider-models';
import { NavQuery } from '../queries/nav.query';
import { SessionModelsQuery } from '../queries/session-models.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class SessionModelsResolver {
  constructor(
    private apiService: ApiService,
    private sessionModelsQuery: SessionModelsQuery,
    private navQuery: NavQuery
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let nav: any;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let payload: ToBackendGetSessionProviderModelsRequestPayload = {
      projectId: nav.projectId,
      sessionTypes: [SessionTypeEnum.Explorer, SessionTypeEnum.Editor],
      forceLoadFromCache: true
    };

    return this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetSessionProviderModels,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetSessionProviderModelsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.sessionModelsQuery.update({
              modelsOpencode: resp.payload.modelsOpencode,
              modelsAi: resp.payload.modelsAi
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
