import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import type { ToBackendGetLlmModelsWithProviderInput } from '#common/zod/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-request';
import type { ToBackendGetLlmModelsWithProviderResponse } from '#common/zod/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-response';
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

    let payload: ToBackendGetLlmModelsWithProviderInput = {
      projectId: nav.projectId,
      sessionTypes: [SessionTypeEnum.Explorer, SessionTypeEnum.Editor]
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetLlmModelsWithProvider',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetLlmModelsWithProviderResponse) => {
          if (resp.result?.type === 'Success') {
            this.sessionModelsQuery.update({
              modelsOpencode: resp.result.value.modelsOpencode,
              modelsAi: resp.result.value.modelsAi
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
