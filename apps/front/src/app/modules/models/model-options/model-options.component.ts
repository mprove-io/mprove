import { TreeNode } from '@ali-hm/angular-tree-component';
import { Component, Input } from '@angular/core';
import { EMPTY_CHART_ID } from '#common/constants/top';
import { PanelEnum } from '#common/enums/panel.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { ModelX } from '#common/interfaces/backend/model-x';
import { NavQuery } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-model-options',
  templateUrl: './model-options.component.html'
})
export class ModelOptionsComponent {
  @Input()
  models: ModelX[];

  @Input()
  chart: ChartX;

  @Input()
  treeNode: TreeNode;

  @Input()
  isHoverM: boolean;

  constructor(
    private myDialogService: MyDialogService,
    private apiService: ApiService,
    private navigateService: NavigateService,
    private uiService: UiService,
    private navQuery: NavQuery,
    private uiQuery: UiQuery
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFile(event: MouseEvent) {
    event.stopPropagation();

    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    let model = this.models.find(
      model => model.modelId === this.treeNode.data.id
    );

    let fileIdAr = model.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.uiService.ensureFilesLeftPanel();
    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath })
    });
  }

  async showSchema(event: MouseEvent) {
    event.stopPropagation();

    if (this.chart?.modelId !== this.treeNode.data.id) {
      await this.navigateService.navigateToChart({
        modelId: this.treeNode.data.id,
        chartId: EMPTY_CHART_ID
      });
    }

    this.uiQuery.updatePart({ showSchema: true });
  }
}
