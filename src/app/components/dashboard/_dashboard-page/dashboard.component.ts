import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { TdLoadingService } from '@covalent/core';
import { Store } from '@ngrx/store';
import { interval, Subscription } from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  startWith,
  take,
  tap
} from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as api from '@app/api/_index';
import * as configs from '@app/configs/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';
import * as uuid from 'uuid';

@Component({
  moduleId: module.id,
  selector: 'm-dashboard',
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('sidenavRight') sidenavRight: MatSidenav;

  tileWidthEnum = api.ChartTileWidthEnum;
  queryStatusEnum = api.QueryStatusEnum;

  dashThemeEnum = api.UserDashThemeEnum;

  dryId: string;
  drySize: string;
  dryTs: number;

  userId$ = this.store.select(selectors.getUserId);

  layoutDry$ = this.store.select(selectors.getLayoutDry).pipe(
    filter(v => !!v),
    map(dry => {
      if (this.dryId === dry.dry_id) {
        let needPDTs = false;

        let totalSize: number = 0;

        dry.valid_estimates.forEach(v => {
          totalSize = totalSize + v.estimate;
          if (v.estimate === -1) {
            needPDTs = true;
          }
        });

        totalSize = needPDTs ? -1 : totalSize;

        this.drySize = this.dataSizeService.getSize(totalSize);
      }
    })
  );

  lastRunBy$ = this.store.select(selectors.getQueriesState).pipe(
    filter(v => !!v),
    map(queries => {
      let reports: api.Report[] = [];
      this.store
        .select(selectors.getSelectedProjectModeRepoDashboardReports)
        .pipe(take(1))
        .subscribe(x => (reports = x ? x : []));

      if (reports.length > 0) {
        let firstQuery = queries.find(q => q.query_id === reports[0].query_id);

        return firstQuery ? firstQuery.last_run_by : null;
      } else {
        return null;
      }
    })
  );

  inProgressQueryExists$ = this.store.select(selectors.getQueriesState).pipe(
    filter(v => !!v),
    map((queries: api.Query[]) => {
      let inProgressQueries: api.Query[] = [];

      let reports: api.Report[] = [];
      this.store
        .select(selectors.getSelectedProjectModeRepoDashboardReports)
        .pipe(take(1))
        .subscribe(x => (reports = x ? x : []));

      if (reports.length > 0) {
        reports.forEach(report => {
          let query = queries.find(q => q.query_id === report.query_id);

          if (
            query &&
            (query.status === api.QueryStatusEnum.Waiting ||
              query.status === api.QueryStatusEnum.Running)
          ) {
            inProgressQueries.push(query);
          }
        });
      }
      return inProgressQueries.length > 0;
    })
  );

  allQueriesHaveData$ = this.store.select(selectors.getQueriesState).pipe(
    filter(v => !!v),
    map((queries: api.Query[]) => {
      let queriesWithData: api.Query[] = [];

      let reports: api.Report[] = [];
      this.store
        .select(selectors.getSelectedProjectModeRepoDashboardReports)
        .pipe(take(1))
        .subscribe(x => (reports = x ? x : []));

      if (reports.length > 0) {
        reports.forEach(report => {
          let query = queries.find(q => q.query_id === report.query_id);

          if (query && query.data) {
            queriesWithData.push(query);
          }
        });
      }
      return queriesWithData.length === reports.length;
    })
  );

  reports: api.Report[] = [];
  reports$ = this.store
    .select(selectors.getSelectedProjectModeRepoDashboardReports)
    .pipe(
      map(x => (this.reports = x ? x : [])) // no filter
    );

  dashboardId: string;
  dashboardId$ = this.store
    .select(selectors.getSelectedProjectModeRepoDashboardId)
    .pipe(
      filter(v => !!v),
      tap(x => {
        this.dashboardId = x;
        this.drySize = null;
        this.runDry();
      })
    );

  dashboardIsTemp: boolean;
  dashboardIsTemp$ = this.store
    .select(selectors.getSelectedProjectModeRepoDashboardIsTemp)
    .pipe(
      tap(x => {
        this.dashboardIsTemp = x;
      })
    );

  dashboardTitle: string;
  dashboardTitle$ = this.store
    .select(selectors.getSelectedProjectModeRepoDashboardTitle)
    .pipe(
      tap(x => {
        this.dashboardTitle = x;
      })
    );

  dashboardDescription$ = this.store.select(
    selectors.getSelectedProjectModeRepoDashboardDescription
  );

  dashboardFields: api.DashboardField[] = [];
  dashboardFields$ = this.store
    .select(selectors.getSelectedProjectModeRepoDashboardFields)
    .pipe(
      filter(v => !!v),
      tap(x => (this.dashboardFields = x))
    );

  visuals: any[] = [];
  visuals$ = this.store
    .select(selectors.getSelectedProjectModeRepoDashboardVisuals)
    .pipe(
      filter(v => !!v),
      tap(visuals => (this.visuals = visuals))
    );

  dryTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => this.timeService.timeAgoFromNow(this.dryTs))
  );

  dashTheme: api.UserDashThemeEnum = null;
  dashTheme$ = this.store.select(selectors.getUserDashTheme).pipe(
    filter(v => !!v),
    debounceTime(1),
    tap(x => (this.dashTheme = x))
  );

  fileId: string = undefined;
  fileId$ = this.store
    .select(selectors.getSelectedProjectModeRepoDashboardFileId)
    .pipe(tap(fileId => (this.fileId = fileId)));

  pageTitleSub: Subscription;

  constructor(
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private navigateService: services.NavigateService,
    private liveQueriesService: services.LiveQueriesService,
    private structService: services.StructService,
    private timeService: services.TimeService,
    private dataSizeService: services.DataSizeService,
    private loadingService: TdLoadingService,
    private pageTitle: services.PageTitleService
  ) {}

  ngOnInit() {
    this.pageTitleSub = this.pageTitle.setDashboardTitle();
  }

  ngOnDestroy() {
    this.pageTitleSub.unsubscribe();
  }

  gotToFile(): void {
    this.navigateService.navigateToFileLine(this.fileId);
  }

  cancel() {
    let queryIds: string[] = [];
    this.reports.forEach(report => queryIds.push(report.query_id));

    if (queryIds.length > 0) {
      this.store.dispatch(
        new actions.CancelQueriesAction({ query_ids: queryIds })
      );
    }
  }

  run() {
    let queryIds: string[] = [];
    this.reports.forEach(report => queryIds.push(report.query_id));

    if (queryIds.length > 0) {
      this.store.dispatch(
        new actions.RunQueriesAction({ query_ids: queryIds, refresh: false })
      );
    }
  }

  runRefresh() {
    let queryIds: string[] = [];
    this.reports.forEach(report => queryIds.push(report.query_id));

    if (queryIds.length > 0) {
      this.store.dispatch(
        new actions.RunQueriesAction({ query_ids: queryIds, refresh: true })
      );
    }
  }

  runDry() {
    let queryIds: string[] = [];
    this.reports.forEach(report => queryIds.push(report.query_id));

    if (queryIds.length > 0) {
      this.loadingService.register('dry');

      this.drySize = null;

      this.dryTs = Math.round(new Date().getTime());

      this.dryId = uuid.v4();

      this.store.dispatch(
        new actions.RunQueriesDryAction({
          dry_id: this.dryId,
          query_ids: queryIds
        })
      );
    }
  }

  closeRight() {
    this.sidenavRight.close();
  }

  canDeactivate(): boolean {
    // used in component-deactivate-guard
    this.printer.log(
      enums.busEnum.CAN_DEACTIVATE_CHECK,
      'from DashboardComponent:',
      event
    );
    this.store.dispatch(new actions.UpdateLayoutDashboardIdAction(undefined));
    return true;
  }

  trackByFn(index: number, item: interfaces.Visual) {
    return item.query.last_complete_ts;
  }
}
