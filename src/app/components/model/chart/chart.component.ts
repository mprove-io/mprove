import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as api from '@app/api/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-chart',
  templateUrl: 'chart.component.html',
  styleUrls: ['chart.component.scss']
})
export class ChartComponent {
  @ViewChild('sidenav') sidenav: MatSidenav;

  visual: interfaces.Visual;
  visual$ = this.store.select(selectors.getSelectedVisual).pipe(
    filter(v => !!v),
    tap(x => (this.visual = x))
  );

  dashTheme: api.UserDashThemeEnum; // no filter
  dashTheme$ = this.store
    .select(selectors.getUserDashTheme)
    .pipe(tap(x => (this.dashTheme = x))); // no filter

  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>
  ) {}

  canDeactivate(): boolean {
    // used in component-deactivate-guard
    this.printer.log(
      enums.busEnum.CAN_DEACTIVATE_CHECK,
      'from ChartComponent:',
      event
    );
    this.store.dispatch(new actions.UpdateLayoutChartIdAction(undefined));
    return true;
  }

  close() {
    this.sidenav.close();
  }
}
