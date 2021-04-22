import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
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

  avatarSmall: string;

  avatarSmall$ = this.navQuery.avatarSmall$.pipe(
    tap((x: any) => {
      console.log(x);
      this.avatarSmall = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public userQuery: UserQuery,
    public navQuery: NavQuery,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
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
