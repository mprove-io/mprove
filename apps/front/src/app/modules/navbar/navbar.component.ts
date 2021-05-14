import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
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
    private cd: ChangeDetectorRef
  ) {}

  navigateBlockml() {
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_BLOCKML
    ]);
  }
}
