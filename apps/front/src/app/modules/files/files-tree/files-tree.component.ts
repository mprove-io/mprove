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
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize, take, tap } from 'rxjs/operators';
import { FileQuery, FileState } from '~front/app/queries/file.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ProjectQuery } from '~front/app/queries/project.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
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

  topNodes: common.DiskCatalogNode[] = [];

  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.topNodes = [...this.repo.nodes[0].children];

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

  word: string;

  private timer: any;

  constructor(
    private repoQuery: RepoQuery,
    private projectQuery: ProjectQuery,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
    private userQuery: UserQuery,
    private router: Router,
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
      mproveDirValue === common.MPROVE_CONFIG_DIR_DOT_SLASH
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

    let fromNodeId = event.node.id;
    let toNodeId = parentId + '/' + event.node.name;

    let payload: apiToBackend.ToBackendMoveCatalogNodeRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fromNodeId: fromNodeId,
      toNodeId: toNodeId
    };

    let isMoveSuccess = false;
    let newFileId: string;

    if (common.isDefined(this.fileId)) {
      let selectedPath = this.fileId.split(common.TRIPLE_UNDERSCORE).join('/');
      let fromPath = fromNodeId.split('/').slice(1).join('/');
      let toPath = toNodeId.split('/').slice(1).join('/');

      if (
        selectedPath.startsWith(fromPath + '/') ||
        selectedPath === fromPath
      ) {
        let relativePath =
          selectedPath === fromPath
            ? ''
            : selectedPath.slice(fromPath.length + 1);

        let newPath = common.isDefinedAndNotEmpty(relativePath)
          ? `${toPath}/${relativePath}`
          : toPath;

        newFileId = newPath.split('/').join(common.TRIPLE_UNDERSCORE);
      }
    }

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
            isMoveSuccess = true;

            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            if (common.isDefined(newFileId)) {
              this.navigateService.navigateToFileLine({
                panel: common.PanelEnum.Tree,
                underscoreFileId: newFileId
              });
            }
          }
        }),
        take(1),
        finalize(() => {
          this.cd.reattach();

          if (isMoveSuccess === false) {
            let repoId =
              this.nav.isRepoProd === true
                ? common.PROD_REPO_ID
                : this.userQuery.getValue().userId;

            let arStart = [
              common.PATH_ORG,
              this.nav.orgId,
              common.PATH_PROJECT,
              this.nav.projectId,
              common.PATH_REPO,
              repoId,
              common.PATH_BRANCH,
              this.nav.branchId,
              common.PATH_ENV,
              this.nav.envId,
              common.PATH_FILES
            ];

            let arStartStr = arStart.join('/');

            let arNext = [
              ...arStart,
              common.PATH_FILE,
              common.LAST_SELECTED_FILE_ID
            ];

            this.router
              .navigateByUrl(arStartStr, { skipLocationChange: true })
              .then(() => {
                this.router.navigate(arNext, {
                  queryParams: {
                    panel: common.PanelEnum.Tree
                  }
                });
              });
          }
        })
      )
      .subscribe();
  }

  makeFilteredFiles() {}

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredFiles();

      this.cd.detectChanges();
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredFiles();

    this.cd.detectChanges();
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyFilesTree');
    this.expandLevel$?.unsubscribe();
  }
}
