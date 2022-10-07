import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { ConnectionsStore } from '../stores/connections.store';
import { MemberResolver } from './member.resolver';

@Injectable({ providedIn: 'root' })
export class MemberConnectionsResolver implements Resolve<Promise<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private memberResolver: MemberResolver,
    private connectionsStore: ConnectionsStore
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Promise<boolean> {
    let pass = await this.memberResolver.resolve().toPromise();

    if (pass === false) {
      return false;
    }

    let projectId;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: apiToBackend.ToBackendGetConnectionsRequestPayload = {
      projectId: projectId,
      pageNum: 1,
      perPage: constants.CONNECTIONS_PER_PAGE
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetConnections,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetConnectionsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.connectionsStore.update({
              connections: resp.payload.connections,
              total: resp.payload.total
            });
            return true;
          } else {
            return false;
          }
        })
      )
      .toPromise();
  }
}
