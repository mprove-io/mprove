import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import {
  PARAMETER_BRANCH_ID,
  PARAMETER_REPO_ID,
  PROD_REPO_ID
} from '#common/constants/top';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { checkNavOrgProject } from '../functions/check-nav-org-project';
import { NavQuery, NavState } from '../queries/nav.query';
import { UserQuery } from '../queries/user.query';

@Injectable({ providedIn: 'root' })
export class RepoIdResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    let nav: NavState;
    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        nav = x;
      });

    checkNavOrgProject({
      router: this.router,
      route: route,
      nav: nav
    });

    let repoId = route.params[PARAMETER_REPO_ID];

    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    let repoType =
      repoId === PROD_REPO_ID
        ? RepoTypeEnum.Prod
        : repoId === userId
          ? RepoTypeEnum.Dev
          : RepoTypeEnum.Session;

    let branchId = route.firstChild?.params[PARAMETER_BRANCH_ID];

    let part: Partial<NavState> = {
      repoId: repoId,
      repoType: repoType
    };

    if (branchId !== undefined) {
      part.branchId = branchId;
    }

    this.navQuery.updatePart(part);

    return of(false);
  }
}
