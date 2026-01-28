import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetProjectRequestPayload,
  ToBackendGetProjectResponse
} from '#common/interfaces/to-backend/projects/to-backend-get-project';
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

    let payload: ToBackendGetProjectRequestPayload = {
      projectId: projectId
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetProject,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetProjectResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.projectQuery.update(resp.payload.project);
            return true;
          } else {
            return false;
          }
        })
      );
  }
}
