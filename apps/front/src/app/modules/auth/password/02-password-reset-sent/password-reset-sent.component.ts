import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-password-reset-sent',
  templateUrl: './password-reset-sent.component.html'
})
export class PasswordResetSentComponent implements OnInit {
  pageTitle = constants.PASSWORD_RESET_EMAIL_SENT_PAGE_TITLE;

  email: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    this.email = localStorage.getItem('PASSWORD_RESET_EMAIL');
  }

  done() {
    if (this.authService.authenticated()) {
      this.router.navigate([common.PATH_PROFILE]);
    } else {
      this.router.navigate([common.PATH_LOGIN]);
    }
  }
}
