import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-project-menu',
  templateUrl: './project-menu.component.html'
})
export class ProjectMenuComponent implements OnInit {
  restrictedUserAlias = common.RESTRICTED_USER_ALIAS;

  firstOrgName = common.FIRST_ORG_NAME;

  pathInfo = common.PATH_INFO;
  pathConnections = common.PATH_CONNECTIONS;
  pathEnvironments = common.PATH_ENVIRONMENTS;
  pathTeam = common.PATH_TEAM;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[5];
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

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
      this.cd.detectChanges();
    })
  );

  isAdmin: boolean;
  isAdmin$ = this.memberQuery.isAdmin$.pipe(
    tap(x => {
      this.isAdmin = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private orgQuery: OrgQuery,
    private userQuery: UserQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[5];
  }

  navigateInfo() {
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_INFO
    ]);
  }

  navigateConnections() {
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_CONNECTIONS
    ]);
  }

  navigateEnvironments() {
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_ENVIRONMENTS
    ]);
  }

  navigateTeam() {
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_TEAM
    ]);
  }
}
