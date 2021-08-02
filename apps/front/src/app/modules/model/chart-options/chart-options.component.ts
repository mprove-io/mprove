import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { tap } from 'rxjs/operators';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { UiStore } from '~front/app/stores/ui.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-options',
  templateUrl: './chart-options.component.html'
})
export class ChartOptionsComponent implements OnDestroy {
  @Input()
  isDisabled: boolean;

  @Input()
  mconfig: common.Mconfig;

  menuId = 'chartOptions';

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isChartOptionsMenuOpen = false;

  constructor(
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    public repoStore: RepoStore,
    public myDialogService: MyDialogService,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  openMenu() {
    this.isChartOptionsMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }
    this.isChartOptionsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu(event?: MouseEvent) {
    event.stopPropagation();
    if (this.isChartOptionsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  viewBlockML(event?: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    this.myDialogService.showViewBlockml({
      apiService: this.apiService,
      mconfig: this.mconfig
    });
  }

  ngOnDestroy() {
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}
