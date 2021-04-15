import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-password-reset-sent',
  templateUrl: './password-reset-sent.component.html'
})
export class PasswordResetSentComponent implements OnInit {
  email: string;

  constructor(private router: Router) {}

  ngOnInit() {
    this.email = localStorage.getItem('passwordResetEmail');
  }

  done() {
    this.router.navigate([common.PATH_LOGIN]);
  }
}
