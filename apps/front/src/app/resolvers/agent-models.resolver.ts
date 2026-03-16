import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetAgentProviderModelsRequestPayload,
  ToBackendGetAgentProviderModelsResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-provider-models';
import { AgentModelsQuery } from '../queries/agent-models.query';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class AgentModelsResolver {
  constructor(
    private apiService: ApiService,
    private agentModelsQuery: AgentModelsQuery,
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

    let payload: ToBackendGetAgentProviderModelsRequestPayload = {
      projectId: nav.projectId,
      sessionTypes: [SessionTypeEnum.A, SessionTypeEnum.B],
      forceLoadFromCache: true
    };

    return this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetAgentProviderModels,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetAgentProviderModelsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.agentModelsQuery.update({
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
