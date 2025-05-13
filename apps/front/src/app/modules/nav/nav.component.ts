import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent implements OnInit {
  currentRoute: string;

  pathRegister = common.PATH_REGISTER;
  pathLogin = common.PATH_LOGIN;
  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.lastUrl = x.url.split('/')[1];
    })
  );

  constructor(private router: Router) {}

  ngOnInit() {
    this.lastUrl = this.router.url.split('/')[1];
  }

  signUp() {
    this.router.navigate([common.PATH_REGISTER]);
  }
  login() {
    this.router.navigate([common.PATH_LOGIN]);
  }
}
