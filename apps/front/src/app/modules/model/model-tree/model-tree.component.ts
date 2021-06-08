import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@circlon/angular-tree-component';
import { map, take, tap } from 'rxjs/operators';
import { ModelNode } from '~common/_index';
import { MconfigQuery } from '~front/app/queries/mconfig.query';
import { ModelQuery } from '~front/app/queries/model.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { StructService } from '~front/app/services/struct.service';
import { MconfigState, MconfigStore } from '~front/app/stores/mconfig.store';
import { ModelState } from '~front/app/stores/model.store';
import { QueryStore } from '~front/app/stores/query.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
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

      console.log(x);

      this.makeNodesExtra();
      this.cd.detectChanges();
    })
  );

  mconfig: MconfigState;
  mconfig$ = this.mconfigQuery.select().pipe(
    tap(x => {
      this.mconfig = x;

      console.log(x);

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
    private mconfigQuery: MconfigQuery,
    private apiService: ApiService,
    private structService: StructService,
    private mconfigStore: MconfigStore,
    private queryStore: QueryStore,
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
    console.log(newMconfig);

    if (node.data.isSelected === true) {
      newMconfig = this.removeField({ newMconfig, fieldId: node.data.id });
    } else {
      newMconfig.select = [...newMconfig.select, node.data.id];
    }

    let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryRequestPayload = {
      mconfig: newMconfig
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendCreateTempMconfigAndQuery,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendCreateTempMconfigAndQueryResponse) => {
          let { mconfig, query } = resp.payload;

          this.mconfigStore.update(mconfig);
          this.queryStore.update(query);

          this.navigateService.navigateMconfigQueryData({
            mconfigId: mconfig.mconfigId,
            queryId: mconfig.queryId
          });
        }),
        take(1)
      )
      .subscribe();
  }

  removeField(item: { newMconfig: common.Mconfig; fieldId: string }) {
    let { newMconfig, fieldId } = item;

    newMconfig = this.removeFieldFromSelect({ newMconfig, fieldId });
    newMconfig = this.removeFieldFromSortings({ newMconfig, fieldId });

    // newMconfig.charts = newMconfig.charts.map(chart =>
    //   this.removeFieldFromChart(chart, fieldId)
    // );

    return newMconfig;
  }

  removeFieldFromSelect(item: { newMconfig: common.Mconfig; fieldId: string }) {
    let { newMconfig, fieldId } = item;

    let fieldIndex = newMconfig.select.findIndex(x => x === fieldId);

    newMconfig.select = [
      ...newMconfig.select.slice(0, fieldIndex),
      ...newMconfig.select.slice(fieldIndex + 1)
    ];

    return newMconfig;
  }

  removeFieldFromSortings(item: {
    newMconfig: common.Mconfig;
    fieldId: string;
  }) {
    let { newMconfig, fieldId } = item;

    let fIndex = newMconfig.sortings.findIndex(x => x.fieldId === fieldId);

    if (fIndex > -1) {
      newMconfig.sortings = [
        ...newMconfig.sortings.slice(0, fIndex),
        ...newMconfig.sortings.slice(fIndex + 1)
      ];

      let newSorts: string[] = [];

      newMconfig.sortings.forEach(sorting =>
        sorting.desc === true
          ? newSorts.push(`${sorting.fieldId} desc`)
          : newSorts.push(sorting.fieldId)
      );

      newMconfig.sorts =
        newMconfig.sortings.length > 0 ? newSorts.join(', ') : null;
    }

    return newMconfig;
  }

  filterField(node: TreeNode) {
    let newMconfig = this.structService.makeMconfig();

    // if ()
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

  // ngOnDestroy() {
  //   this.expandLevel$.unsubscribe();
  // }
}
