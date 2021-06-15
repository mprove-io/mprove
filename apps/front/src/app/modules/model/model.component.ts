import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { interval, of, Subscription } from 'rxjs';
import { filter, map, startWith, switchMap, take, tap } from 'rxjs/operators';
import { MconfigQuery } from '~front/app/queries/mconfig.query';
import { ModelQuery } from '~front/app/queries/model.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { QueryQuery } from '~front/app/queries/query.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { StructService } from '~front/app/services/struct.service';
import { TimeService } from '~front/app/services/time.service';
import { ValidationService } from '~front/app/services/validation.service';
import { MconfigState, MconfigStore } from '~front/app/stores/mconfig.store';
import { ModelState } from '~front/app/stores/model.store';
import { NavState } from '~front/app/stores/nav.store';
import { QueryState, QueryStore } from '~front/app/stores/query.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-model',
  templateUrl: './model.component.html'
})
export class ModelComponent implements OnInit, OnDestroy {
  queryStatusEnum = common.QueryStatusEnum;

  lastUrl: string;

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('/');
      this.lastUrl = ar[ar.length - 1];
      this.cd.detectChanges();
    })
  );

  mconfig: MconfigState;
  mconfig$ = this.mconfigQuery.select().pipe(
    tap(x => {
      this.mconfig = x;
      if (x.limit) {
        this.limitForm.controls['limit'].setValue(x.limit);
      }

      // console.log(this.mconfig.select);
      this.cd.detectChanges();
    })
  );

  query: QueryState;
  query$ = this.queryQuery.select().pipe(
    tap(x => {
      this.query = x;
      this.cd.detectChanges();
    })
  );

  limitForm: FormGroup = this.fb.group({
    limit: [
      undefined,
      [
        Validators.required,
        ValidationService.integerValidator,
        Validators.min(1),
        Validators.max(500)
      ]
    ]
  });

  filtersIsExpanded = false;
  chartIsExpanded = false;
  dataIsExpanded = true;

  sqlIsShow = false;
  resultsIsShow = true;

  runSecondsAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => {
      let s = this.timeService.secondsAgoFromNow(this.query.lastRunTs);
      return s < 0 ? 0 : s;
    })
  );

  errorTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => this.timeService.timeAgoFromNow(this.query.lastErrorTs))
  );

  canceledTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => this.timeService.timeAgoFromNow(this.query.lastCancelTs))
  );

  completedTimeAgo$ = interval(1000).pipe(
    startWith(0),
    map(x => this.timeService.timeAgoFromNow(this.query.lastCompleteTs))
  );

  checkRunning$: Subscription;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private queryQuery: QueryQuery,
    private uiQuery: UiQuery,
    private modelQuery: ModelQuery,
    public repoQuery: RepoQuery,
    public mconfigQuery: MconfigQuery,
    public repoStore: RepoStore,
    private apiService: ApiService,
    public structStore: StructStore,
    public fileService: FileService,
    public navigateService: NavigateService,
    private mconfigStore: MconfigStore,
    private queryStore: QueryStore,
    private structService: StructService,
    private timeService: TimeService
  ) {}

  ngOnInit() {
    this.checkRunning$ = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => {
          if (this.query?.status === common.QueryStatusEnum.Running) {
            let payload: apiToBackend.ToBackendGetQueryRequestPayload = {
              mconfigId: this.mconfig.mconfigId,
              queryId: this.query.queryId
            };

            return this.apiService
              .req(
                apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                payload
              )
              .pipe(
                tap((resp: apiToBackend.ToBackendGetQueryResponse) => {
                  this.queryStore.update(resp.payload.query);
                })
              );
          } else {
            return of(1);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.checkRunning$.unsubscribe();
  }

  toggleSql() {
    this.sqlIsShow = !this.sqlIsShow;
    if (this.resultsIsShow === false && this.sqlIsShow === false) {
      this.resultsIsShow = true;
    }
  }

  toggleResults() {
    this.resultsIsShow = !this.resultsIsShow;

    if (this.sqlIsShow === false && this.resultsIsShow === false) {
      setTimeout(() => (this.sqlIsShow = true));
    }

    if (this.sqlIsShow === true) {
      this.sqlIsShow = false;
      setTimeout(() => (this.sqlIsShow = true));
    }
  }

  toggleFiltersPanel() {
    this.filtersIsExpanded = !this.filtersIsExpanded;
    if (this.dataIsExpanded && this.sqlIsShow) {
      this.dataIsExpanded = false;
      setTimeout(() => (this.dataIsExpanded = true));
    }
  }

  toggleChartPanel() {
    this.chartIsExpanded = !this.chartIsExpanded;
    if (this.dataIsExpanded && this.sqlIsShow) {
      this.dataIsExpanded = false;
      setTimeout(() => (this.dataIsExpanded = true));
    }
  }

  toggleDataPanel() {
    this.dataIsExpanded = !this.dataIsExpanded;
  }

  goToFile() {
    let fileIdAr = this.model.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  limitBlur() {
    let limit = this.limitForm.controls['limit'];

    let newMconfig = this.structService.makeMconfig();

    if (!this.limitForm.valid || Number(limit.value) === newMconfig.limit) {
      return;
    }

    newMconfig.limit = Number(limit.value);

    let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryRequestPayload = {
      mconfig: newMconfig
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendCreateTempMconfigAndQuery,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendCreateTempMconfigAndQueryResponse) => {
          let { mconfig, query } = resp.payload;

          this.mconfigStore.update(mconfig);
          this.queryStore.update(query);

          this.navigateService.navigateMconfigQueryData({
            mconfigId: mconfig.mconfigId,
            queryId: mconfig.queryId
          });
        }),
        take(1)
      )
      .subscribe();
  }

  run() {
    let payload: apiToBackend.ToBackendRunQueriesRequestPayload = {
      queryIds: [this.query.queryId]
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRunQueries,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendRunQueriesResponse) => {
          let { runningQueries } = resp.payload;
          this.queryStore.update(runningQueries[0]);
        }),
        take(1)
      )
      .subscribe();
  }
}