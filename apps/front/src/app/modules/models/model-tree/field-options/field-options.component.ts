import { Component, Input } from '@angular/core';
import { PanelEnum } from '#common/enums/panel.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { MetricNode } from '#front/app/modules/reports/metrics-tree/metrics-tree.component';
import { UiQuery } from '#front/app/queries/ui.query';
import { NavigateService } from '#front/app/services/navigate.service';
import { ModelNodeExtra } from '../model-tree.component';

@Component({
  standalone: false,
  selector: 'm-field-options',
  templateUrl: './field-options.component.html'
})
export class FieldOptionsComponent {
  @Input()
  modelNodeData: ModelNodeExtra;

  @Input()
  metricNodeData: MetricNode;

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
        ? this.metricNodeData.metric.filePath.split('/')
        : this.modelNodeData.fieldFilePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath }),
      lineNumber:
        this.isMetric === true
          ? this.metricNodeData.metric.fieldLineNum
          : this.modelNodeData.fieldLineNum
    });
  }
}
