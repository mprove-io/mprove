import { TreeNode } from '@ali-hm/angular-tree-component';
import { Component, Input } from '@angular/core';
import { UiQuery } from '~front/app/queries/ui.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-field-options',
  templateUrl: './field-options.component.html'
})
export class FieldOptionsComponent {
  @Input()
  node: TreeNode;

  constructor(
    private uiQuery: UiQuery,
    private navigateService: NavigateService
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFileLine(event: MouseEvent) {
    event.stopPropagation();

    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    let fileIdAr = this.node.data.fieldFilePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      encodedFileId: common.encodeFilePath({ filePath: filePath }),
      // underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE),
      lineNumber: this.node.data.fieldLineNum
    });
  }
}
