import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@circlon/angular-tree-component';
import { tap } from 'rxjs/operators';
import { ModelNode } from '~common/_index';
import { FileQuery } from '~front/app/queries/file.query';
import { MconfigQuery } from '~front/app/queries/mconfig.query';
import { ModelQuery } from '~front/app/queries/model.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { MconfigState } from '~front/app/stores/mconfig.store';
import { ModelState } from '~front/app/stores/model.store';
import { RepoStore } from '~front/app/stores/repo.store';
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
    private navQuery: NavQuery,
    private mconfigQuery: MconfigQuery,
    private uiQuery: UiQuery,
    private fileQuery: FileQuery,
    private apiService: ApiService,
    private repoStore: RepoStore,
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
    }
  }

  select() {}

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
        common.isDefined(this.mconfig) && node.isField === true
          ? this.mconfig.select.findIndex(x => x === node.id) > -1
          : false,
      isFiltered:
        common.isDefined(this.mconfig) && node.isField === true
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
