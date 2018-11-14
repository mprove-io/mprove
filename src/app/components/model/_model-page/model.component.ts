import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatSelectChange, MatSidenav } from '@angular/material';
import { TdLoadingService } from '@covalent/core';
import { Store } from '@ngrx/store';
import { interval, Subscription } from 'rxjs';
import { filter, map, startWith, take, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as configs from 'app/configs/_index';
import * as enums from 'app/enums/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';
import * as uuid from 'uuid';

@Component({
  moduleId: module.id,
  selector: 'm-model',
  templateUrl: 'model.component.html',
  styleUrls: ['model.component.scss']
})
export class ModelComponent implements OnDestroy {
  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild('sidenavRight') sidenavRight: MatSidenav;

  queryStatusEnum = api.QueryStatusEnum;

  dryId: string;
  drySize: string;
  dryTs: number;
  lastRunTs: number;
  dryTsIsAfterLastRunTs: boolean;

  residueDuration: number;
  calcDurationFloor: number;
  fullDurationFloor: number;
  dataLength: number;

  userId$ = this.store.select(selectors.getUserId);

  queryLastRunBy$ = this.store.select(selectors.getSelectedQueryLastRunBy);
  queryLastRunTs$ = this.store.select(selectors.getSelectedQueryLastRunTs).pipe(
    filter(v => !!v),
    tap(x => {
      this.lastRunTs = x;

      this.dryTsIsAfterLastRunTs = this.dryTs ? this.dryTs > x : false;
    })
  );

  queryStatus$ = this.store.select(selectors.getSelectedQueryStatus);

  queryLastCompleteDuration: number;
  queryLastCompleteDuration$ = this.store
    .select(selectors.getSelectedQueryLastCompleteDuration)
    .pipe(
      tap(duration => {
        let durationCeil = duration ? Math.ceil(duration / 1000) : 0;

        this.queryLastCompleteDuration = durationCeil;
      })
    );

  queryData$ = this.store.select(selectors.getSelectedQueryData);
  queryServerTsMoreThanOne$ = this.store
    .select(selectors.getSelectedQueryServerTs)
    .pipe(map(x => x > 1));

  previousQueryId: string;

  query: api.Query;
  query$ = this.store.select(selectors.getSelectedQuery).pipe(
    tap(x => {
      this.query = x;

      if (x) {
        this.dataLength = x.data ? JSON.parse(x.data).length : 0;

        this.calcDurationFloor = Math.floor(x.last_complete_duration / 1000);

        this.fullDurationFloor = Math.floor(
          (x.last_complete_ts - x.last_run_ts) / 1000
        );

        this.residueDuration = this.fullDurationFloor - this.calcDurationFloor;

        // will auto runDry once
        if (x.server_ts > 1 && x.query_id !== this.previousQueryId) {
          this.runDry();
          this.previousQueryId = x.query_id;
        }
      } else {
        this.drySize = null;
        this.dryTs = null;
      }
    })
  );

  modelId: string;
  modelId$ = this.store
    .select(selectors.getSelectedProjectModeRepoModelId)
    .pipe(
      tap(x => {
        this.modelId = x;
      })
    );

  modelLabel: string;
  modelLabel$ = this.store
    .select(selectors.getSelectedProjectModeRepoModelLabel)
    .pipe(
      tap(x => {
        this.modelLabel = x;
      })
    );

  modelDescription$ = this.store.select(
    selectors.getSelectedProjectModeRepoModelDescription
  ); // no filter here

  fileId: string = undefined;
  fileId$ = this.store
    .select(selectors.getSelectedProjectModeRepoModelFileId)
    .pipe(tap(fileId => (this.fileId = fileId)));

  queryNotSelected$ = this.store
    .select(selectors.getSelectedQuery)
    .pipe(map(x => !x)); // no filter here

  mconfigSelectFields: api.ModelField[] = [];
  mconfigSelectFields$ = this.store
    .select(selectors.getSelectedMconfigSelectFields)
    .pipe(
      // no filter here
      tap(x => {
        this.mconfigSelectFields = x;
      })
    );

  layoutDry$ = this.store.select(selectors.getLayoutDry).pipe(
    filter(v => !!v),
    map(dry => {
      if (this.dryId === dry.dry_id) {
        let totalSize: number = 0;

        dry.valid_estimates.forEach(v => {
          totalSize = totalSize + v.estimate;
        });

        this.drySize = this.dataSizeService.getSize(totalSize);
      }
    })
  );

  dryTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => this.timeService.timeAgoFromNow(this.dryTs))
  );

  runSecondsAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => this.timeService.secondsAgoFromNow(this.query.last_run_ts))
  );

  completeTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => this.timeService.timeAgoFromNow(this.query.last_complete_ts))
  );

  errorTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => this.timeService.timeAgoFromNow(this.query.last_error_ts))
  );

  cancelTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => this.timeService.timeAgoFromNow(this.query.last_cancel_ts))
  );

  mconfigTimezone: string;
  mconfigTimezone$ = this.store
    .select(selectors.getSelectedMconfigTimezone)
    .pipe(
      filter(v => !!v),
      tap(x => {
        this.mconfigTimezone = x;
      })
    );

  timeZones = api.timezones;

  pageTitleSub: Subscription;

  lqServerTs: number;
  lqServerTsSub: Subscription;
  lqQueriesArraySub: Subscription;

  constructor(
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private navigateService: services.NavigateService,
    private structService: services.StructService,
    private timeService: services.TimeService,
    private dataSizeService: services.DataSizeService,
    private loadingService: TdLoadingService,
    private pageTitle: services.PageTitleService
  ) {
    this.pageTitleSub = this.pageTitle.setModelTitle();
  }

  ngOnDestroy() {
    this.pageTitleSub.unsubscribe();
  }

  gotToFile(): void {
    this.navigateService.navigateToFileLine(this.fileId);
  }

  timezoneChange(ev: MatSelectChange) {
    let [newMconfig, newQuery] = this.structService.generateMconfigAndQuery();

    newMconfig.timezone = ev.value;

    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));
    this.store.dispatch(new actions.UpdateQueriesStateAction([newQuery]));
    this.store.dispatch(
      new actions.CreateMconfigAndQueryAction({
        mconfig: newMconfig,
        query: newQuery
      })
    );

    setTimeout(
      () =>
        this.navigateService.navigateSwitch(
          newMconfig.mconfig_id,
          newQuery.query_id
        ),
      1
    );
  }

  cancel() {
    let queryId: string;
    this.store
      .select(selectors.getSelectedQueryId)
      .pipe(take(1))
      .subscribe(x => (queryId = x));

    this.store.dispatch(
      new actions.CancelQueriesAction({ query_ids: [queryId] })
    );
  }

  run() {
    let queryId: string;
    this.store
      .select(selectors.getSelectedQueryId)
      .pipe(take(1))
      .subscribe(x => (queryId = x));

    this.store.dispatch(
      new actions.RunQueriesAction({ query_ids: [queryId], refresh: false })
    );
  }

  runRefresh() {
    let queryId: string;
    this.store
      .select(selectors.getSelectedQueryId)
      .pipe(take(1))
      .subscribe(x => (queryId = x));

    this.store.dispatch(
      new actions.RunQueriesAction({ query_ids: [queryId], refresh: true })
    );
  }

  runDry() {
    this.loadingService.register('dry');

    this.drySize = null;
    this.dryTs = Math.round(new Date().getTime());

    this.dryTsIsAfterLastRunTs = this.dryTs > this.lastRunTs;

    this.dryId = uuid.v4();

    this.store.dispatch(
      new actions.RunQueriesDryAction({
        dry_id: this.dryId,
        query_ids: [this.query.query_id]
      })
    );
  }

  clearSelection() {
    this.navigateService.navigateModel();
  }

  close() {
    this.sidenav.close();
  }

  closeRight() {
    this.sidenavRight.close();
  }

  activateEvent(event: any) {
    this.printer.log(
      enums.busEnum.ACTIVATE_EVENT,
      'from ModelComponent:',
      event
    );
  }

  deactivateEvent(event: any) {
    this.printer.log(
      enums.busEnum.DEACTIVATE_EVENT,
      'from ModelComponent:',
      event
    );
  }

  canDeactivate(): boolean {
    // used in component-deactivate-guard
    this.printer.log(
      enums.busEnum.CAN_DEACTIVATE_CHECK,
      'from ModelComponent:'
    );
    this.store.dispatch(new actions.UpdateLayoutModelIdAction(undefined));
    return true;
  }
}
