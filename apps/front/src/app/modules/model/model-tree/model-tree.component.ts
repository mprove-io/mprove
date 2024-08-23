import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@ali-hm/angular-tree-component';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';
import { combineLatest } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { ModelNode } from '~common/_index';
import { ModelQuery, ModelState } from '~front/app/queries/model.query';
import { MqQuery } from '~front/app/queries/mq.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { StructService } from '~front/app/services/struct.service';
import { UiService } from '~front/app/services/ui.service';
import { common } from '~front/barrels/common';

export class ModelNodeExtra extends common.ModelNode {
  isSelected: boolean;
  isFiltered: boolean;
  children?: ModelNodeExtra[];
  joinLabel?: string;
  timeLabel?: string;
}

@Component({
  selector: 'm-model-tree',
  templateUrl: './model-tree.component.html',
  styleUrls: ['model-tree.component.scss']
})
// implements OnDestroy
export class ModelTreeComponent implements AfterViewInit {
  nodeClassInfo = common.FieldClassEnum.Info;
  nodeClassDimension = common.FieldClassEnum.Dimension;
  nodeClassMeasure = common.FieldClassEnum.Measure;
  nodeClassCalculation = common.FieldClassEnum.Calculation;
  nodeClassFilter = common.FieldClassEnum.Filter;
  fieldResultTs = common.FieldResultEnum.Ts;

  modelTreeLevelsNested = common.ModelTreeLevelsEnum.Nested;
  modelTreeLevelsMid = common.ModelTreeLevelsEnum.Mid;
  modelTreeLevelsFlat = common.ModelTreeLevelsEnum.Flat;

  nodesExtra: ModelNodeExtra[] = [];

  @Output()
  expandFilters = new EventEmitter();

  @Output()
  expandData = new EventEmitter();

  model: ModelState;
  mconfig: common.MconfigX;
  modelTreeLevels = common.ModelTreeLevelsEnum.Flat;

  nodesExtra$ = combineLatest([
    this.modelQuery.select(),
    this.mqQuery.mconfig$,
    this.uiQuery.modelTreeLevels$
  ]).pipe(
    tap(
      ([model, mconfig, modelTreeLevels]: [
        ModelState,
        common.MconfigX,
        common.ModelTreeLevelsEnum
      ]) => {
        this.model = model;
        this.mconfig = mconfig;
        this.modelTreeLevels = modelTreeLevels;

        this.makeNodesExtra();
        this.cd.detectChanges();
      }
    )
  );

  actionMapping: IActionMapping = {
    mouse: {
      // dragStart: () => {
      //   this.cd.detach();
      // },
      // dragEnd: () => {
      //   this.cd.reattach();
      // }
    }
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'label'
  };

  // nav: NavState;
  // nav$ = this.navQuery.select().pipe(
  //   tap(x => {
  //     this.nav = x;
  //     this.cd.detectChanges();
  //   })
  // );

  // expandLevel$: Subscription;

  @ViewChild('itemsTree') itemsTree: TreeComponent;

  constructor(
    private modelQuery: ModelQuery,
    private cd: ChangeDetectorRef,
    private mqQuery: MqQuery,
    private uiQuery: UiQuery,
    private uiService: UiService,
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
    if (this.model.nodes.length === 0) {
      return;
    }

    // this.itemsTree.treeModel.getNodeById(this.nav.projectId).expand();
    // this.cd.detectChanges();

    // this.expandLevel$ = this.fileQuery
    //   .select()
    //   .pipe(
    //     tap(x => {
    //       let projectId: string;
    //       this.navQuery.projectId$
    //         .pipe(
    //           tap(y => {
    //             projectId = y;
    //           }),
    //           take(1)
    //         )
    //         .subscribe();

    //       let levelPath: string = projectId;

    //       if (common.isDefined(x.fileId)) {
    //         x.fileId.split(common.TRIPLE_UNDERSCORE).forEach(part => {
    //           levelPath = levelPath ? `${levelPath}/${part}` : part;
    //           this.itemsTree.treeModel.getNodeById(levelPath).expand();
    //         });
    //       }

    //       this.cd.detectChanges();
    //     })
    //   )
    //   .subscribe();
  }

  treeOnUpdateData() {
    if (this.model.nodes.length === 0) {
      return;
    }

    // this.itemsTree.treeModel.getNodeById(this.nav.projectId).expand();
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
    let newMconfig = this.structService.makeMconfig();

    if (node.data.isSelected === true) {
      newMconfig = this.mconfigService.removeField({
        newMconfig,
        fieldId: node.data.id
      });
    } else {
      newMconfig.select = [...newMconfig.select, node.data.id];
    }

    this.expandData.emit();

    let fields: common.ModelField[];
    this.modelQuery.fields$
      .pipe(
        tap(x => (fields = x)),
        take(1)
      )
      .subscribe();

    newMconfig = common.setChartTitleOnSelectChange({
      mconfig: newMconfig,
      fields: fields
    });

    newMconfig = common.setChartFields({
      mconfig: newMconfig,
      fields: fields
    });

    newMconfig = common.sortChartFieldsOnSelectChange({
      mconfig: newMconfig,
      fields: fields
    });

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  filterField(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();

    let newMconfig = this.structService.makeMconfig();

    if (node.data.isFiltered === true) {
      let filterIndex = newMconfig.filters.findIndex(
        filt => filt.fieldId === node.data.id
      );

      newMconfig.filters = [
        ...newMconfig.filters.slice(0, filterIndex),
        ...newMconfig.filters.slice(filterIndex + 1)
      ];
    } else {
      let newFraction: common.Fraction = {
        brick: 'any',
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(node.data.fieldResult)
      };

      let newFilter: common.Filter = {
        fieldId: node.data.id,
        fractions: [newFraction]
      };

      newMconfig.filters = [...newMconfig.filters, newFilter].sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      );

      this.expandFilters.emit();
    }

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  makeNodesExtra() {
    // console.log('this.model.nodes', this.model.nodes);
    let nestedNodes = this.model.nodes.map(topNode => {
      topNode.children.map(middleNode => {
        middleNode.children.map(leafNode => this.updateNodeExtra(leafNode));
        return this.updateNodeExtra(middleNode);
      });
      return this.updateNodeExtra(topNode);
    });

    // console.log('nodesExtra', nodesExtra);

    let flatNodes: ModelNodeExtra[] = [];

    let flatNodesDimensions: ModelNodeExtra[] = [];
    let flatNodesMeasures: ModelNodeExtra[] = [];
    let flatNodesCalculations: ModelNodeExtra[] = [];

    if (this.modelTreeLevels === common.ModelTreeLevelsEnum.Flat) {
      nestedNodes.forEach(topNode => {
        topNode.children.forEach(middleNode => {
          middleNode.joinLabel = topNode.label;

          if (middleNode.children.length > 0) {
            middleNode.children.forEach(leafNode => {
              leafNode.joinLabel = topNode.label;
              leafNode.timeLabel = middleNode.label;

              if (leafNode.nodeClass === common.FieldClassEnum.Dimension) {
                flatNodesDimensions.push(leafNode);
              } else if (leafNode.nodeClass === common.FieldClassEnum.Measure) {
                flatNodesMeasures.push(leafNode);
              } else if (
                leafNode.nodeClass === common.FieldClassEnum.Calculation
              ) {
                flatNodesCalculations.push(leafNode);
              }
            });
          } else {
            if (middleNode.nodeClass === common.FieldClassEnum.Dimension) {
              flatNodesDimensions.push(middleNode);
            } else if (middleNode.nodeClass === common.FieldClassEnum.Measure) {
              flatNodesMeasures.push(middleNode);
            } else if (
              middleNode.nodeClass === common.FieldClassEnum.Calculation
            ) {
              flatNodesCalculations.push(middleNode);
            }
          }
        });
      });

      if (flatNodesDimensions.length > 0) {
        flatNodes.push({
          id: `${common.ModelNodeIdSuffixEnum.Dimensions}`,
          label: common.ModelNodeLabelEnum.Dimensions,
          description: undefined,
          hidden: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesDimensions];
      }

      if (flatNodesDimensions.length > 0) {
        flatNodes.push({
          id: `${common.ModelNodeIdSuffixEnum.Measures}`,
          label: common.ModelNodeLabelEnum.Measures,
          description: undefined,
          hidden: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesMeasures];
      }

      if (flatNodesDimensions.length > 0) {
        flatNodes.push({
          id: `${common.ModelNodeIdSuffixEnum.Calculations}`,
          label: common.ModelNodeLabelEnum.Calculations,
          description: undefined,
          hidden: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesCalculations];
      }
    }

    let midNodes: ModelNodeExtra[];

    if (this.modelTreeLevels === common.ModelTreeLevelsEnum.Mid) {
      midNodes = common.makeCopy(nestedNodes);

      midNodes.forEach(topNode => {
        let newTopNodeChildren: ModelNodeExtra[] = [];

        topNode.children.forEach(middleNode => {
          // middleNode.joinLabel = topNode.label;

          if (middleNode.children.length > 0) {
            middleNode.children.forEach(leafNode => {
              // leafNode.joinLabel = topNode.label;

              leafNode.timeLabel = middleNode.label;

              newTopNodeChildren.push(leafNode);
            });
          } else {
            newTopNodeChildren.push(middleNode);
          }

          topNode.children = newTopNodeChildren;
        });
      });
    }

    this.nodesExtra =
      this.modelTreeLevels === common.ModelTreeLevelsEnum.Flat
        ? flatNodes
        : this.modelTreeLevels === common.ModelTreeLevelsEnum.Mid
        ? midNodes
        : nestedNodes;
  }

  updateNodeExtra(node: ModelNode): ModelNodeExtra {
    return Object.assign(node, <ModelNodeExtra>{
      isSelected:
        common.isDefined(this.mconfig?.structId) && node.isField === true
          ? this.mconfig.select.findIndex(x => x === node.id) > -1
          : false,
      isFiltered:
        common.isDefined(this.mconfig?.structId) && node.isField === true
          ? this.mconfig.filters.findIndex(
              filter => filter.fieldId === node.id
            ) > -1
          : false
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

  setModelTreeLevels(modelTreeLevels: common.ModelTreeLevelsEnum) {
    this.uiQuery.updatePart({
      modelTreeLevels: modelTreeLevels
    });

    this.uiService.setUserUi({
      modelTreeLevels: modelTreeLevels
    });
  }

  // ngOnDestroy() {
  //   this.expandLevel$?.unsubscribe();
  // }
}
