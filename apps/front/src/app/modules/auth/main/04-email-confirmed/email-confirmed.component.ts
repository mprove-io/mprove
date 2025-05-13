import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  standalone: false,
  selector: 'm-email-confirmed',
  templateUrl: './email-confirmed.component.html'
})
export class EmailConfirmedComponent implements OnInit {
  pageTitle = constants.EMAIL_IS_CONFIRMED_PAGE_TITLE;

  constructor(
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  ok() {
    this.router.navigate([common.PATH_LOGIN]);
  }
}
