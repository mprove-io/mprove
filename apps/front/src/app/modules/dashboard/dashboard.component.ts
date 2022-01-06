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
import { debounceTime, tap } from 'rxjs/operators';
import { DashboardQuery } from '~front/app/queries/dashboard.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { DashboardState } from '~front/app/stores/dashboard.store';
import { common } from '~front/barrels/common';
import { constants as frontConstants } from '~front/barrels/constants';
import { interfaces } from '~front/barrels/interfaces';
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

  scrollSpeed = 8;

  filtersIsExpanded = false;

  showBricks = false;

  isShowGrid = true;
  isShow = true;
  isHidden = false;

  dashboard: DashboardState;
  dashboard$ = this.dashboardQuery.select().pipe(
    tap(x => {
      this.dashboard = x;
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

  extendedFilters: interfaces.FilterExtended[];
  extendedFilters$ = this.dashboardQuery.extendedFilters$.pipe(
    tap(x => {
      this.extendedFilters = x;
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
      .pipe(debounceTime(500))
      .subscribe((event: any) => {
        // let elem = event.target;
        // if (elem.offsetHeight + elem.scrollTop >= elem.scrollHeight) {
        //   // console.log('bottom');
        //   this.refreshHidden();
        //   this.cd.detectChanges();
        // }
        // if (elem.scrollTop === 0) {
        //   //  console.log('top')
        //   this.refreshHidden();
        //   this.cd.detectChanges();
        // }
        this.refreshHidden();
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

  refreshHidden() {
    this.isHidden = true;
    this.cd.detectChanges();
    setTimeout(() => {
      this.isHidden = false;
      this.cd.detectChanges();
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

  saveAs() {}

  canDeactivate(): Promise<boolean> | boolean {
    // console.log('canDeactivateDashboard')
    // this.mqStore.reset();
    // this.modelStore.reset();
    return true;
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
    this.scrollSubscription.unsubscribe();
  }
}
