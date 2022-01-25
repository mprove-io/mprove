import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { NavState } from '~front/app/stores/nav.store';
import { UiStore } from '~front/app/stores/ui.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-dashboard-options',
  templateUrl: './dashboard-options.component.html'
})
export class DashboardOptionsComponent implements OnDestroy {
  @Input()
  dashboard: common.DashboardX;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  // @Output()
  // runDryEvent = new EventEmitter();

  dashboardDeletedFnBindThis = this.dashboardDeletedFn.bind(this);

  menuId = 'dashboardOptions';

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isDashboardOptionsMenuOpen = false;

  constructor(
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  openMenu() {
    this.isDashboardOptionsMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }
    this.isDashboardOptionsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu(event?: MouseEvent) {
    event.stopPropagation();
    if (this.isDashboardOptionsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  // saveAs(event: MouseEvent) {
  //   event.stopPropagation();
  //   this.closeMenu();

  //   this.myDialogService.showDashboardSaveAs({
  //     apiService: this.apiService,
  //     dashboard: this.dashboard
  //   });
  // }

  goToFile(event?: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    let fileIdAr = this.dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  deleteDashboard(event: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    this.myDialogService.showDeleteDashboard({
      dashboard: this.dashboard,
      apiService: this.apiService,
      dashboardDeletedFnBindThis: this.dashboardDeletedFnBindThis,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd
    });
  }

  dashboardDeletedFn(deletedDashboardId: string) {
    this.navigateService.navigateToDashboards();
  }

  ngOnDestroy() {
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}
