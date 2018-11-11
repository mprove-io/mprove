import { Component } from '@angular/core';
import * as services from 'app/services/_index';

@Component({
  selector: 'm-not-found',
  template: '<h3>Error 404: Not found</h3>'
})

export class NotFound404Component {
  constructor(public pageTitle: services.PageTitleService) {
    this.pageTitle.setTitle('404 Not Found | Mprove');
  }
}
