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
import uFuzzy from '@leeoniya/ufuzzy';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { ReportService } from '~front/app/services/report.service';

export class MetricNode {
  id: string;
  isTop: boolean;
  topLabel: string;
  partNodeLabel: string;
  partFieldLabel: string;
  timeLabel: string;
  isField: boolean;
  fieldResult: FieldResultEnum;
  isSelected: boolean;
  metric: ModelMetric;
  children: MetricNode[];
}

@Component({
  standalone: false,
  selector: 'm-metrics-tree',
  templateUrl: './metrics-tree.component.html'
})
export class MetricsTreeComponent implements AfterViewInit {
  nodeClassMeasure = FieldClassEnum.Measure;

  metrics: ModelMetric[];

  metricNodes: MetricNode[] = [];
  metricNodes$ = combineLatest([
    this.structQuery.metrics$,
    this.uiQuery.searchMetricsWord$
  ]).pipe(
    tap(([metrics, searchMetricsWord]: [ModelMetric[], string]) => {
      this.metrics = metrics;

      this.makeMetricNodes({ searchMetricsWord: searchMetricsWord });
      this.cd.detectChanges();
    })
  );

  // mconfig: MconfigX;
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

  makeMetricNodes(item: { searchMetricsWord: string }) {
    let { searchMetricsWord } = item;

    let metricNodes: MetricNode[] = [];

    this.metrics.forEach(metric => {
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

      let topNode: MetricNode = metricNodes.find(
        (node: any) => node.id === topNodeId
      );

      if (isDefined(topNode)) {
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

        metricNodes.push(topNode);
      }
    });

    if (isDefinedAndNotEmpty(searchMetricsWord)) {
      let filteredMetricNodes: MetricNode[] = makeCopy(metricNodes);

      filteredMetricNodes = filteredMetricNodes.filter(aNode => {
        if (aNode.children?.length > 0) {
          aNode.children = aNode.children.filter(bNode => {
            return this.metricSearchFn({
              term: searchMetricsWord,
              topLabel: bNode.topLabel,
              timeLabel: bNode.timeLabel,
              partNodeLabel: bNode.partNodeLabel,
              partFieldLabel: bNode.partFieldLabel
            });
          });
        }

        return aNode.children.length > 0;
      });

      this.metricNodes = filteredMetricNodes;
    } else {
      this.metricNodes = metricNodes;
    }
  }

  metricSearchFn(item: {
    term: string;
    topLabel: string;
    timeLabel: string;
    partNodeLabel: string;
    partFieldLabel: string;
  }) {
    let { term, topLabel, timeLabel, partNodeLabel, partFieldLabel } = item;

    let haystack = [
      `${topLabel} ${timeLabel} ${partNodeLabel} ${partFieldLabel}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  nodeOnClick(node: TreeNode) {
    if (node.data.nodeClass === FieldClassEnum.Filter) {
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

    let rowChange: RowChange = {
      rowId:
        reportSelectedNodes.length === 1
          ? reportSelectedNodes[0].data.rowId
          : undefined,
      rowType: RowTypeEnum.Metric,
      metricId: node.data.metric.metricId,
      showChart: false
    };

    this.reportService.modifyRows({
      report: report,
      changeType: ChangeTypeEnum.AddMetric,
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

    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    let fileIdAr = fieldFilePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath }),
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
