import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-new-password-was-set',
  templateUrl: './new-password-was-set.component.html'
})
export class NewPasswordWasSetComponent implements OnInit {
  pageTitle = constants.NEW_PASSWORD_WAS_SET_PAGE_TITLE;

  constructor(
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  login() {
    this.router.navigate([common.PATH_LOGIN]);
  }
}
