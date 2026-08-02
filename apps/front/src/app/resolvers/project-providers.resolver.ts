import { Injectable } from '@angular/core';
import {
  type ActivatedRouteSnapshot,
  type Resolve,
  Router,
  type RouterStateSnapshot
} from '@angular/router';
import type { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendGetProvidersRequestPayload,
  ToBackendGetProvidersResponse
} from '#common/zod/to-backend/providers/to-backend-get-providers';
import { checkNavOrgProject } from '../functions/check-nav-org-project';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, type NavState } from '../queries/nav.query';
import { ProvidersQuery } from '../queries/providers.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProjectProvidersResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private memberQuery: MemberQuery,
    private router: Router,
    private providersQuery: ProvidersQuery
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

    let projectId: string;

    this.navQuery.projectId$.pipe(take(1)).subscribe(x => {
      projectId = x;
    });

    let payload: ToBackendGetProvidersRequestPayload = {
      projectId: projectId
    };

    return this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetProviders,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetProvidersResponse) => {
          if (resp.info?.status !== ResponseInfoStatusEnum.Ok) {
            return false;
          }

          this.memberQuery.update(resp.payload.userMember);

          this.providersQuery.update({
            providers: resp.payload.providers
          });

          return true;
        })
      );
  }
}
