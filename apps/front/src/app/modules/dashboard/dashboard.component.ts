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
import { Title } from '@angular/platform-browser';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, filter, take, tap } from 'rxjs/operators';
import { checkAccessModel } from '~front/app/functions/check-access-model';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsListQuery } from '~front/app/queries/models-list.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { DashboardStore } from '~front/app/stores/dashboard.store';
import { NavState } from '~front/app/stores/nav.store';
import { common } from '~front/barrels/common';
import { constants as frontConstants } from '~front/barrels/constants';
import {
  DashboardExtended,
  ExtendedReport
} from '../dashboards/dashboards.component';
import { ChartRepComponent } from '../shared/chart-rep/chart-rep.component';

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

  filtersIsExpanded = false;

  showBricks = false;

  isShowGrid = true;
  isShow = true;

  dashboard: DashboardExtended;
  dashboard$ = this.dashboardQuery.select().pipe(
    filter(z => common.isDefined(z.dashboardId)),
    tap(x => {
      // this.dashboard = x;
      // console.log(x);

      let member: common.Member;
      this.memberQuery
        .select()
        .pipe()
        .subscribe(y => {
          member = y;
        });

      this.modelsListQuery
        .select()
        .pipe(take(1))
        .subscribe(ml => {
          let dashboardFilePathArray = x.filePath.split('/');

          let author =
            dashboardFilePathArray.length > 1 &&
            dashboardFilePathArray[1] === common.BLOCKML_USERS_FOLDER
              ? dashboardFilePathArray[2]
              : undefined;

          let dashboardExtended: DashboardExtended = Object.assign({}, x, <
            DashboardExtended
          >{
            author: author,
            canEditOrDeleteDashboard:
              member.isEditor || member.isAdmin || author === member.alias,
            reports: x.reports.map(report => {
              let extendedReport: ExtendedReport = Object.assign({}, report, <
                ExtendedReport
              >{
                hasAccessToModel: checkAccessModel({
                  member: member,
                  model: ml.allModelsList.find(
                    m => m.modelId === report.modelId
                  )
                })
              });
              return extendedReport;
            })
          });

          this.dashboard = dashboardExtended;

          this.cd.detectChanges();
        });

      this.title.setTitle(
        `${this.pageTitle} - ${
          this.dashboard?.title || this.dashboard?.dashboardId
        }`
      );

      this.layout = this.dashboard.reports.map(report => ({
        id: report.mconfigId,
        x: report.tileX || 0,
        y: report.tileY || 0,
        w: report.tileWidth || 3,
        h: report.tileHeight || 3,
        report: report
      }));

      this.cd.detectChanges();
    })
  );

  compactType: any = 'vertical';
  preventCollision = false;
  cols = 24;
  rowHeight = 50;
  layout: any = [
    // {id: '0', x: 0, y: 0, w: 3, h: 3},
    // {id: '1', x: 3, y: 0, w: 3, h: 3},
    // {id: '2', x: 0, y: 3, w: 3, h: 3},
    // {id: '3', x: 3, y: 3, w: 3, h: 3},
    // { id: '0', x: 0, y: 0, w: 3, h: 3 },
    // { id: '1', x: 0, y: 0, w: 3, h: 3 },
    // { id: '2', x: 0, y: 0, w: 3, h: 3 },
    // { id: '3', x: 0, y: 0, w: 3, h: 3 }
  ];

  private resizeSubscription: Subscription;
  private scrollSubscription: Subscription;

  constructor(
    private dashboardQuery: DashboardQuery,
    private title: Title,
    public navigateService: NavigateService,
    public myDialogService: MyDialogService,
    private modelsListQuery: ModelsListQuery,
    private memberQuery: MemberQuery,
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
      .subscribe(() => {
        this.refreshShowGrid();
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

  onLayoutUpdated(x: any) {}

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

  refreshShowGrid() {
    this.isShowGrid = false;
    setTimeout(() => {
      this.isShowGrid = true;
    });
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
    });
  }

  toggleShowReportFilters() {
    this.showBricks = !this.showBricks;
    this.refreshShow();
  }

  onResizeEnded(event: any) {
    this.refreshShow();
  }

  onDragStarted(event: any) {
    // this.preventCollision = true;
  }

  onDragEnded(event: any) {
    // this.preventCollision = false;
    this.refreshShow();
  }

  run() {
    this.chartRepComponents.forEach(x => {
      x.run();
    });
  }

  saveAs() {
    this.myDialogService.showDashboardSaveAs({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd,
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
