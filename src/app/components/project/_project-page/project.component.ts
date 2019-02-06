import { Component } from '@angular/core';
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
export class ProjectComponent {
  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>
  ) {}

  activateEvent(event: any) {
    this.printer.log(
      enums.busEnum.ACTIVATE_EVENT,
      'from ProjectComponent:',
      event
    );
  }

  deactivateEvent(event: any) {
    this.printer.log(
      enums.busEnum.DEACTIVATE_EVENT,
      'from ProjectComponent:',
      event
    );

    this.store.dispatch(new actions.UpdateLayoutProjectIdAction(undefined));

    // let mode: enums.LayoutModeEnum;
    // this.store
    //   .select(selectors.getLayoutMode)
    //   .pipe(take(1))
    //   .subscribe(x => (mode = x));

    // if (mode === enums.LayoutModeEnum.Dev) {
    //   this.store.dispatch(new actions.SetLayoutModeProdAction());
    // }
  }
}
