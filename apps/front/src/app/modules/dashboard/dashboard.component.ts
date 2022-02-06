import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { KtdGridLayout } from '@katoid/angular-grid-layout';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ApiService } from '~front/app/services/api.service';
import { DashboardService } from '~front/app/services/dashboard.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { DashboardStore } from '~front/app/stores/dashboard.store';
import { NavState } from '~front/app/stores/nav.store';
import { common } from '~front/barrels/common';
import { constants as frontConstants } from '~front/barrels/constants';
import { ChartRepComponent } from '../shared/chart-rep/chart-rep.component';

class LayoutItem {
  id: string;
  w: number;
  h: number;
  x: number;
  y: number;
  report: common.ReportX;
}

@Component({
  selector: 'm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  pageTitle = frontConstants.DASHBOARD_PAGE_TITLE;

  @ViewChild('scrollable') scrollable: any;

  @ViewChildren('chartRep') chartRepComponents: QueryList<ChartRepComponent>;

  // @ViewChildren('chartRep', { read: ElementRef })
  // myItemElementRefs: QueryList<ElementRef>;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  randomId = common.makeId();

  scrollSpeed = 8;

  filtersIsExpanded = true;

  showBricks = false;

  isShow = true;

  timezoneForm = this.fb.group({
    timezone: [
      {
        value: undefined
      }
    ]
  });

  timezones = common
    .getTimezones()
    .filter(x => x.value !== common.USE_PROJECT_TIMEZONE_VALUE);

  dashboard: common.DashboardX;
  dashboard$ = this.dashboardQuery.select().pipe(
    filter(z => common.isDefined(z.dashboardId)),
    tap(x => {
      this.dashboard = x;

      // console.log(this.dashboard);

      let usedTimezones: string[] = [];

      this.dashboard.reports.forEach(report => {
        let mconfigTimezone = report.mconfig?.timezone;

        if (
          common.isDefined(mconfigTimezone) &&
          usedTimezones.findIndex(z => mconfigTimezone === z) < 0
        ) {
          usedTimezones.push(mconfigTimezone);
        }
      });

      if (usedTimezones.length > 1 || usedTimezones.length === 0) {
        this.timezoneForm.controls['timezone'].setValue(undefined);
      } else {
        this.timezoneForm.controls['timezone'].setValue(usedTimezones[0]);
      }

      this.filtersIsExpanded =
        this.filtersIsExpanded === false
          ? false
          : this.dashboard.extendedFilters.length > 0;

      this.title.setTitle(
        `${this.pageTitle} - ${
          this.dashboard?.title || this.dashboard?.dashboardId
        }`
      );

      this.layout = this.dashboard.reports.map(
        report =>
          <LayoutItem>{
            id: report.title,
            x: report.tileX || common.REPORT_DEFAULT_TILE_X,
            y: report.tileY || common.REPORT_DEFAULT_TILE_Y,
            w: report.tileWidth || common.REPORT_DEFAULT_TILE_WIDTH,
            h: report.tileHeight || common.REPORT_DEFAULT_TILE_HEIGHT,
            report: report
          }
      );

      this.cd.detectChanges();
    })
  );

  struct$ = this.structQuery.select().pipe(
    tap(x => {
      if (x.allowTimezones === false) {
        this.timezoneForm.controls['timezone'].disable();
      } else {
        this.timezoneForm.controls['timezone'].enable();
      }
    })
  );

  compactType: any = 'vertical';
  preventCollision = false;
  cols = 24;
  rowHeight = 50;
  layout: LayoutItem[] = [];

  private resizeSubscription: Subscription;
  private scrollSubscription: Subscription;

  constructor(
    private dashboardQuery: DashboardQuery,
    private title: Title,
    private fb: FormBuilder,
    private structQuery: StructQuery,
    public navigateService: NavigateService,
    public myDialogService: MyDialogService,
    private dashboardService: DashboardService,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private dashboardStore: DashboardStore,
    private cd: ChangeDetectorRef // @Inject(DOCUMENT) private _document: HTMLDocument,
  ) {}

  ngOnInit() {
    this.resizeSubscription = merge(
      fromEvent(window, 'resize'),
      fromEvent(window, 'orientationchange')
    )
      .pipe(debounceTime(500))
      .subscribe(() => this.preventHorizontalScrollWorkaround());

    this.preventHorizontalScrollWorkaround();
  }

  preventHorizontalScrollWorkaround() {
    setTimeout(() => {
      this.layout = [...this.layout];
    });

    setTimeout(() => {
      this.refreshShow();
    });
  }

  ngAfterViewInit() {
    this.scrollSubscription = merge(
      fromEvent(this.scrollable.nativeElement, 'scroll')
    )
      .pipe(debounceTime(100))
      .subscribe((event: any) => {
        this.randomId = common.makeId();
        this.cd.detectChanges();
      });
  }

  toggleFiltersPanel() {
    this.filtersIsExpanded = !this.filtersIsExpanded;
  }

  trackByFn(index: number, item: any) {
    return item.report.mconfigId;
  }

  goToFile() {
    let fileIdAr = this.dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  refreshShow() {
    this.isShow = false;
    this.cd.detectChanges();
    setTimeout(() => {
      this.isShow = true;
      this.cd.detectChanges();
    }, 500);
  }

  toggleShowReportFilters() {
    this.showBricks = !this.showBricks;
    this.refreshShow();
  }

  onResizeEnded(event: any) {
    this.dashboardStore.update(
      Object.assign({}, this.dashboard, {
        temp: true
      })
    );
  }

  reportDeleted() {
    this.dashboardStore.update(
      Object.assign({}, this.dashboard, {
        temp: true
      })
    );
  }

  onDragStarted(event: any) {
    // this.preventCollision = true;
  }

  onDragEnded(event: any) {
    // this.preventCollision = false;
    this.dashboardStore.update(
      Object.assign({}, this.dashboard, {
        temp: true
      })
    );
  }

  onLayoutUpdated(layout: KtdGridLayout) {
    // console.log('onLayoutUpdated', layout);

    let newDashboard = Object.assign({}, this.dashboard, {
      temp: true,
      reports: this.dashboard.reports.map((report, i: number) => {
        report.tileX = layout[i].x;
        report.tileY = layout[i].y;
        report.tileWidth = layout[i].w;
        report.tileHeight = layout[i].h;

        return report;
      })
    });

    this.dashboardStore.update(newDashboard);

    this.refreshShow();
  }

  timezoneChange() {
    let timezone = this.timezoneForm.controls['timezone'].value;

    this.dashboard.reports.forEach(x => {
      x.timezone = timezone;
    });

    this.dashboardService.navCreateTempDashboard({
      reports: this.dashboard.reports,
      oldDashboardId: this.dashboard.dashboardId,
      newDashboardId: common.makeId(),
      newDashboardFields: this.dashboard.fields
    });
  }

  run() {
    this.chartRepComponents.forEach(x => {
      x.run();
    });
  }

  editListen() {
    this.myDialogService.showDashboardEditListeners({
      dashboardService: this.dashboardService,
      apiService: this.apiService,
      dashboard: this.dashboard
    });
  }

  saveAs() {
    this.myDialogService.showDashboardSaveAs({
      apiService: this.apiService,
      dashboard: this.dashboard
    });
  }

  addReport() {
    this.myDialogService.showDashboardAddReport({
      apiService: this.apiService,
      dashboard: this.dashboard
    });
  }

  addFilter() {
    this.myDialogService.showDashboardAddFilter({
      dashboardService: this.dashboardService,
      dashboard: this.dashboard
    });
  }

  canDeactivate(): Promise<boolean> | boolean {
    // console.log('canDeactivateDashboard')
    this.dashboardStore.reset();
    return true;
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
    this.scrollSubscription.unsubscribe();
  }
}
