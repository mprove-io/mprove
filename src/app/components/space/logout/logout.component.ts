import { Component } from '@angular/core';
import * as services from 'src/app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-logout',
  templateUrl: 'logout.component.html'
})

export class LogoutComponent {

  constructor(public pageTitle: services.PageTitleService) {
    this.pageTitle.setTitle('Logout | Mprove');
  }
}
