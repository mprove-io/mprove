import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  IActionMapping,
  KEYS,
  TreeComponent,
  TreeNode
} from '@bugsplat/angular-tree-component';
import { Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ProjectQuery } from '~front/app/queries/project.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { PanelEnum } from '../files.component';

@Component({
  selector: 'm-files-tree',
  templateUrl: './files-tree.component.html',
  styleUrls: ['files-tree.component.scss']
})
export class FilesTreeComponent implements OnDestroy {
  @Input()
  panel: PanelEnum;

  diffId = 'id2';

  diffs: any = [
    {
      label: 'label1',
      path: 'path1',
      id: 'id1'
    },
    {
      label: 'label2',
      path: 'path2',
      id: 'id2'
    },
    {
      label: 'label3',
      path: 'path3',
      id: 'id3'
    },
    {
      label: 'label4',
      path: 'path4',
      id: 'id4'
    },
    {
      label: 'label5',
      path: 'path5',
      id: 'id5'
    }
  ];

  panelWorkingTree = PanelEnum.WorkingTree;
  panelChangesToCommit = PanelEnum.ChangesToCommit;
  panelChangesToPush = PanelEnum.ChangesToPush;

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
    allowDrag: (node: TreeNode) =>
      this.nav?.isRepoProd === false && node.data.id !== this.nav.projectId,
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
    private navStore: NavStore,
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

  diffOnClick(diffId: string) {
    this.diffId = diffId;
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
      envId: this.nav.envId,
      fromNodeId: event.node.id,
      toNodeId: toNodeId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendMoveCatalogNode,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendMoveCatalogNodeResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            this.cd.reattach();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyFilesTree');
    this.expandLevel$?.unsubscribe();
  }
}
