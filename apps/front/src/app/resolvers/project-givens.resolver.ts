import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import type { ToBackendGetGivensOutput } from '#common/types/backend/routes/givens/get-givens/get-givens-output';
import type { ToBackendGetGivensRequest } from '#common/types/backend/routes/givens/get-givens/get-givens-request';
import { checkNavOrgProject } from '../functions/check-nav-org-project';
import { GivensQuery } from '../queries/givens.query';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class ProjectGivensResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private router: Router,
    private apiService: ApiService,
    private memberQuery: MemberQuery,
    private givensQuery: GivensQuery
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

    let payload: ToBackendGetGivensRequest['input'] = {
      projectId: projectId
    };

    return this.apiService
      .req({
        route: 'api/ToBackendGetGivens',
        payload: payload
      })
      .pipe(
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendGetGivensOutput = resp.output;

            this.memberQuery.update(output.userMember);

            let newSortedGivens = output.givens.sort((a, b) =>
              a.givenId > b.givenId ? 1 : b.givenId > a.givenId ? -1 : 0
            );

            this.givensQuery.update({
              givens: newSortedGivens
            });

            return true;
          } else {
            return false;
          }
        })
      );
  }
}
