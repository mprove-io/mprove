import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';
import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@bugsplat/angular-tree-component';
import { tap } from 'rxjs/operators';
import { MetricsQuery, MetricsState } from '~front/app/queries/metrics.query';
import { RepQuery } from '~front/app/queries/rep.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { RepService } from '~front/app/services/rep.service';
import { common } from '~front/barrels/common';

export class MetricNode {
  id: string;
  isTop: boolean;
  topLabelByTime: string;
  isField: boolean;
  isSelected: boolean;
  metric: common.MetricAny;
  children: MetricNode[];
}

@Component({
  selector: 'm-metrics-tree',
  templateUrl: './metrics-tree.component.html',
  styleUrls: ['metrics-tree.component.scss']
})
export class MetricsTreeComponent implements AfterViewInit {
  nodeClassInfo = common.FieldClassEnum.Info;
  nodeClassDimension = common.FieldClassEnum.Dimension;
  nodeClassMeasure = common.FieldClassEnum.Measure;
  nodeClassCalculation = common.FieldClassEnum.Calculation;
  nodeClassFilter = common.FieldClassEnum.Filter;
  fieldResultTs = common.FieldResultEnum.Ts;

  nodes: MetricNode[] = [];

  @Output()
  expandFilters = new EventEmitter();

  @Output()
  expandData = new EventEmitter();

  metrics: MetricsState;
  metrics$ = this.metricsQuery.select().pipe(
    tap(x => {
      let nodes: MetricNode[] = [];

      x.metrics.forEach(metric => {
        let metricNode: MetricNode = {
          id: metric.metricId,
          isTop: false,
          topLabelByTime: `${metric.topLabel} by ${metric.timeLabel}`,
          isField: true,
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
            topLabelByTime: `${metric.topLabel} by ${metric.timeLabel}`,
            isField: false,
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
    private metricsQuery: MetricsQuery,
    private cd: ChangeDetectorRef,
    private repQuery: RepQuery,
    private uiQuery: UiQuery,
    private repService: RepService,
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
    if (node.data.nodeClass === this.nodeClassFilter) {
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
    let repSelectedNodes = this.uiQuery.getValue().repSelectedNodes;

    let rep = this.repQuery.getValue();

    let rowChange: common.RowChange = {
      rowId:
        repSelectedNodes.length === 1 &&
        common.isUndefined(repSelectedNodes[0].data.metricId) &&
        common.isUndefined(repSelectedNodes[0].data.formula)
          ? repSelectedNodes[0].data.rowId
          : undefined,
      rowType: common.RowTypeEnum.Metric,
      metricId: node.data.metric.metricId,
      showChart: false
    };

    this.repService.changeRows({
      rep: rep,
      changeType: common.ChangeTypeEnum.AddMetric,
      rowChanges: [rowChange]
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
