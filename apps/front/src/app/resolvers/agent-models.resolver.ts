import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetAgentProviderModelsRequestPayload,
  ToBackendGetAgentProviderModelsResponse
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-provider-models';
import { AgentModelsQuery } from '../queries/agent-models.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class AgentModelsResolver {
  constructor(
    private apiService: ApiService,
    private agentModelsQuery: AgentModelsQuery
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let payload: ToBackendGetAgentProviderModelsRequestPayload = {};

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
              models: resp.payload.models
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
