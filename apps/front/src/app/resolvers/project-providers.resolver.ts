import { Injectable } from '@angular/core';
import {
  type ActivatedRouteSnapshot,
  type Resolve,
  Router,
  type RouterStateSnapshot
} from '@angular/router';
import type { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import type { ToBackendGetProvidersRequest } from '#common/zod/backend/routes/providers/get-providers/get-providers-request';
import type { ToBackendGetProvidersResponse } from '#common/zod/backend/routes/providers/get-providers/get-providers-response';
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

    let payload: ToBackendGetProvidersRequest['input'] = {
      projectId: projectId
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetProviders',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetProvidersResponse) => {
          if (resp?.type !== 'Success') {
            return false;
          }

          this.memberQuery.update(resp.output.userMember);

          this.providersQuery.update({
            providers: resp.output.providers
          });

          return true;
        })
      );
  }
}
