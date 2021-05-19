import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  IActionMapping,
  KEYS,
  TreeComponent,
  TreeNode
} from '@circlon/angular-tree-component';
import { take, tap } from 'rxjs/operators';
import { RepoQuery } from '~front/app/queries/repo.query';
import { RepoState } from '~front/app/stores/repo.store';

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
    }),
    take(1)
  );

  actionMapping: IActionMapping = {
    mouse: {},
    keys: {
      [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.name}`)
    }
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'name'
  };

  @ViewChild('itemsTree') itemsTree: TreeComponent;

  constructor(public repoQuery: RepoQuery, private cd: ChangeDetectorRef) {}

  treeOnInitialized() {
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
    // let selectedProjectId: string;
    // this.store
    //   .select(selectors.getSelectedProjectId)
    //   .pipe(take(1))
    //   .subscribe(id => (selectedProjectId = id));
    // this.itemsTree.treeModel.getNodeById(selectedProjectId).expand();
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

  nodeOptionsClick(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    console.log('nodeOptionsClick');
  }
}
