import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@circlon/angular-tree-component';
import { take, tap } from 'rxjs/operators';
import { ModelNode } from '~common/_index';
import { ModelQuery } from '~front/app/queries/model.query';
import { MqQuery } from '~front/app/queries/mq.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { StructService } from '~front/app/services/struct.service';
import { ModelState } from '~front/app/stores/model.store';
import { MqStore } from '~front/app/stores/mq.store';
import { StructStore } from '~front/app/stores/struct.store';
import { common } from '~front/barrels/common';

export class ModelNodeExtra extends common.ModelNode {
  isSelected: boolean;
  isFiltered: boolean;
}

@Component({
  selector: 'm-model-tree',
  templateUrl: './model-tree.component.html',
  styleUrls: ['model-tree.component.scss']
})
// implements OnDestroy
export class ModelTreeComponent {
  nodeClassInfo = common.FieldClassEnum.Info;
  nodeClassDimension = common.FieldClassEnum.Dimension;
  nodeClassMeasure = common.FieldClassEnum.Measure;
  nodeClassCalculation = common.FieldClassEnum.Calculation;

  nodesExtra: ModelNodeExtra[] = [];

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
      this.makeNodesExtra();
      // console.log(this.nodesExtra);
      this.cd.detectChanges();
    })
  );

  mconfig: common.Mconfig;
  mconfig$ = this.mqQuery.mconfig$.pipe(
    tap(x => {
      this.mconfig = x;

      // console.log(x);

      this.makeNodesExtra();
      this.cd.detectChanges();
    })
  );

  actionMapping: IActionMapping = {
    mouse: {
      // dragStart: () => {
      //   this.cd.detach();
      // },
      // dragEnd: () => {
      //   this.cd.reattach();
      // }
    },
    keys: {
      // [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.label}`)
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
    public modelQuery: ModelQuery,
    private cd: ChangeDetectorRef,
    private mqQuery: MqQuery,
    private structService: StructService,
    private mconfigService: MconfigService,
    private mqStore: MqStore,
    public structStore: StructStore,
    private navigateService: NavigateService
  ) {}

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
    //           tap(z => {
    //             projectId = z;
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
    // console.log(newMconfig);

    if (node.data.isSelected === true) {
      newMconfig = this.mconfigService.removeField({
        newMconfig,
        fieldId: node.data.id
      });
    } else {
      newMconfig.select = [...newMconfig.select, node.data.id];
    }

    if (newMconfig.select.length > 0) {
      let fields: common.ModelField[];
      this.modelQuery.fields$
        .pipe(
          tap(x => (fields = x)),
          take(1)
        )
        .subscribe();

      let selectDimensions: string[] = [];
      let selectMeasures: string[] = [];
      let selectCalculations: string[] = [];

      newMconfig.select.forEach((fieldId: string) => {
        let field = fields.find(f => f.id === fieldId);

        if (field.fieldClass === common.FieldClassEnum.Dimension) {
          selectDimensions.push(field.id);
        } else if (field.fieldClass === common.FieldClassEnum.Measure) {
          selectMeasures.push(field.id);
        } else if (field.fieldClass === common.FieldClassEnum.Calculation) {
          selectCalculations.push(field.id);
        }
      });

      let selectMeasuresAndCalculations = [
        ...selectMeasures,
        ...selectCalculations
      ];

      let sortedSelect: string[] = [
        ...selectDimensions,
        ...selectMeasuresAndCalculations
      ];

      newMconfig.chart = Object.assign({}, newMconfig.chart, <common.Chart>{
        xField: selectDimensions.length > 0 ? selectDimensions[0] : undefined,
        yField:
          selectMeasuresAndCalculations.length > 0
            ? newMconfig.chart.yField || selectMeasuresAndCalculations[0]
            : undefined,
        yFields:
          selectMeasuresAndCalculations.length === 0
            ? []
            : newMconfig.chart.yFields.length > 0
            ? newMconfig.chart.yFields
            : [...selectMeasuresAndCalculations],
        multiField:
          selectDimensions.length === 2 ? selectDimensions[1] : undefined,
        valueField:
          selectMeasuresAndCalculations.length > 0
            ? newMconfig.chart.valueField || selectMeasuresAndCalculations[0]
            : undefined,
        previousValueField: newMconfig.chart.previousValueField
      });
    }

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
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
        type: common.FractionTypeEnum.StringIsAnyValue // 'any'
      };

      let newFilter: common.Filter = {
        fieldId: node.data.id,
        fractions: [newFraction]
      };

      newMconfig.filters = [...newMconfig.filters, newFilter];
    }

    this.mconfigService.navCreateMconfigAndQuery(newMconfig);
  }

  makeNodesExtra() {
    this.nodesExtra = this.model.nodes.map(topNode => {
      topNode.children.map(middleNode => {
        middleNode.children.map(leafNode => this.updateNodeExtra(leafNode));
        return this.updateNodeExtra(middleNode);
      });
      return this.updateNodeExtra(topNode);
    });
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
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE),
      lineNumber: fieldLineNumber
    });
  }

  // ngOnDestroy() {
  //   this.expandLevel$.unsubscribe();
  // }
}
