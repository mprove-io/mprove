import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { PATH_LOGIN, PATH_REGISTER } from '~common/constants/top';

@Component({
  standalone: false,
  selector: 'm-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent implements OnInit {
  currentRoute: string;

  pathRegister = PATH_REGISTER;
  pathLogin = PATH_LOGIN;
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
    this.router.navigate([PATH_REGISTER]);
  }
  login() {
    this.router.navigate([PATH_LOGIN]);
  }
}
