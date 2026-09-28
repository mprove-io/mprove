import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import type { ToBackendGetProjectRequest } from '#common/zod/backend/routes/projects/get-project/get-project-request';
import type { ToBackendGetProjectResponse } from '#common/zod/backend/routes/projects/get-project/get-project-response';
import { checkNavOrgProject } from '../functions/check-nav-org-project';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ProjectQuery } from '../queries/project.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProjectInfoResolver implements Resolve<Observable<boolean>> {
  constructor(
    private projectQuery: ProjectQuery,
    private navQuery: NavQuery,
    private router: Router,
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

    checkNavOrgProject({
      router: this.router,
      route: route,
      nav: nav
    });

    let projectId;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: ToBackendGetProjectRequest['input'] = {
      projectId: projectId
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetProject',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetProjectResponse) => {
          if (resp?.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);

            this.projectQuery.update(resp.output.project);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
