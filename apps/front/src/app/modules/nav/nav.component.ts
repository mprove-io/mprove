import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent implements OnInit {
  currentRoute: string;

  pathRegister = constants.PATH_REGISTER;
  pathLogin = constants.PATH_LOGIN;
  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[1];
    })
  );

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[1];
  }

  signUp() {
    this.router.navigate([constants.PATH_REGISTER]);
  }
  login() {
    this.router.navigate([constants.PATH_LOGIN]);
  }
}
