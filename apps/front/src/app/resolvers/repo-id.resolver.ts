import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import {
  PARAMETER_REPO_ID,
  PATH_INFO,
  PATH_ORG,
  PATH_PROJECT,
  PROD_REPO_ID
} from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { checkNavOrgProject } from '../functions/check-nav-org-project';
import { NavQuery, NavState } from '../queries/nav.query';
import { UserQuery } from '../queries/user.query';
import { MyDialogService } from '../services/my-dialog.service';

@Injectable({ providedIn: 'root' })
export class RepoIdResolver implements Resolve<Observable<boolean>> {
  constructor(
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private myDialogService: MyDialogService,
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

    if (repoId !== PROD_REPO_ID && repoId !== userId) {
      this.myDialogService.showError({
        errorData: {
          message: ErEnum.FRONT_FORBIDDEN_REPO
        },
        isThrow: false
      });

      this.router.navigate([
        PATH_ORG,
        nav.orgId,
        PATH_PROJECT,
        nav.projectId,
        PATH_INFO
      ]);

      return of(false);
    }

    this.navQuery.updatePart({
      isRepoProd: repoId === PROD_REPO_ID
    });

    return of(false);
  }
}
