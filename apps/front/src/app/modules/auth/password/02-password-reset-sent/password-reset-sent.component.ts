import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PASSWORD_RESET_EMAIL_SENT_PAGE_TITLE } from '~common/constants/page-titles';
import { PATH_LOGIN, PATH_PROFILE } from '~common/constants/top';
import { AuthService } from '~front/app/services/auth.service';

@Component({
  standalone: false,
  selector: 'm-password-reset-sent',
  templateUrl: './password-reset-sent.component.html'
})
export class PasswordResetSentComponent implements OnInit {
  pageTitle = PASSWORD_RESET_EMAIL_SENT_PAGE_TITLE;

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
      this.router.navigate([PATH_PROFILE]);
    } else {
      this.router.navigate([PATH_LOGIN]);
    }
  }
}
