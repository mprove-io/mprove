import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { checkNavOrgProjectRepoBranchEnv } from '../functions/check-nav-org-project-repo-branch-env';
import { NavQuery, NavState } from '../queries/nav.query';
import { UiQuery } from '../queries/ui.query';
import { UserQuery } from '../queries/user.query';
import { ApiService } from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class StructReportsResolver implements Resolve<Observable<boolean>> {
  constructor(
    private router: Router,
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private apiService: ApiService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    checkNavOrgProjectRepoBranchEnv({
      router: this.router,
      route: route,
      nav: nav,
      userId: userId
    });

    let loadDiff = Date.now() - this.uiQuery.getValue().metricsLoadedTs;

    if (loadDiff < 100) {
      return of(true);
    }

    return this.apiService.resolveReportsRoute({
      showSpinner: false
    });
  }
}
