import { Component, Input } from '@angular/core';
import { TreeNode } from '@bugsplat/angular-tree-component';
import { NavQuery } from '~front/app/queries/nav.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-field-options',
  templateUrl: './field-options.component.html'
})
export class FieldOptionsComponent {
  @Input()
  node: TreeNode;

  constructor(
    private navQuery: NavQuery,
    private navigateService: NavigateService
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFileLine(event: MouseEvent) {
    event.stopPropagation();

    let fileIdAr = this.node.data.fieldFilePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE),
      lineNumber: this.node.data.fieldLineNum
    });
  }
}
