import { Component } from '@angular/core';
import * as enums from 'src/app/enums/_index';
import * as services from 'src/app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-repo',
  templateUrl: 'repo.component.html'
})

export class RepoComponent {
  constructor(private printer: services.PrinterService) {
  }

  activateEvent(event: any) {
    this.printer.log(enums.busEnum.ACTIVATE_EVENT, 'from RepoComponent:', event);
  }

  deactivateEvent(event: any) {
    this.printer.log(enums.busEnum.DEACTIVATE_EVENT, 'from RepoComponent:', event);
  }
}
