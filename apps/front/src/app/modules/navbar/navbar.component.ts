import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';
import { makeBranchExtraId } from '~front/app/functions/make-branch-extra-id';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { NavState } from '~front/app/stores/nav.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private router: Router,
    public navQuery: NavQuery,
    public userQuery: UserQuery,
    private cd: ChangeDetectorRef
  ) {}

  navigateBlockml() {
    let alias;
    this.userQuery.alias$
      .pipe(
        tap(z => (alias = z)),
        take(1)
      )
      .subscribe();

    let branchExtraId = makeBranchExtraId({
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd,
      alias: alias
    });

    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_BRANCH,
      branchExtraId,
      common.PATH_BLOCKML
    ]);
  }
}
