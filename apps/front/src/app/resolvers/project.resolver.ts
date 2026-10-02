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
import type { ToBackendGetProjectRequest } from '#common/types/backend/routes/projects/get-project/get-project-request';
import type { ToBackendGetProjectResponse } from '#common/types/backend/routes/projects/get-project/get-project-response';
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

    let payload: ToBackendGetProjectRequest['input'] = {
      projectId: route.params[PARAMETER_PROJECT_ID]
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetProject',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetProjectResponse) => {
          if (resp?.type === 'Success') {
            let project = resp.output.project;

            this.navQuery.updatePart({
              projectId: project.projectId,
              projectName: project.name,
              projectDefaultBranch: project.defaultBranch,
              repoId: PROD_REPO_ID,
              repoType: RepoTypeEnum.Production,
              branchId: project.defaultBranch,
              envId: PROJECT_ENV_PROD
            });

            localStorage.setItem(LOCAL_STORAGE_PROJECT_ID, project.projectId);

            this.memberQuery.update(resp.output.userMember);

            this.projectQuery.update(project);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
