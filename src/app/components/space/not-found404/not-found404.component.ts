import { Component } from '@angular/core';
import * as services from 'app/services/_index';

@Component({
  selector: 'm-not-found',
  templateUrl: './not-found404.component.html'
})
export class NotFound404Component {
  constructor(public pageTitle: services.PageTitleService) {
    this.pageTitle.setTitle('404 Not Found | Mprove');
  }
}
