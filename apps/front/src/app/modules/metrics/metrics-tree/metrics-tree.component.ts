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
import { MqQuery } from '~front/app/queries/mq.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { StructService } from '~front/app/services/struct.service';
import { common } from '~front/barrels/common';

export class MetricNode {
  id: string;
  isTop: boolean;
  topLabel: string;
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
          topLabel: metric.topLabel,
          isField: true,
          isSelected: false,
          metric: metric,
          children: []
        };

        let topNode: MetricNode = nodes.find(
          (node: any) => node.id === metric.topNode
        );

        if (common.isDefined(topNode)) {
          topNode.children.push(metricNode);
        } else {
          topNode = {
            id: metric.topNode,
            isTop: true,
            topLabel: metric.topLabel,
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
    private mqQuery: MqQuery,
    private structService: StructService,
    private mconfigService: MconfigService,
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
      this.selectField(node);
    }
  }

  selectField(node: TreeNode) {
    // let newMconfig = this.structService.makeMconfig();
    // if (node.data.isSelected === true) {
    //   newMconfig = this.mconfigService.removeField({
    //     newMconfig,
    //     fieldId: node.data.id
    //   });
    // } else {
    //   newMconfig.select = [...newMconfig.select, node.data.id];
    // }
    // this.expandData.emit();
    // let fields: common.ModelField[];
    // this.modelQuery.fields$
    //   .pipe(
    //     tap(x => (fields = x)),
    //     take(1)
    //   )
    //   .subscribe();
    // newMconfig = setChartTitleOnSelectChange({
    //   newMconfig: newMconfig,
    //   fields: fields
    // });
    // newMconfig = setChartFields({
    //   newMconfig: newMconfig,
    //   fields: fields
    // });
    // newMconfig = sortChartFieldsOnSelectChange({
    //   newMconfig: newMconfig,
    //   fields: fields
    // });
    // this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  filterField(node: TreeNode, event: MouseEvent) {
    // event.stopPropagation();
    // let newMconfig = this.structService.makeMconfig();
    // if (node.data.isFiltered === true) {
    //   let filterIndex = newMconfig.filters.findIndex(
    //     filt => filt.fieldId === node.data.id
    //   );
    //   newMconfig.filters = [
    //     ...newMconfig.filters.slice(0, filterIndex),
    //     ...newMconfig.filters.slice(filterIndex + 1)
    //   ];
    // } else {
    //   let newFraction: common.Fraction = {
    //     brick: 'any',
    //     operator: common.FractionOperatorEnum.Or,
    //     type: common.getFractionTypeForAny(node.data.fieldResult)
    //   };
    //   let newFilter: common.Filter = {
    //     fieldId: node.data.id,
    //     fractions: [newFraction]
    //   };
    //   newMconfig.filters = [...newMconfig.filters, newFilter];
    //   this.expandFilters.emit();
    // }
    // this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  // makeNodesExtra() {
  //   this.nodesExtra = this.model.nodes.map(topNode => {
  //     topNode.children.map(middleNode => {
  //       middleNode.children.map(leafNode => this.updateNodeExtra(leafNode));
  //       return this.updateNodeExtra(middleNode);
  //     });
  //     return this.updateNodeExtra(topNode);
  //   });
  // }

  // updateNodeExtra(node: ModelNode): MetricsNodeExtra {
  //   return Object.assign(node, <MetricsNodeExtra>{
  //     isSelected:
  //       common.isDefined(this.mconfig?.structId) && node.isField === true
  //         ? this.mconfig.select.findIndex(x => x === node.id) > -1
  //         : false,
  //     isFiltered:
  //       common.isDefined(this.mconfig?.structId) && node.isField === true
  //         ? this.mconfig.filters.findIndex(
  //             filter => filter.fieldId === node.id
  //           ) > -1
  //         : false
  //   });
  // }

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
