import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ModelQuery } from '~front/app/queries/model.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { ModelState } from '~front/app/stores/model.store';
import { UiStore } from '~front/app/stores/ui.store';
import { common } from '~front/barrels/common';
import { DashboardExtended } from '../../dashboards/dashboards.component';

@Component({
  selector: 'm-dashboard-options',
  templateUrl: './dashboard-options.component.html'
})
export class DashboardOptionsComponent implements OnDestroy {
  @Input()
  dashboard: DashboardExtended;

  // @Output()
  // runDryEvent = new EventEmitter();

  menuId = 'dashboardOptions';

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isQueryOptionsMenuOpen = false;

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public uiQuery: UiQuery,
    public modelQuery: ModelQuery,
    public uiStore: UiStore,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef
  ) {}

  openMenu() {
    this.isQueryOptionsMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }
    this.isQueryOptionsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu(event?: MouseEvent) {
    event.stopPropagation();
    if (this.isQueryOptionsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  goToFile(event?: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    let fileIdAr = this.dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  runDry(event?: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    // this.runDryEvent.emit();
  }

  ngOnDestroy() {
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}
