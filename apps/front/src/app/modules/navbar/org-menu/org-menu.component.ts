import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { AuthService } from '~front/app/services/auth.service';
import { NavState } from '~front/app/stores/nav.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-org-menu',
  templateUrl: './org-menu.component.html'
})
export class OrgMenuComponent implements OnInit {
  @Input()
  isOrgMenuOpen = false;

  pathAccount = common.PATH_ACCOUNT;

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

  constructor(
    public orgQuery: OrgQuery,
    public navQuery: NavQuery,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[3];
  }

  account() {
    this.isOrgMenuOpen = false;
    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_ACCOUNT
    ]);
  }

  logout() {
    this.authService.logout();
  }
}
