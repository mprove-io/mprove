import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@ali-hm/angular-tree-component';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ViewChild
} from '@angular/core';
import { tap } from 'rxjs/operators';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { ReportService } from '~front/app/services/report.service';
import { common } from '~front/barrels/common';

export class MetricNode {
  id: string;
  isTop: boolean;
  topLabel: string;
  partNodeLabel: string;
  partFieldLabel: string;
  timeLabel: string;
  isField: boolean;
  fieldResult: common.FieldResultEnum;
  isSelected: boolean;
  metric: common.ModelMetric;
  children: MetricNode[];
}

@Component({
  standalone: false,
  selector: 'm-metrics-tree',
  templateUrl: './metrics-tree.component.html'
})
export class MetricsTreeComponent implements AfterViewInit {
  nodeClassMeasure = common.FieldClassEnum.Measure;

  nodes: MetricNode[] = [];

  metrics: common.ModelMetric[];
  metrics$ = this.structQuery.metrics$.pipe(
    tap(x => {
      let nodes: MetricNode[] = [];

      x.forEach(metric => {
        let metricNode: MetricNode = {
          id: metric.metricId,
          isTop: false,
          topLabel: metric.topLabel,
          partNodeLabel: metric.partNodeLabel,
          partFieldLabel: metric.partFieldLabel,
          timeLabel: metric.timeLabel,
          isField: true,
          fieldResult: metric.fieldResult,
          isSelected: false,
          metric: metric,
          children: []
        };

        let timeId = metric.timeFieldId.split('.').join('_');
        let topNodeId = `${metric.topNode}_by_${timeId}`;

        let topNode: MetricNode = nodes.find(
          (node: any) => node.id === topNodeId
        );

        if (common.isDefined(topNode)) {
          topNode.children.push(metricNode);
        } else {
          topNode = {
            id: topNodeId,
            isTop: true,
            topLabel: metric.topLabel,
            partNodeLabel: metric.partNodeLabel,
            partFieldLabel: metric.partFieldLabel,
            timeLabel: metric.timeLabel,
            isField: false,
            fieldResult: undefined,
            isSelected: false,
            metric: undefined,
            children: [metricNode]
          };

          nodes.push(topNode);
        }
      });

      this.nodes = nodes;
      this.cd.detectChanges();
    })
  );

  // mconfig: common.MconfigX;
  // mconfig$ = this.mqQuery.mconfig$.pipe(
  //   tap(x => {
  //     this.mconfig = x;

  //     this.makeNodesExtra();
  //     this.cd.detectChanges();
  //   })
  // );

  actionMapping: IActionMapping = {
    mouse: {}
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'label'
  };

  @ViewChild('itemsTree') itemsTree: TreeComponent;

  constructor(
    private structQuery: StructQuery,
    private cd: ChangeDetectorRef,
    private reportQuery: ReportQuery,
    private uiQuery: UiQuery,
    private reportService: ReportService,
    private navigateService: NavigateService
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.filterHidden();
    }, 0);
  }

  treeOnInitialized() {
    // if (this.model.nodes.length === 0) {
    //   return;
    // }
  }

  treeOnUpdateData() {
    // if (this.model.nodes.length === 0) {
    //   return;
    // }
  }

  nodeOnClick(node: TreeNode) {
    if (node.data.nodeClass === common.FieldClassEnum.Filter) {
      return;
    }
    node.toggleActivated();
    if (!node.data.isField) {
      if (node.hasChildren) {
        node.toggleExpanded();
      }
    } else {
      this.addMetricToRep(node);
    }
  }

  addMetricToRep(node: any) {
    let reportSelectedNodes = this.uiQuery.getValue().reportSelectedNodes;

    let report = this.reportQuery.getValue();

    let rowChange: common.RowChange = {
      rowId:
        // repSelectedNodes.length === 1 &&
        // repSelectedNodes[0].data.rowType === common.RowTypeEnum.Empty
        //   ? repSelectedNodes[0].data.rowId
        //   :
        undefined,
      rowType: common.RowTypeEnum.Metric,
      metricId: node.data.metric.metricId,
      showChart: false
    };

    this.reportService.modifyRows({
      report: report,
      changeType: common.ChangeTypeEnum.AddMetric,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  goToFileLine(
    event: MouseEvent,
    fieldFilePath: string,
    fieldLineNumber: number
  ) {
    event.stopPropagation();

    let fileIdAr = fieldFilePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE),
      lineNumber: fieldLineNumber
    });
  }

  filterHidden() {
    this.itemsTree.treeModel.doForAll((node: TreeNode) => {
      let isHidden =
        node.parent && node.parent.parent
          ? node.parent.parent.data.hidden ||
            node.parent.data.hidden ||
            node.data.hidden
          : node.parent
            ? node.parent.data.hidden || node.data.hidden
            : node.data.hidden;

      node.setIsHidden(isHidden);
    });
  }
}
