import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { PATH_PROFILE } from '~common/constants/top';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { AuthService } from '~front/app/services/auth.service';

@Component({
  standalone: false,
  selector: 'm-user-menu',
  templateUrl: './user-menu.component.html'
})
export class UserMenuComponent implements OnInit {
  pathProfile = PATH_PROFILE;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[1];
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  mproveVersion: string = undefined;
  mproveVersion$ = this.navQuery.mproveVersion$.pipe(
    tap(x => (this.mproveVersion = x))
  );

  constructor(
    private authService: AuthService,
    private router: Router,
    private uiQuery: UiQuery,
    public navQuery: NavQuery,
    public userQuery: UserQuery
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[1];
  }

  navigateProfile() {
    this.router.navigate([PATH_PROFILE]);
  }

  logout() {
    this.authService.logout();
  }
}
