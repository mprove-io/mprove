import { Component, OnInit } from '@angular/core';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-login',
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {

  constructor(
    private auth: services.AuthService,
    public pageTitle: services.PageTitleService) {

    this.pageTitle.setTitle('Login | Mprove');
  }

  ngOnInit() {
    localStorage.removeItem('redirect_url');
    this.auth.login();
  }
}
