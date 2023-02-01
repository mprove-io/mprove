import { Component, Input } from '@angular/core';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-rep-options',
  templateUrl: './rep-options.component.html'
})
export class RepOptionsComponent {
  @Input()
  filePath: string;

  constructor(private navigateService: NavigateService) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFileLine(event: MouseEvent) {
    event.stopPropagation();

    let fileIdAr = this.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE),
      lineNumber: 0
    });
  }
}
