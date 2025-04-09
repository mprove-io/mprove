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
import { FractionSubTypeOption, ModelNode } from '~common/_index';
import { ChartQuery } from '~front/app/queries/chart.query';
import { ModelQuery, ModelState } from '~front/app/queries/model.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ChartService } from '~front/app/services/chart.service';
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

  modelTreeLevelsFlatTime = common.ModelTreeLevelsEnum.FlatTime;
  modelTreeLevelsFlat = common.ModelTreeLevelsEnum.Flat;
  modelTreeLevelsNestedFlatTime = common.ModelTreeLevelsEnum.NestedFlatTime;
  modelTreeLevelsNested = common.ModelTreeLevelsEnum.Nested;

  nodesExtra: ModelNodeExtra[] = [];

  @Output()
  expandFilters = new EventEmitter();

  chart: common.ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;
    })
  );

  model: ModelState;
  mconfig: common.MconfigX;
  modelTreeLevels = common.ModelTreeLevelsEnum.FlatTime;

  nodesExtra$ = combineLatest([
    this.modelQuery.select(),
    this.chartQuery.mconfig$,
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
    private chartQuery: ChartQuery,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private structService: StructService,
    private mconfigService: MconfigService,
    private chartService: ChartService,
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
    if (
      node.data.nodeClass === common.FieldClassEnum.Filter ||
      node.data.nodeClass === common.FieldClassEnum.Info
    ) {
      return;
    }

    node.toggleActivated();

    if (node.data.isField === false && node.hasChildren === true) {
      node.toggleExpanded();
    } else if (
      node.data.isField === true &&
      (node.data.required === false ||
        node.data.isSelected === false ||
        [
          common.FieldClassEnum.Dimension,
          common.FieldClassEnum.Measure,
          common.FieldClassEnum.Calculation
        ].indexOf(node.data?.nodeClass) < 0)
    ) {
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

    this.chartService.editChart({
      mconfig: newMconfig,
      isDraft: this.chart.draft,
      chartId: this.chart.chartId
    });

    // this.mconfigService.navCreateTempMconfigAndQuery({
    //   newMconfig: newMconfig
    // });
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
      let newFraction: common.Fraction;

      if (newMconfig.isStoreModel === true) {
        let field = this.model.fields.find(x => x.id === node.data.id);

        let storeFilter =
          field.fieldClass === common.FieldClassEnum.Filter
            ? (this.model.content as common.FileStore).fields.find(
                f => f.name === field.id
              )
            : undefined;

        let storeResultFraction =
          field.fieldClass === common.FieldClassEnum.Filter
            ? undefined
            : (this.model.content as common.FileStore).results.find(
                r => r.result === field.result
              ).fraction_types[0];

        let logicGroup = common.isUndefined(storeResultFraction)
          ? undefined
          : common.FractionLogicEnum.Or;

        let storeFractionSubTypeOptions = common.isUndefined(
          storeResultFraction
        )
          ? []
          : (this.model.content as common.FileStore).results
              .find(r => r.result === field.result)
              .fraction_types.map(ft => {
                let options = [];

                let optionOr: FractionSubTypeOption = {
                  logicGroup: common.FractionLogicEnum.Or,
                  typeValue: ft.type,
                  value: `${common.FractionLogicEnum.Or}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                  label: ft.label
                };
                options.push(optionOr);

                let optionAndNot: FractionSubTypeOption = {
                  logicGroup: common.FractionLogicEnum.AndNot,
                  value: `${common.FractionLogicEnum.AndNot}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                  typeValue: ft.type,
                  label: ft.label
                };
                options.push(optionAndNot);

                return options;
              })
              .flat()
              .sort((a, b) => {
                if (a.logicGroup === b.logicGroup) return 0;
                return a.logicGroup === common.FractionLogicEnum.Or ? -1 : 1;
              });

        newFraction = {
          meta: storeResultFraction?.meta,
          operator: common.isUndefined(logicGroup)
            ? undefined
            : logicGroup === common.FractionLogicEnum.Or
            ? common.FractionOperatorEnum.Or
            : common.FractionOperatorEnum.And,
          logicGroup: logicGroup,
          brick: undefined,
          type: common.FractionTypeEnum.StoreFraction,
          storeResult: field.result,
          storeFractionSubTypeOptions: storeFractionSubTypeOptions,
          storeFractionSubType: storeResultFraction?.type,
          storeFractionSubTypeLabel: common.isDefined(storeResultFraction?.type)
            ? storeFractionSubTypeOptions.find(
                k => k.typeValue === storeResultFraction?.type
              ).label
            : storeResultFraction?.type,
          storeFractionLogicGroupWithSubType:
            common.isDefined(logicGroup) &&
            common.isDefined(storeResultFraction?.type)
              ? `${logicGroup}${common.TRIPLE_UNDERSCORE}${storeResultFraction.type}`
              : undefined,
          controls: common.isUndefined(storeResultFraction)
            ? storeFilter.fraction_controls.map(control => {
                let newControl: common.FractionControl = {
                  options: control.options,
                  value: control.value,
                  label: control.label,
                  required: control.required,
                  name: control.name,
                  controlClass: control.controlClass,
                  isMetricsDate: control.isMetricsDate
                };
                return newControl;
              })
            : (this.model.content as common.FileStore).results
                .find(r => r.result === field.result)
                .fraction_types[0].controls.map(control => {
                  let newControl: common.FractionControl = {
                    options: control.options,
                    value: control.value,
                    label: control.label,
                    required: control.required,
                    name: control.name,
                    controlClass: control.controlClass,
                    isMetricsDate: control.isMetricsDate
                  };
                  return newControl;
                })
        };
      } else {
        newFraction = {
          brick: 'any',
          operator: common.FractionOperatorEnum.Or,
          type: common.getFractionTypeForAny(node.data.fieldResult)
        };
      }

      let newFilter: common.Filter = {
        fieldId: node.data.id,
        fractions: [newFraction]
      };

      newMconfig.filters = [...newMconfig.filters, newFilter].sort((a, b) =>
        a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
      );

      this.expandFilters.emit();
    }

    this.chartService.editChart({
      mconfig: newMconfig,
      isDraft: this.chart.draft,
      chartId: this.chart.chartId
    });

    // this.mconfigService.navCreateTempMconfigAndQuery({
    //   newMconfig: newMconfig
    // });
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

    let flatNodesFilters: ModelNodeExtra[] = [];
    let flatNodesDimensions: ModelNodeExtra[] = [];
    let flatNodesMeasures: ModelNodeExtra[] = [];
    let flatNodesCalculations: ModelNodeExtra[] = [];

    if (
      this.modelTreeLevels === common.ModelTreeLevelsEnum.FlatTime ||
      this.modelTreeLevels === common.ModelTreeLevelsEnum.Flat
    ) {
      nestedNodes.forEach(topNode => {
        topNode.children.forEach(middleNode => {
          middleNode.joinLabel = topNode.label;

          if (middleNode.children.length > 0) {
            middleNode.children.forEach(leafNode => {
              leafNode.joinLabel = topNode.label;
              leafNode.timeLabel = middleNode.label;

              if (
                this.modelTreeLevels === common.ModelTreeLevelsEnum.FlatTime
              ) {
                if (leafNode.nodeClass === common.FieldClassEnum.Filter) {
                  flatNodesFilters.push(leafNode);
                } else if (
                  leafNode.nodeClass === common.FieldClassEnum.Dimension
                ) {
                  flatNodesDimensions.push(leafNode);
                } else if (
                  leafNode.nodeClass === common.FieldClassEnum.Measure
                ) {
                  flatNodesMeasures.push(leafNode);
                } else if (
                  leafNode.nodeClass === common.FieldClassEnum.Calculation
                ) {
                  flatNodesCalculations.push(leafNode);
                }
              }
            });

            if (this.modelTreeLevels === common.ModelTreeLevelsEnum.Flat) {
              flatNodesDimensions.push(middleNode);
            }
          } else {
            if (middleNode.nodeClass === common.FieldClassEnum.Filter) {
              flatNodesFilters.push(middleNode);
            } else if (
              middleNode.nodeClass === common.FieldClassEnum.Dimension
            ) {
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
          required: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesDimensions];
      }

      if (flatNodesFilters.length > 0) {
        flatNodes.push({
          id: `${common.ModelNodeIdSuffixEnum.Filters}`,
          label: common.ModelNodeLabelEnum.FilterOnlyFields,
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesFilters];
      }

      if (flatNodesMeasures.length > 0) {
        flatNodes.push({
          id: `${common.ModelNodeIdSuffixEnum.Measures}`,
          label: common.ModelNodeLabelEnum.Measures,
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesMeasures];
      }

      if (flatNodesCalculations.length > 0) {
        flatNodes.push({
          id: `${common.ModelNodeIdSuffixEnum.Calculations}`,
          label: common.ModelNodeLabelEnum.Calculations,
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: common.FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesCalculations];
      }
    }

    if (this.modelTreeLevels === common.ModelTreeLevelsEnum.Nested) {
      nestedNodes.forEach(topNode => {
        topNode.children.forEach(middleNode => {
          middleNode.joinLabel = topNode.label;

          if (middleNode.children.length > 0) {
            middleNode.children.forEach(leafNode => {
              leafNode.joinLabel = topNode.label;
              leafNode.timeLabel = middleNode.label;
            });
          }
        });
      });
    }

    let nestedFlatTimeNodes: ModelNodeExtra[];

    if (this.modelTreeLevels === common.ModelTreeLevelsEnum.NestedFlatTime) {
      nestedFlatTimeNodes = common.makeCopy(nestedNodes);

      nestedFlatTimeNodes.forEach(topNode => {
        let newTopNodeChildren: ModelNodeExtra[] = [];

        topNode.children.forEach(middleNode => {
          middleNode.joinLabel = topNode.label;

          if (middleNode.children.length > 0) {
            middleNode.children.forEach(leafNode => {
              leafNode.joinLabel = topNode.label;

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
      this.modelTreeLevels === common.ModelTreeLevelsEnum.FlatTime ||
      this.modelTreeLevels === common.ModelTreeLevelsEnum.Flat
        ? flatNodes
        : this.modelTreeLevels === common.ModelTreeLevelsEnum.NestedFlatTime
        ? nestedFlatTimeNodes
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
    this.itemsTree?.treeModel.doForAll((node: TreeNode) => {
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
