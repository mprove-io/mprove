import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-user-menu',
  templateUrl: './user-menu.component.html'
})
export class UserMenuComponent implements OnInit {
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
    public userQuery: UserQuery,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[1];
  }

  profile() {
    this.isUserMenuOpen = false;
    this.router.navigate([common.PATH_PROFILE]);
  }

  logout() {
    this.authService.logout();
  }
}
