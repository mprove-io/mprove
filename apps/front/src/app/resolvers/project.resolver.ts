import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import {
  PARAMETER_PROJECT_ID,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { LOCAL_STORAGE_PROJECT_ID } from '#common/constants/top-front';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetProjectRequestPayload,
  ToBackendGetProjectResponse
} from '#common/interfaces/to-backend/projects/to-backend-get-project';
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

    let payload: ToBackendGetProjectRequestPayload = {
      projectId: route.params[PARAMETER_PROJECT_ID]
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetProject,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetProjectResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let project = resp.payload.project;

            this.navQuery.updatePart({
              projectId: project.projectId,
              projectName: project.name,
              projectDefaultBranch: project.defaultBranch,
              repoId: PROD_REPO_ID,
              repoType: RepoTypeEnum.Prod,
              branchId: project.defaultBranch,
              envId: PROJECT_ENV_PROD
            });

            localStorage.setItem(LOCAL_STORAGE_PROJECT_ID, project.projectId);

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
