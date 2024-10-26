import { Component, Input } from '@angular/core';
import { MyDialogService } from '~front/app/services/my-dialog.service';
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

  constructor(private myDialogService: MyDialogService) {}

  viewFile(event?: MouseEvent) {
    event.stopPropagation();

    this.myDialogService.showViewBlockml({
      mconfig: this.mconfig
    });
  }
}
