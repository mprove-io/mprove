import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  IActionMapping,
  KEYS,
  TreeComponent,
  TreeNode
} from '@circlon/angular-tree-component';
import { Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ProjectQuery } from '~front/app/queries/project.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { NavState } from '~front/app/stores/nav.store';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-blockml-tree',
  templateUrl: './blockml-tree.component.html',
  styleUrls: ['blockml-tree.component.scss']
})
export class BlockmlTreeComponent implements OnDestroy {
  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      // console.log(x);
      this.cd.detectChanges();
    })
  );

  projectName$ = this.projectQuery.name$;

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
      (to.parent.data.isFolder && to.parent.data.id !== node.parent.data.id) ||
      (!to.parent.data.isFolder &&
        to.parent.parent.data.id !== node.parent.data.id)
  };

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  expandLevel$: Subscription;

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  fileNodeId: string;

  file$ = this.fileQuery.select().pipe(
    tap(x => {
      if (common.isUndefined(x.fileId)) {
        this.fileNodeId = undefined;
        this.cd.detectChanges();
        return;
      }

      let projectId;

      this.navQuery
        .select()
        .pipe(
          tap(z => {
            projectId = z.projectId;
          }),
          take(1)
        )
        .subscribe();

      let fIdAr = x.fileId.split(common.TRIPLE_UNDERSCORE);

      this.fileNodeId = [projectId, ...fIdAr].join('/');
      this.cd.detectChanges();
    })
  );

  @ViewChild('itemsTree') itemsTree: TreeComponent;

  constructor(
    public repoQuery: RepoQuery,
    public projectQuery: ProjectQuery,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private fileQuery: FileQuery,
    private apiService: ApiService,
    private repoStore: RepoStore,
    public structStore: StructStore,
    private navigateService: NavigateService
  ) {}

  treeOnInitialized() {
    if (this.repo.nodes.length === 0) {
      return;
    }

    this.itemsTree.treeModel.getNodeById(this.nav.projectId).expand();
    this.cd.detectChanges();

    this.expandLevel$ = this.fileQuery
      .select()
      .pipe(
        tap(x => {
          let projectId: string;
          this.navQuery.projectId$
            .pipe(
              tap(z => {
                projectId = z;
              }),
              take(1)
            )
            .subscribe();

          let levelPath: string = projectId;

          if (common.isDefined(x.fileId)) {
            x.fileId.split(common.TRIPLE_UNDERSCORE).forEach(part => {
              levelPath = levelPath ? `${levelPath}/${part}` : part;
              this.itemsTree.treeModel.getNodeById(levelPath).expand();
            });
          }

          this.cd.detectChanges();
        })
      )
      .subscribe();
  }

  treeOnUpdateData() {
    if (this.repo.nodes.length === 0) {
      return;
    }

    this.itemsTree.treeModel.getNodeById(this.nav.projectId).expand();
  }

  nodeOnClick(node: TreeNode) {
    node.toggleActivated();
    if (node.data.isFolder) {
      if (node.hasChildren) {
        node.toggleExpanded();
      }
    } else {
      this.navigateService.navigateToFileLine({
        underscoreFileId: node.data.fileId
      });
    }
  }

  onMoveNode(event: any) {
    this.cd.detach();

    // console.log(event.to.parent);

    let nameArray = event.to.parent.id.split('/');
    if (nameArray.length > 1) {
      nameArray.pop();
    }

    let parentId = event.to.parent.isFolder
      ? event.to.parent.id
      : nameArray.join('/');

    // console.log(parentId);

    this.itemsTree.treeModel.getNodeById(parentId).expand();

    let toNodeId = parentId + '/' + event.node.name;

    let payload: apiToBackend.ToBackendMoveCatalogNodeRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      fromNodeId: event.node.id,
      toNodeId: toNodeId
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMoveCatalogNode,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendMoveCatalogNodeResponse) => {
          this.repoStore.update(resp.payload.repo);
          this.structStore.update(resp.payload.struct);

          this.cd.reattach();
        }),
        take(1)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.expandLevel$.unsubscribe();
  }
}
