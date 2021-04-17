import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserQuery } from '~front/app/queries/user.query';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-user-menu',
  templateUrl: './user-menu.component.html'
})
export class UserMenuComponent implements OnInit {
  isUserMenuOpen = false;

  lastUrl: string;

  pathProfile = common.PATH_PROFILE;

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
