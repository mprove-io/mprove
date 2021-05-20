import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  IActionMapping,
  KEYS,
  TreeComponent,
  TreeNode
} from '@circlon/angular-tree-component';
import { take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { ApiService } from '~front/app/services/api.service';
import { NavState } from '~front/app/stores/nav.store';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-blockml-tree',
  templateUrl: './blockml-tree.component.html',
  styleUrls: ['blockml-tree.component.scss']
})
export class BlockmlTreeComponent {
  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      console.log(x);
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
      [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.name}`)
    }
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'name',
    allowDrag: (node: TreeNode) => node.data.id !== this.nav.projectId,
    allowDrop: (node: TreeNode, to: { parent: any; index: number }) =>
      to.parent.data.isFolder && to.parent.data.id !== node.parent.data.id
  };

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  @ViewChild('itemsTree') itemsTree: TreeComponent;

  constructor(
    public repoQuery: RepoQuery,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private repoStore: RepoStore
  ) {}

  treeOnInitialized() {
    this.itemsTree.treeModel.getNodeById(this.nav.projectId).expand();

    // this.store
    //   .select(selectors.getSelectedProjectModeRepoFilePath)
    //   .pipe(
    //     tap(path => {
    //       if (path) {
    //         let cPath: string;
    //         path.forEach((p, i, a) => {
    //           cPath = cPath ? cPath + '/' + p : p;
    //           this.itemsTree.treeModel.getNodeById(cPath).expand();
    //         });
    //       } else {
    //         let selectedProjectId: string;
    //         this.store
    //           .select(selectors.getSelectedProjectId)
    //           .pipe(take(1))
    //           .subscribe(id => (selectedProjectId = id));
    //         this.itemsTree.treeModel.getNodeById(selectedProjectId).expand();
    //       }
    //     }),
    //     take(1)
    //   )
    //   .subscribe();
  }

  treeOnUpdateData() {
    this.itemsTree.treeModel.getNodeById(this.nav.projectId).expand();
  }

  nodeOnClick(node: TreeNode) {
    node.toggleActivated();
    if (node.data.isFolder) {
      if (node.hasChildren) {
        node.toggleExpanded();
      }
    } else {
      // this.navigateService.navigateToFileLine(node.data.file_id);
    }
  }

  onMoveNode(event: any) {
    this.itemsTree.treeModel.getNodeById(event.to.parent.id).expand();

    let payload: apiToBackend.ToBackendMoveCatalogNodeRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      fromNodeId: event.node.id,
      toNodeId: event.to.parent.id + '/' + event.node.name
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMoveCatalogNode,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendMoveCatalogNodeResponse) => {
          this.repoStore.update(resp.payload.repo);
        }),
        take(1)
      )
      .subscribe();
  }
}
