import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Injectable()
export class ChartResolver implements Resolve<boolean> {
  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    this.printer.log(enums.busEnum.CHART_SELECTED_RESOLVER, 'starts...');
    this.printer.log(
      enums.busEnum.CHART_SELECTED_RESOLVER,
      'chartId:',
      route.params['chartId']
    );

    let mconfigId: string;
    this.store
      .select(selectors.getLayoutMconfigId)
      .pipe(take(1))
      .subscribe(x => (mconfigId = x));

    if (!mconfigId) {
      this.printer.log(
        enums.busEnum.CHART_SELECTED_RESOLVER,
        `mconfigId undefined`
      );
      this.printer.log(
        enums.busEnum.CHART_SELECTED_RESOLVER,
        `resolved (false)`
      );
      return of(false);
    }

    return this.store.select(selectors.getUserLoaded).pipe(
      filter(loaded => loaded),
      take(1),
      switchMap(() => this.hasChartInStore(route.params['chartId']))
    );
  }

  /**
   * This method checks if a chart with the given chartId is already registered
   * in the Store and is not Deleted
   */
  hasChartInStore(id: string): Observable<boolean> {
    return this.store.select(selectors.getSelectedMconfigCharts).pipe(
      mergeMap(charts => {
        let exists = charts.findIndex(chart => chart.chart_id === id) > -1;

        if (!exists) {
          this.printer.log(
            enums.busEnum.CHART_SELECTED_RESOLVER,
            `chart not exists, navigating data...`
          );

          this.store
            .select(selectors.getLayoutChartId)
            .pipe(take(1))
            .subscribe(x =>
              x
                ? this.store.dispatch(
                    new actions.UpdateLayoutChartIdAction(undefined)
                  )
                : 0
            );

          let projectId: string;
          this.store
            .select(selectors.getLayoutProjectId)
            .pipe(take(1))
            .subscribe(x => (projectId = x));

          let mode: enums.LayoutModeEnum;
          this.store
            .select(selectors.getLayoutMode)
            .pipe(take(1))
            .subscribe(x => (mode = x));

          let modelId: string;
          this.store
            .select(selectors.getSelectedProjectModeRepoModelId)
            .pipe(take(1))
            .subscribe(x => (modelId = x));

          let mconfigId: string;
          this.store
            .select(selectors.getLayoutMconfigId)
            .pipe(take(1))
            .subscribe(x => (mconfigId = x));

          let queryId: string;
          this.store
            .select(selectors.getLayoutQueryId)
            .pipe(take(1))
            .subscribe(x => (queryId = x));

          this.router.navigate([
            '/project',
            projectId,
            'mode',
            mode,
            'model',
            modelId,
            'mconfig',
            mconfigId,
            'query',
            queryId,
            'data'
          ]);

          this.printer.log(
            enums.busEnum.CHART_SELECTED_RESOLVER,
            `resolved (false)`
          );
          return of(false);
        } else {
          this.printer.log(
            enums.busEnum.CHART_SELECTED_RESOLVER,
            `chart exists`
          );

          let layoutChartId: string;
          this.store
            .select(selectors.getLayoutChartId)
            .pipe(take(1))
            .subscribe(chartId => (layoutChartId = chartId));

          if (id !== layoutChartId) {
            this.printer.log(
              enums.busEnum.CHART_SELECTED_RESOLVER,
              `selecting chart...`
            );
            this.store.dispatch(new actions.UpdateLayoutChartIdAction(id));

            return this.store.select(selectors.getLayoutChartId).pipe(
              filter(selectedChartId => selectedChartId === id),
              map(() => true),
              tap(x => {
                this.printer.log(
                  enums.busEnum.CHART_SELECTED_RESOLVER,
                  `chart selected`
                );
                this.printer.log(
                  enums.busEnum.CHART_SELECTED_RESOLVER,
                  `resolved (true)`
                );
              }),
              take(1)
            );
          } else {
            this.printer.log(
              enums.busEnum.CHART_SELECTED_RESOLVER,
              `chart already selected`
            );
            this.printer.log(
              enums.busEnum.CHART_SELECTED_RESOLVER,
              `resolved (true)`
            );
            return of(true);
          }
        }
      }),
      take(1)
    );
  }
}
