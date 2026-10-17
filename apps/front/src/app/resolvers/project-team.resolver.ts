import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { MEMBERS_PER_PAGE } from '#common/constants/top-front';
import type { ToBackendGetMembersOutput } from '#common/types/backend/routes/members/get-members/get-members-output';
import type { ToBackendGetMembersRequest } from '#common/types/backend/routes/members/get-members/get-members-request';
import { checkNavOrgProject } from '../functions/check-nav-org-project';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { RolesQuery } from '../queries/roles.query';
import { TeamQuery } from '../queries/team.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProjectTeamResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private router: Router,
    private apiService: ApiService,
    private memberQuery: MemberQuery,
    private teamQuery: TeamQuery,
    private rolesQuery: RolesQuery
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

    checkNavOrgProject({
      router: this.router,
      route: route,
      nav: nav
    });

    let projectId;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: ToBackendGetMembersRequest['input'] = {
      projectId: projectId,
      pageNum: 1,
      perPage: MEMBERS_PER_PAGE
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetMembers',
        payload: payload
      })
      .pipe(
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendGetMembersOutput = resp.output;

            this.memberQuery.update(output.userMember);

            this.teamQuery.update(output);

            this.rolesQuery.update({
              roles: output.roles
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
