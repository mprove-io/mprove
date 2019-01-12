import { Component } from '@angular/core';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-verify-email',
  templateUrl: 'verify-email.component.html'
})
export class VerifyEmailComponent {
  constructor(public pageTitle: services.PageTitleService) {
    this.pageTitle.setTitle('Verify Email | Mprove');
  }
}
