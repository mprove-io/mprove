import { Component, Input } from '@angular/core';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { RepoStore } from '~front/app/stores/repo.store';
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
    public repoStore: RepoStore,
    public myDialogService: MyDialogService,
    private apiService: ApiService
  ) {}

  viewBlockML(event?: MouseEvent) {
    event.stopPropagation();

    this.myDialogService.showViewBlockml({
      apiService: this.apiService,
      mconfig: this.mconfig
    });
  }
}
