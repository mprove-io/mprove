import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { AuthService } from '~front/app/services/auth.service';
import { NavState } from '~front/app/stores/nav.store';
import { UiStore } from '~front/app/stores/ui.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-project-menu',
  templateUrl: './project-menu.component.html'
})
export class ProjectMenuComponent implements OnInit, OnDestroy {
  menuId = 'projectMenu';

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isProjectMenuOpen = false;

  pathSettings = common.PATH_SETTINGS;
  pathConnections = common.PATH_CONNECTIONS;
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

  constructor(
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    public orgQuery: OrgQuery,
    public navQuery: NavQuery,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[5];
  }

  navigateSettings() {
    this.closeMenu();
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_SETTINGS
    ]);
  }

  navigateConnections() {
    this.closeMenu();
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_CONNECTIONS
    ]);
  }

  navigateTeam() {
    this.closeMenu();
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_TEAM
    ]);
  }

  openMenu() {
    this.isProjectMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu() {
    this.isProjectMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu() {
    if (this.isProjectMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  ngOnDestroy() {
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}
