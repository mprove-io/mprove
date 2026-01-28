import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import {
  DEMO_ORG_NAME,
  PATH_ACCOUNT,
  PATH_ORG,
  PATH_USERS
} from '#common/constants/top';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery, UserState } from '~front/app/queries/user.query';

@Component({
  standalone: false,
  selector: 'm-org-menu',
  templateUrl: './org-menu.component.html'
})
export class OrgMenuComponent implements OnInit {
  demoOrgName = DEMO_ORG_NAME;

  pathAccount = PATH_ACCOUNT;
  pathUsers = PATH_USERS;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[3];
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  user: UserState;
  user$ = this.userQuery.select().pipe(
    tap(x => {
      this.user = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private orgQuery: OrgQuery,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[3];
  }

  navigateAccount() {
    this.router.navigate([PATH_ORG, this.nav.orgId, PATH_ACCOUNT]);
  }

  navigateUsers() {
    this.router.navigate([PATH_ORG, this.nav.orgId, PATH_USERS]);
  }
}
