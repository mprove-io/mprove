import { Component, Inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as configs from 'app/configs/_index';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss']
})
export class QueryComponent {

  chartTypeEnum = api.ChartTypeEnum;
  queryStatusEnum = api.QueryStatusEnum;

  tabs = [
    {
      label: 'SQL',
      link: 'sql'
    },
    {
      label: 'Data',
      link: 'data'
    },
  ];

  activeLinkIndex: number;

  queryStatus: api.QueryStatusEnum;
  queryStatus$ = this.store.select(selectors.getSelectedQueryStatus)
    .pipe(
      tap(x => this.queryStatus = x)
    );

  queryId$ = this.store.select(selectors.getSelectedQueryId)
    .pipe(
      filter(v => !!v),
      tap(queryId => {

        this.liveQueriesService.setLiveQueries([queryId]); // we dont need to set live queries for dep pdts
      })
    );

  queryLastErrorMessage: string;
  queryLastErrorMessage$ = this.store.select(selectors.getSelectedQueryLastErrorMessage)
    .pipe(
      // filter(v => !!v), // no filter
      tap(x => this.queryLastErrorMessage = x)
      // tap(x => this.queryLastErrorMessage = x ? JSON.parse(x) : undefined)
    );

  filters: api.Filter[] = [];
  filters$ = this.store.select(selectors.getSelectedMconfigFilters).pipe(filter(v => !!v), tap(
    x => this.filters = x));

  mconfig: api.Mconfig;
  mconfigFilterErrors: boolean = false;
  mconfig$ = this.store.select(selectors.getSelectedMconfig).pipe(filter(v => !!v), tap(
    x => {
      this.mconfig = x;
      this.mconfigFilterErrors = this.structService.mconfigHasFiltersWithDuplicateFractions(this.mconfig);
    }
  ));

  charts: api.Chart[] = [];
  charts$ = this.store.select(selectors.getSelectedMconfigCharts).pipe(filter(v => !!v), tap(
    x => this.charts = x));

  routerPath$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    tap((event: NavigationEnd) => {
      let path = event.urlAfterRedirects;
      this.selectTab(path);
    }));

  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private route: ActivatedRoute,
    private liveQueriesService: services.LiveQueriesService,
    private router: Router,
    private structService: services.StructService,
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private navigateMconfigService: services.NavigateService) {

    this.selectTab(router.url);
  }

  selectTab(path: string) {
    let pathArray: string[];

    pathArray = path.split('/');

    switch (pathArray[11]) {
      case 'filters': {
        this.activeLinkIndex = 0;
        break;
      }

      case 'sql': {
        this.activeLinkIndex = 1;
        break;
      }

      case 'data': {
        this.activeLinkIndex = 2;
        break;
      }

      case 'chart': {
        let chartIndex: number;

        let chartId: string;
        this.store.select(selectors.getSelectedMconfigChartId).pipe(take(1)).subscribe(x => chartId = x);

        this.store.select(selectors.getSelectedMconfigCharts).pipe(take(1)).subscribe(charts => {
          chartIndex = charts.findIndex(chart => chart.chart_id === chartId);
        });

        this.activeLinkIndex = chartIndex + 3;
        break;
      }

      default: {
      }
    }
  }

  navigateToFilters() {
    this.navigateMconfigService.navigateMconfigQueryFilters();
  }

  navigateToSql() {
    this.navigateMconfigService.navigateMconfigQuerySql();
  }

  navigateToData() {
    this.navigateMconfigService.navigateMconfigQueryData();
  }

  navigateChart(chartId: string) {
    this.navigateMconfigService.navigateMconfigQueryChart(null, null, chartId);
  }

  addChart() {
    let newChart: api.Chart = this.structService.generateChart();
    let newMconfig: api.Mconfig = this.structService.generateMconfig();

    newMconfig.charts = [...newMconfig.charts, newChart];

    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));
    this.store.dispatch(new actions.CreateMconfigAction({ mconfig: newMconfig }));

    setTimeout(
      () => this.navigateMconfigService.navigateMconfigQueryChart(
        newMconfig.mconfig_id,
        newMconfig.query_id,
        newChart.chart_id),
      1);
  }

  activateEvent(event: any) {
    this.printer.log(enums.busEnum.ACTIVATE_EVENT, 'from QueryComponent:', event);
  }

  deactivateEvent(event: any) {
    this.printer.log(enums.busEnum.DEACTIVATE_EVENT, 'from QueryComponent:', event);
  }

  canDeactivate(): boolean { // used in component-deactivate-guard
    this.printer.log(enums.busEnum.CAN_DEACTIVATE_CHECK, 'from QueryComponent');
    this.store.dispatch(new actions.UpdateLayoutQueryIdAction(undefined));
    return true;
  }
}
