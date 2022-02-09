import { ChangeDetectorRef, Component, Input } from '@angular/core';
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
export class ChartOptionsComponent {
  @Input()
  isDisabled: boolean;

  @Input()
  mconfig: common.MconfigX;

  constructor(
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    public repoStore: RepoStore,
    public myDialogService: MyDialogService,
    private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  viewBlockML(event?: MouseEvent) {
    event.stopPropagation();

    this.myDialogService.showViewBlockml({
      apiService: this.apiService,
      mconfig: this.mconfig
    });
  }
}
