import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  IActionMapping,
  KEYS,
  TreeComponent,
  TreeNode
} from 'angular-tree-component';
import { filter, map, take, tap } from 'rxjs/operators';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-catalog-tree',
  templateUrl: 'catalog-tree.component.html',
  styleUrls: ['catalog-tree.component.scss']
})
export class CatalogTreeComponent {
  actionMapping: IActionMapping = {
    mouse: {
      // drop: (tree: TreeModel, node: TreeNode, $event: any, { from, to }) => {
      //   const { file_id } = from.data;
      //   const { id } = to.parent.data;
      //   const toPath = id.split('/');
      //   this.store.select(selectors.getSelectedProjectModeRepo).take(1)
      //     .subscribe(({ project_id, repo_id, server_ts }) => {
      //       this.store.dispatch(new MoveFileAction({
      //         project_id,
      //         repo_id,
      //         file_id,
      //         server_ts,
      //         to_path: toPath
      //       }));
      //     });
      // },
    },
    keys: {
      [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.name}`)
    }
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    // allowDrag: (node: TreeNode) => node.isLeaf,
    // allowDrop: (element: any, to: any) => to.parent.hasChildren,
    displayField: 'name'
  };

  projectId$ = this.store
    .select(selectors.getSelectedProjectId)
    .pipe(filter(v => !!v));

  isDev$ = this.store.select(selectors.getLayoutModeIsDev); // no filter here

  needSave$ = this.store.select(selectors.getLayoutNeedSave); // no filter here

  treeNodes$ = this.store
    .select(selectors.getSelectedProjectModeRepoNodes)
    .pipe(
      filter(v => !!v),
      map(x => JSON.parse(JSON.stringify(x)))
    );

  @ViewChild('itemsTree') itemsTree: TreeComponent;

  constructor(
    private store: Store<interfaces.AppState>,
    private navigateService: services.NavigateService,
    private myDialogService: services.MyDialogService
  ) {}

  nodeOnClick(node: TreeNode) {
    node.toggleActivated();
    if (node.data.is_folder) {
      if (node.hasChildren) {
        node.toggleExpanded();
      }
    } else {
      this.navigateService.navigateToFileLine(node.data.file_id);
    }
  }

  treeOnInitialized() {
    this.store
      .select(selectors.getSelectedProjectModeRepoFilePath)
      .pipe(
        tap(path => {
          if (path) {
            // let slicedPath = path.slice(0, (path.length - 1));

            let cPath: string;

            path.forEach((p, i, a) => {
              cPath = cPath ? cPath + '/' + p : p;

              this.itemsTree.treeModel.getNodeById(cPath).expand();
            });
          } else {
            let selectedProjectId: string;
            this.store
              .select(selectors.getSelectedProjectId)
              .pipe(take(1))
              .subscribe(id => (selectedProjectId = id));
            this.itemsTree.treeModel.getNodeById(selectedProjectId).expand();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  treeOnUpdateData() {
    let selectedProjectId: string;
    this.store
      .select(selectors.getSelectedProjectId)
      .pipe(take(1))
      .subscribe(id => (selectedProjectId = id));
    this.itemsTree.treeModel.getNodeById(selectedProjectId).expand();
  }

  openNewFolderDialog(node: TreeNode) {
    this.myDialogService.showNewFolderDialog({ node_id: node.data.id });
  }

  openRenameFolderDialog(node: TreeNode) {
    this.myDialogService.showRenameFolderDialog({ node_id: node.data.id });
  }

  openDeleteFolderDialog(node: TreeNode) {
    this.myDialogService.showDeleteFolderDialog({ node_id: node.data.id });
  }

  openNewFileDialog(node: TreeNode) {
    this.myDialogService.showNewFileDialog({ node_id: node.data.id });
  }

  openDeleteFileDialog(node: TreeNode) {
    let nodeFile: api.CatalogFile;

    this.store
      .select(selectors.getSelectedProjectModeRepoFiles)
      .pipe(take(1))
      .subscribe(x => {
        nodeFile = x.find(f => f.file_id === node.data.file_id);
      });

    this.myDialogService.showDeleteFileDialog({ file: nodeFile });
  }
}
