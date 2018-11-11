import { Component } from '@angular/core';
import * as enums from 'app/enums/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-project',
  templateUrl: 'project.component.html',
  styleUrls: ['project.component.scss']
})

export class ProjectComponent {
  constructor(private printer: services.PrinterService) {
  }

  activateEvent(event: any) {
    this.printer.log(enums.busEnum.ACTIVATE_EVENT, 'from ProjectComponent:', event);
  }

  deactivateEvent(event: any) {
    this.printer.log(enums.busEnum.DEACTIVATE_EVENT, 'from ProjectComponent:', event);
  }
}
