import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { AuthService } from '~front/app/services/auth.service';
import { UiStore } from '~front/app/stores/ui.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-user-menu',
  templateUrl: './user-menu.component.html'
})
export class UserMenuComponent implements OnInit, OnDestroy {
  menuId = 'userMenu';

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isUserMenuOpen = false;

  pathProfile = common.PATH_PROFILE;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[1];
    })
  );

  constructor(
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    public navQuery: NavQuery,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[1];
  }

  profile() {
    this.closeMenu();
    this.router.navigate([common.PATH_PROFILE]);
  }

  logout() {
    this.authService.logout();
  }

  openMenu() {
    this.isUserMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu() {
    this.isUserMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu() {
    if (this.isUserMenuOpen === true) {
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
