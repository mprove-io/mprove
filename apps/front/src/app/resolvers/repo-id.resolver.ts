import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { enums } from '~front/barrels/enums';
import { NavQuery } from '../queries/nav.query';
import { UserQuery } from '../queries/user.query';
import { MyDialogService } from '../services/my-dialog.service';
import { NavState, NavStore } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class RepoIdResolver implements Resolve<Promise<boolean>> {
  constructor(
    private navStore: NavStore,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private myDialogService: MyDialogService,
    private router: Router
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
    let repoId = route.params[common.PARAMETER_REPO_ID];

    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    if (repoId !== common.PROD_REPO_ID && repoId !== userId) {
      this.myDialogService.showError({
        errorData: {
          message: enums.ErEnum.FRONT_FORBIDDEN_REPO
        },
        isThrow: false
      });

      let nav: NavState;
      this.navQuery
        .select()
        .pipe(take(1))
        .subscribe(x => {
          nav = x;
        });

      this.router.navigate([
        common.PATH_ORG,
        nav.orgId,
        common.PATH_PROJECT,
        nav.projectId,
        common.PATH_SETTINGS
      ]);

      return false;
    }

    this.navStore.update(state =>
      Object.assign({}, state, <NavState>{
        isRepoProd: repoId === common.PROD_REPO_ID
      })
    );

    return true;
  }
}
