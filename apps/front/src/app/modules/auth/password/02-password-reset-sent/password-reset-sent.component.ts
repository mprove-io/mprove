import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '~front/app/services/auth.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-password-reset-sent',
  templateUrl: './password-reset-sent.component.html'
})
export class PasswordResetSentComponent implements OnInit {
  email: string;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
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
