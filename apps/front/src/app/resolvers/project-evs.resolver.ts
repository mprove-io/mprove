import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { EvsStore } from '../stores/evs.store';
import { MemberState, MemberStore } from '../stores/member.store';
import { NavState } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class ProjectEvsResolver implements Resolve<Promise<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private memberStore: MemberStore,
    private evsStore: EvsStore
  ) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Promise<boolean> {
    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let environmentId = route.params[common.PARAMETER_ENVIRONMENT_ID];

    let payload: apiToBackend.ToBackendGetEvsRequestPayload = {
      projectId: nav.projectId,
      envId: environmentId
    };

    return this.apiService
      .req({
        pathInfoName: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEvs,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetEvsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberStore.update(state =>
              Object.assign(resp.payload.userMember, <MemberState>{
                avatarSmall: state.avatarSmall
              })
            );
            this.evsStore.update(resp.payload);
            return true;
          } else {
            return false;
          }
        })
      )
      .toPromise();
  }
}
