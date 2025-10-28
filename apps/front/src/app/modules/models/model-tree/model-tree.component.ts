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
import uFuzzy from '@leeoniya/ufuzzy';
import { combineLatest } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { TRIPLE_UNDERSCORE } from '~common/constants/top';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { ModelNodeIdSuffixEnum } from '~common/enums/model-node-id-suffix.enum';
import { ModelNodeLabelEnum } from '~common/enums/model-node-label.enum';
import { ModelTreeLevelsEnum } from '~common/enums/model-tree-levels-enum.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { PanelEnum } from '~common/enums/panel.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { getFractionTypeForAny } from '~common/functions/get-fraction-type-for-any';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { setChartFields } from '~common/functions/set-chart-fields';
import { setChartTitleOnSelectChange } from '~common/functions/set-chart-title-on-select-change';
import { sortChartFieldsOnSelectChange } from '~common/functions/sort-chart-fields-on-select-change';
import { sortFieldsOnSelectChange } from '~common/functions/sort-fields-on-select-change';
import { ChartX } from '~common/interfaces/backend/chart-x';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Filter } from '~common/interfaces/blockml/filter';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { ModelNode } from '~common/interfaces/blockml/model-node';
import { ChartQuery } from '~front/app/queries/chart.query';
import { ModelQuery, ModelState } from '~front/app/queries/model.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ChartService } from '~front/app/services/chart.service';
import { MconfigService } from '~front/app/services/mconfig.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { StructService } from '~front/app/services/struct.service';
import { UiService } from '~front/app/services/ui.service';

export class ModelNodeExtra extends ModelNode {
  isSelected: boolean;
  isFiltered: boolean;
  children?: ModelNodeExtra[];
  joinLabel?: string;
  timeLabel?: string;
}

@Component({
  standalone: false,
  selector: 'm-model-tree',
  templateUrl: './model-tree.component.html',
  styleUrls: ['model-tree.component.scss']
})
export class ModelTreeComponent implements AfterViewInit {
  nodeClassInfo = FieldClassEnum.Info;
  nodeClassJoin = FieldClassEnum.Join;
  nodeClassDimension = FieldClassEnum.Dimension;
  nodeClassMeasure = FieldClassEnum.Measure;
  nodeClassCalculation = FieldClassEnum.Calculation;
  nodeClassFilter = FieldClassEnum.Filter;

  modelTreeLevelsFlatTime = ModelTreeLevelsEnum.FlatTime;
  modelTreeLevelsFlat = ModelTreeLevelsEnum.Flat;
  modelTreeLevelsNestedFlatTime = ModelTreeLevelsEnum.NestedFlatTime;
  modelTreeLevelsNested = ModelTreeLevelsEnum.Nested;

  modelTypeMalloy = ModelTypeEnum.Malloy;

  nodesExtra: ModelNodeExtra[] = [];

  @Output()
  expandFilters = new EventEmitter();

  chart: ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;
    })
  );

  model: ModelState;
  mconfig: MconfigX;
  modelTreeLevels = ModelTreeLevelsEnum.Flat;

  nodesExtra$ = combineLatest([
    this.modelQuery.select(),
    this.chartQuery.select(),
    this.uiQuery.modelTreeLevels$,
    this.uiQuery.searchSchemaWord$
  ]).pipe(
    tap(
      ([model, chart, modelTreeLevels, searchSchemaWord]: [
        ModelState,
        ChartX,
        ModelTreeLevelsEnum,
        string
      ]) => {
        this.model = model;
        this.mconfig = chart.tiles[0].mconfig;
        this.modelTreeLevels = modelTreeLevels;

        this.makeNodesExtra({ searchSchemaWord: searchSchemaWord });
        this.cd.detectChanges();
      }
    )
  );

  actionMapping: IActionMapping = {
    mouse: {}
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'label'
  };

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
  }

  treeOnUpdateData() {
    if (this.model.nodes.length === 0) {
      return;
    }
  }

  nodeOnClick(node: TreeNode) {
    if (
      node.data.nodeClass === FieldClassEnum.Filter ||
      node.data.nodeClass === FieldClassEnum.Info
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
          FieldClassEnum.Dimension,
          FieldClassEnum.Measure,
          FieldClassEnum.Calculation
        ].indexOf(node.data?.nodeClass) < 0)
    ) {
      this.selectField(node);
    }
  }

  selectField(node: TreeNode) {
    let newMconfig = this.structService.makeMconfig();

    if (this.model.type === ModelTypeEnum.Malloy) {
      let { queryOperationType, sortFieldId, desc } = sortFieldsOnSelectChange({
        mconfig: newMconfig,
        selectFieldId: node.data.id,
        modelFields: this.model.fields,
        mconfigFields: this.mconfig.fields
      });

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: queryOperationType,
          fieldId: node.data.id,
          sortFieldId: sortFieldId,
          desc: desc,
          timezone: newMconfig.timezone
        }
      });
    } else {
      if (node.data.isSelected === true) {
        newMconfig = this.mconfigService.removeField({
          newMconfig,
          fieldId: node.data.id
        });
      } else {
        newMconfig.select = [...newMconfig.select, node.data.id];
      }

      let fields: ModelField[];
      this.modelQuery.fields$
        .pipe(
          tap(x => (fields = x)),
          take(1)
        )
        .subscribe();

      newMconfig = setChartTitleOnSelectChange({
        mconfig: newMconfig,
        fields: fields
      });

      newMconfig = setChartFields({
        mconfig: newMconfig,
        fields: fields
      });

      newMconfig = sortChartFieldsOnSelectChange({
        mconfig: newMconfig,
        fields: fields
      });

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });
    }
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
      let newFraction: Fraction;

      if (newMconfig.modelType === ModelTypeEnum.Store) {
        let field = this.model.fields.find(x => x.id === node.data.id);

        let storeFilter =
          field.fieldClass === FieldClassEnum.Filter
            ? this.model.storeContent.fields.find(f => f.name === field.id)
            : undefined;

        let storeResultFraction =
          field.fieldClass === FieldClassEnum.Filter
            ? undefined
            : this.model.storeContent.results.find(
                r => r.result === field.result
              ).fraction_types[0];

        let logicGroup = isUndefined(storeResultFraction)
          ? undefined
          : FractionLogicEnum.Or;

        let storeFractionSubTypeOptions = isUndefined(storeResultFraction)
          ? []
          : this.model.storeContent.results
              .find(r => r.result === field.result)
              .fraction_types.map(ft => {
                let options = [];

                let optionOr: FractionSubTypeOption = {
                  logicGroup: FractionLogicEnum.Or,
                  typeValue: ft.type,
                  value: `${FractionLogicEnum.Or}${TRIPLE_UNDERSCORE}${ft.type}`,
                  label: ft.label
                };
                options.push(optionOr);

                let optionAndNot: FractionSubTypeOption = {
                  logicGroup: FractionLogicEnum.AndNot,
                  value: `${FractionLogicEnum.AndNot}${TRIPLE_UNDERSCORE}${ft.type}`,
                  typeValue: ft.type,
                  label: ft.label
                };
                options.push(optionAndNot);

                return options;
              })
              .flat()
              .sort((a, b) => {
                if (a.logicGroup === b.logicGroup) return 0;
                return a.logicGroup === FractionLogicEnum.Or ? -1 : 1;
              });

        newFraction = {
          meta: storeResultFraction?.meta,
          operator: isUndefined(logicGroup)
            ? undefined
            : logicGroup === FractionLogicEnum.Or
              ? FractionOperatorEnum.Or
              : FractionOperatorEnum.And,
          logicGroup: logicGroup,
          brick: undefined,
          parentBrick: undefined,
          type: FractionTypeEnum.StoreFraction,
          storeResult: field.result,
          storeFractionSubTypeOptions: storeFractionSubTypeOptions,
          storeFractionSubType: storeResultFraction?.type,
          storeFractionSubTypeLabel: isDefined(storeResultFraction?.type)
            ? storeFractionSubTypeOptions.find(
                k => k.typeValue === storeResultFraction?.type
              ).label
            : storeResultFraction?.type,
          storeFractionLogicGroupWithSubType:
            isDefined(logicGroup) && isDefined(storeResultFraction?.type)
              ? `${logicGroup}${TRIPLE_UNDERSCORE}${storeResultFraction.type}`
              : undefined,
          controls: isUndefined(storeResultFraction)
            ? storeFilter.fraction_controls.map(control => {
                let newControl: FractionControl = {
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
            : this.model.storeContent.results
                .find(r => r.result === field.result)
                .fraction_types[0].controls.map(control => {
                  let newControl: FractionControl = {
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
          parentBrick: 'any',
          operator: FractionOperatorEnum.Or,
          type: getFractionTypeForAny(node.data.fieldResult)
        };
      }

      let newFilter: Filter = {
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
  }

  makeNodesExtra(item: { searchSchemaWord: string }) {
    let { searchSchemaWord } = item;

    let nestedNodes = this.model.nodes.map(topNode => {
      topNode.children.map(middleNode => {
        middleNode.children.map(leafNode => this.updateNodeExtra(leafNode));
        return this.updateNodeExtra(middleNode);
      });
      return this.updateNodeExtra(topNode);
    });

    let flatNodes: ModelNodeExtra[] = [];

    let flatNodesFilters: ModelNodeExtra[] = [];
    let flatNodesDimensions: ModelNodeExtra[] = [];
    let flatNodesMeasures: ModelNodeExtra[] = [];
    let flatNodesCalculations: ModelNodeExtra[] = [];

    if (
      this.modelTreeLevels === ModelTreeLevelsEnum.Flat ||
      this.modelTreeLevels === ModelTreeLevelsEnum.FlatTime
    ) {
      nestedNodes.forEach(topNode => {
        topNode.children.forEach(middleNode => {
          middleNode.joinLabel = topNode.label;

          if (middleNode.children.length > 0) {
            middleNode.children.forEach(leafNode => {
              leafNode.joinLabel = topNode.label;
              leafNode.timeLabel = middleNode.label;

              if (this.modelTreeLevels === ModelTreeLevelsEnum.FlatTime) {
                if (leafNode.nodeClass === FieldClassEnum.Filter) {
                  flatNodesFilters.push(leafNode);
                } else if (leafNode.nodeClass === FieldClassEnum.Dimension) {
                  flatNodesDimensions.push(leafNode);
                } else if (leafNode.nodeClass === FieldClassEnum.Measure) {
                  flatNodesMeasures.push(leafNode);
                } else if (leafNode.nodeClass === FieldClassEnum.Calculation) {
                  flatNodesCalculations.push(leafNode);
                }
              }
            });

            if (this.modelTreeLevels === ModelTreeLevelsEnum.Flat) {
              flatNodesDimensions.push(middleNode);
            }
          } else {
            if (middleNode.nodeClass === FieldClassEnum.Filter) {
              flatNodesFilters.push(middleNode);
            } else if (middleNode.nodeClass === FieldClassEnum.Dimension) {
              flatNodesDimensions.push(middleNode);
            } else if (middleNode.nodeClass === FieldClassEnum.Measure) {
              flatNodesMeasures.push(middleNode);
            } else if (middleNode.nodeClass === FieldClassEnum.Calculation) {
              flatNodesCalculations.push(middleNode);
            }
          }
        });
      });

      if (flatNodesMeasures.length > 0) {
        flatNodes.push({
          id: `${ModelNodeIdSuffixEnum.Measures}`,
          label: ModelNodeLabelEnum.Measures,
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesMeasures];
      }

      if (flatNodesCalculations.length > 0) {
        flatNodes.push({
          id: `${ModelNodeIdSuffixEnum.Calculations}`,
          label: ModelNodeLabelEnum.Calculations,
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesCalculations];
      }

      if (flatNodesDimensions.length > 0) {
        flatNodes.push({
          id: `${ModelNodeIdSuffixEnum.Dimensions}`,
          label: ModelNodeLabelEnum.Dimensions,
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesDimensions];
      }

      if (flatNodesFilters.length > 0) {
        flatNodes.push({
          id: `${ModelNodeIdSuffixEnum.Filters}`,
          label: ModelNodeLabelEnum.FilterOnlyFields,
          description: undefined,
          hidden: false,
          required: false,
          isField: false,
          children: [],
          nodeClass: FieldClassEnum.Info,
          isSelected: false,
          isFiltered: false
        });

        flatNodes = [...flatNodes, ...flatNodesFilters];
      }
    }

    if (this.modelTreeLevels === ModelTreeLevelsEnum.Nested) {
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

    if (this.modelTreeLevels === ModelTreeLevelsEnum.NestedFlatTime) {
      nestedFlatTimeNodes = makeCopy(nestedNodes);

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

    let nodesExtra =
      this.modelTreeLevels === ModelTreeLevelsEnum.Flat ||
      this.modelTreeLevels === ModelTreeLevelsEnum.FlatTime
        ? flatNodes
        : this.modelTreeLevels === ModelTreeLevelsEnum.NestedFlatTime
          ? nestedFlatTimeNodes
          : nestedNodes;

    if (isDefinedAndNotEmpty(searchSchemaWord)) {
      let filteredNodesExtra: ModelNodeExtra[] = makeCopy(nodesExtra);

      filteredNodesExtra = filteredNodesExtra.filter(aNode => {
        let aCheck = false;

        if (aNode.children?.length > 0) {
          aCheck = true;

          aNode.children = aNode.children.filter(bNode => {
            let bCheck = false;

            if (bNode.children?.length > 0) {
              bCheck = true;
              bNode.children = bNode.children.filter(cNode => {
                return (
                  cNode.isField === false ||
                  this.fieldSearchFn({
                    term: searchSchemaWord,
                    label: cNode.label,
                    timeLabel: cNode.timeLabel,
                    joinLabel: cNode.joinLabel
                  })
                );
              });
            }

            return bCheck === true
              ? bNode.children.length > 0
              : bNode.isField === false ||
                  this.fieldSearchFn({
                    term: searchSchemaWord,
                    label: bNode.label,
                    timeLabel: bNode.timeLabel,
                    joinLabel: bNode.joinLabel
                  });
          });
        }

        return aCheck === true &&
          (this.modelTreeLevels === ModelTreeLevelsEnum.Flat ||
            this.modelTreeLevels === ModelTreeLevelsEnum.FlatTime)
          ? aNode.children.length > 0
          : aCheck === true
            ? aNode.children.filter(x => x.nodeClass !== FieldClassEnum.Info)
                .length > 0
            : aNode.isField === false ||
              this.fieldSearchFn({
                term: searchSchemaWord,
                label: aNode.label,
                timeLabel: aNode.timeLabel,
                joinLabel: aNode.joinLabel
              });
      });

      this.nodesExtra = filteredNodesExtra;
    } else {
      this.nodesExtra = nodesExtra;
    }
  }

  fieldSearchFn(item: {
    term: string;
    label: string;
    timeLabel: string;
    joinLabel: string;
  }) {
    let { term, label, timeLabel, joinLabel } = item;

    let haystack = [
      isDefinedAndNotEmpty(timeLabel)
        ? `${joinLabel} ${timeLabel} ${label}`
        : `${joinLabel} ${label}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  updateNodeExtra(node: ModelNode): ModelNodeExtra {
    return Object.assign(node, <ModelNodeExtra>{
      isSelected:
        isDefined(this.mconfig?.structId) && node.isField === true
          ? this.mconfig.select.findIndex(x => x === node.id) > -1
          : false,
      isFiltered:
        isDefined(this.mconfig?.structId) && node.isField === true
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

  setModelTreeLevels(modelTreeLevels: ModelTreeLevelsEnum) {
    this.uiQuery.updatePart({ modelTreeLevels: modelTreeLevels });
    this.uiService.setUserUi({ modelTreeLevels: modelTreeLevels });
  }
}
