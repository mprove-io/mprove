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
import { take, tap } from 'rxjs/operators';
import { ModelNode } from '~common/_index';
import { setChartFields } from '~front/app/functions/set-chart-fields';
import { setChartTitleOnSelectChange } from '~front/app/functions/set-chart-title-on-select-change';
import { sortChartFieldsOnSelectChange } from '~front/app/functions/sort-chart-fields-on-select-change';
import { ModelQuery, ModelState } from '~front/app/queries/model.query';
import { MqQuery } from '~front/app/queries/mq.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { StructService } from '~front/app/services/struct.service';
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
export class ModelTreeComponent implements AfterViewInit {
  nodeClassInfo = common.FieldClassEnum.Info;
  nodeClassDimension = common.FieldClassEnum.Dimension;
  nodeClassMeasure = common.FieldClassEnum.Measure;
  nodeClassCalculation = common.FieldClassEnum.Calculation;
  nodeClassFilter = common.FieldClassEnum.Filter;
  fieldResultTs = common.FieldResultEnum.Ts;

  nodesExtra: ModelNodeExtra[] = [];

  @Output()
  expandFilters = new EventEmitter();

  @Output()
  expandData = new EventEmitter();

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
      this.makeNodesExtra();
      // console.log(this.nodesExtra);
      this.cd.detectChanges();
    })
  );

  mconfig: common.MconfigX;
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

    newMconfig = setChartTitleOnSelectChange({
      newMconfig: newMconfig,
      fields: fields
    });

    newMconfig = setChartFields({
      newMconfig: newMconfig,
      fields: fields
    });

    newMconfig = sortChartFieldsOnSelectChange({
      newMconfig: newMconfig,
      fields: fields
    });

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
        type: common.getFractionTypeForAny(node.data.fieldResult)
      };

      let newFilter: common.Filter = {
        fieldId: node.data.id,
        fractions: [newFraction]
      };

      newMconfig.filters = [...newMconfig.filters, newFilter];

      this.expandFilters.emit();
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

  // ngOnDestroy() {
  //   this.expandLevel$?.unsubscribe();
  // }
}
