import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import * as enums from 'app/enums/_index';
import * as services from 'app/services/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Component({
  selector: 'm-nav-dev-prod',
  templateUrl: 'nav-dev-prod.component.html',
  styleUrls: ['nav-dev-prod.component.scss']
})
export class NavDevProdComponent {
  projectId: string;
  projectId$ = this.store.select(selectors.getLayoutProjectId).pipe(
    filter(v => !!v),
    tap(x => (this.projectId = x))
  );

  selectedProjectUserIsEditor$ = this.store.select(
    selectors.getSelectedProjectUserIsEditor
  ); // no filter here

  needSave$ = this.store.select(selectors.getLayoutNeedSave); // no filter here

  layoutModeIsDev: boolean;
  layoutModeIsDev$ = this.store
    .select(selectors.getLayoutModeIsDev) // no filter here
    .pipe(tap(x => (this.layoutModeIsDev = x)));

  mode: enums.LayoutModeEnum;
  mode$ = this.store.select(selectors.getLayoutMode).pipe(
    filter(v => !!v),
    tap(x => (this.mode = x))
  );

  constructor(
    private store: Store<interfaces.AppState>,
    private router: Router,
    private printer: services.PrinterService
  ) {}

  toggleMode() {
    this.printer.log(enums.busEnum.SPACE_COMPONENT_TOGGLE, 'toggling mode...');

    if (this.mode === enums.LayoutModeEnum.Dev) {
      this.router.navigate([
        '/project',
        this.projectId,
        'mode',
        enums.LayoutModeEnum.Prod,
        'blockml'
      ]);
    } else {
      this.router.navigate([
        '/project',
        this.projectId,
        'mode',
        enums.LayoutModeEnum.Dev,
        'blockml'
      ]);
    }
  }

  showDev() {
    return this.layoutModeIsDev ? 'Dev' : '';
  }

  showProd() {
    return this.layoutModeIsDev ? '' : 'Prod';
  }
}
