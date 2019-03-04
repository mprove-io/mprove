import { Component } from '@angular/core';
import * as enums from '@app/enums/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-repo',
  templateUrl: 'repo.component.html'
})
export class RepoComponent {
  constructor(private printer: services.PrinterService) {}
}
