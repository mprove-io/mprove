import { TreeNode } from '@ali-hm/angular-tree-component';
import { Component, Input } from '@angular/core';
import { PanelEnum } from '~common/enums/panel.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { UiQuery } from '~front/app/queries/ui.query';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-field-options',
  templateUrl: './field-options.component.html'
})
export class FieldOptionsComponent {
  @Input()
  node: TreeNode;

  @Input()
  isMetric: boolean;

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

    let fileIdAr =
      this.isMetric === true
        ? this.node.data.metric.filePath.split('/')
        : this.node.data.fieldFilePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath }),
      lineNumber:
        this.isMetric === true
          ? this.node.data.metric.fieldLineNum
          : this.node.data.fieldLineNum
    });
  }
}
