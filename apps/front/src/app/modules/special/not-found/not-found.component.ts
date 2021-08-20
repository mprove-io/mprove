import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-not-found',
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent implements OnInit {
  pageTitle = constants.PAGE_NOT_FOUND_PAGE_TITLE;

  constructor(private title: Title) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }
}
