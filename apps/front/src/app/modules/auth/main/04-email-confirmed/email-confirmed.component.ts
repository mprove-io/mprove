import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { EMAIL_IS_CONFIRMED_PAGE_TITLE } from '~common/constants/page-titles';
import { PATH_LOGIN } from '~common/constants/top';

@Component({
  standalone: false,
  selector: 'm-email-confirmed',
  templateUrl: './email-confirmed.component.html'
})
export class EmailConfirmedComponent implements OnInit {
  pageTitle = EMAIL_IS_CONFIRMED_PAGE_TITLE;

  constructor(
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  ok() {
    this.router.navigate([PATH_LOGIN]);
  }
}
