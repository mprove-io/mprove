import { TreeNode } from '@ali-hm/angular-tree-component';
import { Component, Input } from '@angular/core';
import { EMPTY_CHART_ID } from '#common/constants/top';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import type { ChartX } from '#common/zod/backend/chart-x';
import type { ModelX } from '#common/zod/backend/model-x';
import { NavQuery } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';

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
    private navQuery: NavQuery,
    private uiQuery: UiQuery
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  getModelId() {
    return this.treeNode.data.modelId ?? this.treeNode.data.id;
  }

  goToFile(event: MouseEvent) {
    event.stopPropagation();

    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    let modelId = this.getModelId();

    let model = this.models.find(model => model.modelId === modelId);

    let fileIdAr = model.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      builderLeft: BuilderLeftEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath })
    });
  }

  async showSchema(event: MouseEvent) {
    event.stopPropagation();

    let modelId = this.getModelId();

    if (this.chart?.modelId !== modelId) {
      await this.navigateService.navigateToChart({
        modelId: modelId,
        chartId: EMPTY_CHART_ID
      });
    }

    this.uiQuery.updatePart({ showSchema: true });
  }
}
