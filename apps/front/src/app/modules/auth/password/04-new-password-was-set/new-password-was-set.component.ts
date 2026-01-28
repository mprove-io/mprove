import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NEW_PASSWORD_WAS_SET_PAGE_TITLE } from '#common/constants/page-titles';
import { PATH_LOGIN } from '#common/constants/top';

@Component({
  standalone: false,
  selector: 'm-new-password-was-set',
  templateUrl: './new-password-was-set.component.html'
})
export class NewPasswordWasSetComponent implements OnInit {
  pageTitle = NEW_PASSWORD_WAS_SET_PAGE_TITLE;

  constructor(
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  login() {
    this.router.navigate([PATH_LOGIN]);
  }
}
