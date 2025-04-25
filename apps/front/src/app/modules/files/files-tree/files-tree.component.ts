import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@ali-hm/angular-tree-component';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { FileQuery, FileState } from '~front/app/queries/file.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ProjectQuery } from '~front/app/queries/project.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-files-tree',
  templateUrl: './files-tree.component.html',
  styleUrls: ['files-tree.component.scss']
})
export class FilesTreeComponent implements OnDestroy {
  @Input()
  panel: common.PanelEnum;

  panelTree = common.PanelEnum.Tree;
  panelChangesToCommit = common.PanelEnum.ChangesToCommit;
  panelChangesToPush = common.PanelEnum.ChangesToPush;

  repoStatusNeedPush = common.RepoStatusEnum.NeedPush;

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
  fileId: string;

  file: FileState;
  file$ = this.fileQuery.select().pipe(
    tap(x => {
      this.file = x;

      this.fileId = x.fileId;

      if (common.isUndefined(x.fileId)) {
        this.fileNodeId = undefined;
        this.cd.detectChanges();
        return;
      }

      let projectId;

      this.navQuery
        .select()
        .pipe(
          tap(y => {
            projectId = y.projectId;
          }),
          take(1)
        )
        .subscribe();

      let fIdAr = x.fileId.split(common.TRIPLE_UNDERSCORE);

      this.fileNodeId = [projectId, ...fIdAr].join('/');
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      this.cd.detectChanges();
    })
  );

  @ViewChild('itemsTree') itemsTree: TreeComponent;

  constructor(
    private repoQuery: RepoQuery,
    private projectQuery: ProjectQuery,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
    private fileQuery: FileQuery,
    private apiService: ApiService,
    private navigateService: NavigateService
  ) {}

  treeOnInitialized() {
    if (this.repo.nodes.length === 0) {
      return;
    }

    let mproveDirValue = this.struct.mproveDirValue;

    if (
      common.isUndefined(mproveDirValue) ||
      [
        common.MPROVE_CONFIG_DIR_DOT,
        common.MPROVE_CONFIG_DIR_DOT_SLASH
      ].indexOf(mproveDirValue) > -1
    ) {
      this.itemsTree.treeModel.getNodeById(this.nav.projectId).expand();
    } else {
      let mproveDirValuePart;
      if (mproveDirValue.startsWith('./')) {
        mproveDirValuePart = mproveDirValue.slice(2);
      } else if (mproveDirValue.startsWith('.')) {
        mproveDirValuePart = mproveDirValue.slice(1);
      }

      let path = this.nav.projectId;

      mproveDirValuePart.split('/').forEach(x => {
        path = path + '/' + x;
        let pathNodeId = `${path}`;
        this.itemsTree.treeModel.getNodeById(pathNodeId).expand();
      });

      this.itemsTree.treeModel.getNodeById(this.nav.projectId).expand();
    }

    this.cd.detectChanges();

    this.expandLevel$ = this.fileQuery
      .select()
      .pipe(
        tap(x => {
          if (
            this.panel === common.PanelEnum.Tree &&
            common.isDefined(x.fileId) &&
            this.file.isExist === true
          ) {
            let projectId: string;
            this.navQuery.projectId$
              .pipe(
                tap(y => {
                  projectId = y;
                }),
                take(1)
              )
              .subscribe();

            let levelPath: string = projectId;

            x.fileId.split(common.TRIPLE_UNDERSCORE).forEach(part => {
              levelPath = levelPath ? `${levelPath}/${part}` : part;
              this.itemsTree.treeModel.getNodeById(levelPath)?.expand();
            });
            this.cd.detectChanges();
          }
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

  changeToCommitOnClick(fileId: string) {
    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.ChangesToCommit,
      underscoreFileId: fileId
    });
  }

  changeToPushOnClick(fileId: string) {
    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.ChangesToPush,
      underscoreFileId: fileId
    });
  }

  nodeOnClick(node: TreeNode) {
    node.toggleActivated();
    if (node.data.isFolder) {
      if (node.hasChildren) {
        node.toggleExpanded();
      }
    } else {
      this.navigateService.navigateToFileLine({
        panel: common.PanelEnum.Tree,
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
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

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
