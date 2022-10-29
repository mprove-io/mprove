import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { MemberState, MemberStore } from '../stores/member.store';
import { TeamStore } from '../stores/team.store';

@Injectable({ providedIn: 'root' })
export class ProjectTeamResolver implements Resolve<Promise<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private memberStore: MemberStore,
    private teamStore: TeamStore
  ) {}

  async resolve(): Promise<boolean> {
    let projectId;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: apiToBackend.ToBackendGetMembersRequestPayload = {
      projectId: projectId,
      pageNum: 1,
      perPage: constants.MEMBERS_PER_PAGE
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMembers,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetMembersResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberStore.update(state =>
              Object.assign(resp.payload.userMember, <MemberState>{
                avatarSmall: state.avatarSmall
              })
            );
            this.teamStore.update(resp.payload);
            return true;
          } else {
            return false;
          }
        })
      )
      .toPromise();
  }
}
