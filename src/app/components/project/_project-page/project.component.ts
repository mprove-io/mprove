import { Component, OnDestroy } from '@angular/core';
import * as enums from '@app/enums/_index';
import * as services from '@app/services/_index';
import * as interfaces from '@app/interfaces/_index';
import * as actions from '@app/store/actions/_index';
import { Store } from '@ngrx/store';

@Component({
  moduleId: module.id,
  selector: 'm-project',
  templateUrl: 'project.component.html',
  styleUrls: ['project.component.scss']
})
export class ProjectComponent implements OnDestroy {
  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>
  ) {}

  ngOnDestroy() {
    this.store.dispatch(new actions.UpdateLayoutProjectIdAction(undefined));
  }
}
