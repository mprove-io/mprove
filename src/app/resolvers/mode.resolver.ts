import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as enums from 'app/enums/_index';
import * as services from 'app/services/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Injectable()
export class ModeResolver implements Resolve<boolean> {
  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.printer.log(enums.busEnum.MODE_RESOLVER, 'starts...');
    // this.printer.log(enums.busEnum.MODE_RESOLVER, 'route:', route);

    // this.store.select(selectors.getLayoutChartId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutChartIdAction(undefined)) : 0);
    //
    // this.store.select(selectors.getLayoutQueryId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutQueryIdAction(undefined)) : 0);
    //
    // this.store.select(selectors.getLayoutMconfigId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutMconfigIdAction(undefined)) : 0);
    //
    // this.store.select(selectors.getLayoutModelId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutModelIdAction(undefined)) : 0);

    // this.store.select(selectors.getLayoutDashboardId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutDashboardIdAction(undefined)) : 0);

    // this.store.select(selectors.getLayoutNeedSave).take(1).subscribe(
    //   x => x ? this.store.dispatch(new SetLayoutNeedSaveFalseAction()) : 0);
    //
    // this.store.select(selectors.getLayoutLineNumber).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutLineNumberAction(undefined)) : 0);
    //
    // this.store.select(selectors.getLayoutFileId).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutFileIdAction(undefined)) : 0);

    let selectedProjectId: string;
    this.store
      .select(selectors.getSelectedProjectId)
      .pipe(take(1))
      .subscribe(x => (selectedProjectId = x));

    if (!selectedProjectId) {
      this.printer.log(
        enums.busEnum.MODE_RESOLVER,
        `selectedProjectId undefined`
      );
      this.printer.log(enums.busEnum.MODE_RESOLVER, `resolved (false)`);
      return of(false);
    }

    switch (route.params['mode']) {
      case enums.LayoutModeEnum.Prod: {
        this.printer.log(enums.busEnum.MODE_RESOLVER, 'setting prod mode...');
        this.store.dispatch(new actions.SetLayoutModeProdAction());

        this.printer.log(
          enums.busEnum.MODE_RESOLVER,
          'will be resolved (true)'
        );
        return this.store.select(selectors.getLayoutModeIsDev).pipe(
          filter(isDev => !isDev),
          take(1)
        );
        // return of(true);
      }

      case enums.LayoutModeEnum.Dev: {
        let userIsEditor: boolean;
        this.store
          .select(selectors.getSelectedProjectUserIsEditor)
          .pipe(take(1))
          .subscribe(x => (userIsEditor = x));
        this.printer.log(
          enums.busEnum.MODE_RESOLVER,
          'user is_editor:',
          userIsEditor
        );

        if (userIsEditor === true) {
          this.printer.log(enums.busEnum.MODE_RESOLVER, 'setting dev mode...');
          this.store.dispatch(new actions.SetLayoutModeDevAction());

          this.printer.log(
            enums.busEnum.MODE_RESOLVER,
            'will be resolved (true)'
          );
          return this.store.select(selectors.getLayoutModeIsDev).pipe(
            filter(isDev => isDev),
            take(1)
          );
          // return of(true);
        } else {
          // is_editor !== true
          this.printer.log(enums.busEnum.MODE_RESOLVER, 'navigating 404...');
          this.router.navigate(['/404']);
          this.printer.log(enums.busEnum.MODE_RESOLVER, 'resolved (false)');
          return of(false);
        }
      }

      default: {
        // unknown mode
        this.printer.log(enums.busEnum.MODE_RESOLVER, 'navigating 404...');
        this.router.navigate(['/404']);
        this.printer.log(enums.busEnum.MODE_RESOLVER, 'resolved (false)');
        return of(false);
      }
    }
  }
}
