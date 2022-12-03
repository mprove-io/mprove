import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { checkNavOrg } from '../functions/check-nav-org';
import { NavQuery } from '../queries/nav.query';
import { ApiService } from '../services/api.service';
import { MemberStore } from '../stores/member.store';
import { NavState, NavStore } from '../stores/nav.store';
import { ProjectStore } from '../stores/project.store';

@Injectable({ providedIn: 'root' })
export class ProjectResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navStore: NavStore,
    private navQuery: NavQuery,
    private router: Router,
    private projectStore: ProjectStore,
    private memberStore: MemberStore,
    private apiService: ApiService
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

    checkNavOrg({
      router: this.router,
      route: route,
      nav: nav
    });

    let payload: apiToBackend.ToBackendGetProjectRequestPayload = {
      projectId: route.params[common.PARAMETER_PROJECT_ID]
    };

    return this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetProjectResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let project = resp.payload.project;

            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                projectId: project.projectId,
                projectName: project.name,
                projectDefaultBranch: project.defaultBranch,
                isRepoProd: true,
                branchId: project.defaultBranch,
                envId: common.PROJECT_ENV_PROD
              })
            );

            localStorage.setItem(
              constants.LOCAL_STORAGE_PROJECT_ID,
              project.projectId
            );

            this.memberStore.update(resp.payload.userMember);

            this.projectStore.update(project);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
