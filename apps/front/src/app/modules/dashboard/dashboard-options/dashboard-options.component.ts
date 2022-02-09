import { ChangeDetectorRef, Component, Input } from '@angular/core';
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
export class DashboardOptionsComponent {
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

  constructor(
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  goToFile(event?: MouseEvent) {
    event.stopPropagation();

    let fileIdAr = this.dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  deleteDashboard(event: MouseEvent) {
    event.stopPropagation();

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
}
