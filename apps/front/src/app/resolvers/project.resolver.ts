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
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ProjectQuery } from '../queries/project.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProjectResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private router: Router,
    private projectQuery: ProjectQuery,
    private memberQuery: MemberQuery,
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

            this.navQuery.updatePart({
              projectId: project.projectId,
              projectName: project.name,
              projectDefaultBranch: project.defaultBranch,
              isRepoProd: true,
              branchId: project.defaultBranch,
              envId: common.PROJECT_ENV_PROD
            });

            localStorage.setItem(
              constants.LOCAL_STORAGE_PROJECT_ID,
              project.projectId
            );

            this.memberQuery.update(resp.payload.userMember);

            this.projectQuery.update(project);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
