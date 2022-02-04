import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { enums } from '~front/barrels/enums';
import { NavQuery } from '../queries/nav.query';
import { UserQuery } from '../queries/user.query';
import { MyDialogService } from '../services/my-dialog.service';
import { NavState, NavStore } from '../stores/nav.store';
import { MemberResolver } from './member.resolver';

@Injectable({ providedIn: 'root' })
export class MemberRepoResolver implements Resolve<Promise<boolean>> {
  constructor(
    private navStore: NavStore,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private memberResolver: MemberResolver,
    private myDialogService: MyDialogService,
    private router: Router
  ) {}

  async resolve(route: ActivatedRouteSnapshot): Promise<boolean> {
    let pass = await this.memberResolver.resolve().toPromise();

    if (pass === false) {
      return false;
    }

    let repoId = route.params[common.PARAMETER_REPO_ID];

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

    if (repoId !== common.PROD_REPO_ID && repoId !== userId) {
      this.myDialogService.showError({
        errorData: {
          message: enums.ErEnum.FRONT_FORBIDDEN_REPO
        },
        isThrow: false
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
        isRepoProd: repoId === common.PROD_REPO_ID,
        branchId: undefined
      })
    );

    return true;
  }
}
