import { Component } from '@angular/core';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-soft',
  templateUrl: 'soft.component.html'
})
export class SoftComponent {
  constructor(public pageTitle: services.PageTitleService) {
    this.pageTitle.setTitle('Mprove');
  }
}
