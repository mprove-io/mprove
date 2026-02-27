import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@ali-hm/angular-tree-component';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import uFuzzy from '@leeoniya/ufuzzy';
import { Subscription } from 'rxjs';
import { finalize, take, tap } from 'rxjs/operators';
import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  PATH_BRANCH,
  PATH_BUILDER,
  PATH_ENV,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PATH_SELECT_FILE
} from '#common/constants/top';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { decodeFilePath } from '#common/functions/decode-file-path';
import { encodeFilePath } from '#common/functions/encode-file-path';
import { getFileItems } from '#common/functions/get-file-items';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { DiskCatalogNode } from '#common/interfaces/disk/disk-catalog-node';
import { FileItem } from '#common/interfaces/file-item';
import {
  ToBackendMoveCatalogNodeRequestPayload,
  ToBackendMoveCatalogNodeResponse
} from '#common/interfaces/to-backend/catalogs/to-backend-move-catalog-node';
import { FileQuery, FileState } from '#front/app/queries/file.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { ProjectQuery } from '#front/app/queries/project.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-builder-left',
  templateUrl: './builder-left.component.html',
  styleUrls: ['builder-left.component.scss']
})
export class BuilderLeftComponent implements OnDestroy {
  @Input()
  builderLeft: BuilderLeftEnum;

  @Input()
  isEditor: boolean;

  @Output()
  newFileClick = new EventEmitter<void>();

  repoTypeEnum = RepoTypeEnum;

  builderLeftTree = BuilderLeftEnum.Tree;
  builderLeftChangesToCommit = BuilderLeftEnum.ChangesToCommit;
  builderLeftChangesToPush = BuilderLeftEnum.ChangesToPush;
  builderLeftInfo = BuilderLeftEnum.Info;

  repoStatusNeedPush = RepoStatusEnum.NeedPush;

  topNodes: DiskCatalogNode[] = [];

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
    mouse: {}
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'name',
    allowDrag: (node: TreeNode) =>
      this.nav?.repoType !== RepoTypeEnum.Prod &&
      node.data.id !== this.nav.projectId,
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

  secondFileNodeId: string;
  secondFileNodeId$ = this.uiQuery.secondFileNodeId$.pipe(
    tap(x => (this.secondFileNodeId = x))
  );

  fileNodeId: string;
  fileId: string;

  file: FileState;
  file$ = this.fileQuery.select().pipe(
    tap(x => {
      this.file = x;

      this.fileId = x.fileId;

      if (isUndefined(x.fileId)) {
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

      let filePath = decodeFilePath({ filePath: x.fileId });

      let fIdAr = filePath.split('/');

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

  filteredFileItems: FileItem[] = [];

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

    let mproveDirValue = this.struct.mproveConfig.mproveDirValue;

    if (
      isUndefined(mproveDirValue) ||
      mproveDirValue === MPROVE_CONFIG_DIR_DOT_SLASH
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
            this.builderLeft === BuilderLeftEnum.Tree &&
            isDefined(x.fileId) &&
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

            let filePath = decodeFilePath({ filePath: x.fileId });

            filePath.split('/').forEach(part => {
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
      builderLeft: BuilderLeftEnum.ChangesToCommit,
      encodedFileId: fileId
    });
  }

  changeToPushOnClick(fileId: string) {
    this.navigateService.navigateToFileLine({
      builderLeft: BuilderLeftEnum.ChangesToPush,
      encodedFileId: fileId
    });
  }

  fileItemOnClick(fileId: string) {
    this.navigateService.navigateToFileLine({
      builderLeft: BuilderLeftEnum.Tree,
      encodedFileId: fileId
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
        builderLeft: BuilderLeftEnum.Tree,
        encodedFileId: node.data.fileId
      });
    }
  }

  onMoveNode(event: any) {
    this.cd.detach();

    let nameArray = event.to.parent.id.split('/');
    if (nameArray.length > 1) {
      nameArray.pop();
    }

    let parentId = event.to.parent.isFolder
      ? event.to.parent.id
      : nameArray.join('/');

    this.itemsTree.treeModel.getNodeById(parentId).expand();

    let fromNodeId = event.node.id;
    let toNodeId = parentId + '/' + event.node.name;

    let payload: ToBackendMoveCatalogNodeRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fromNodeId: fromNodeId,
      toNodeId: toNodeId
    };

    let isMoveSuccess = false;
    let newFileId: string;

    if (isDefined(this.fileId)) {
      let selectedPath = decodeFilePath({ filePath: this.fileId });

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

        let newPath = isDefinedAndNotEmpty(relativePath)
          ? `${toPath}/${relativePath}`
          : toPath;

        newFileId = encodeFilePath({ filePath: newPath });
      }
    }

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendMoveCatalogNode,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendMoveCatalogNodeResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            isMoveSuccess = true;

            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            if (isDefined(newFileId)) {
              this.navigateService.navigateToFileLine({
                builderLeft: BuilderLeftEnum.Tree,
                encodedFileId: newFileId
              });
            }
          }
        }),
        take(1),
        finalize(() => {
          this.cd.reattach();

          if (isMoveSuccess === false) {
            let arStart = [
              PATH_ORG,
              this.nav.orgId,
              PATH_PROJECT,
              this.nav.projectId,
              PATH_REPO,
              this.nav.repoId,
              PATH_BRANCH,
              this.nav.branchId,
              PATH_ENV,
              this.nav.envId,
              PATH_BUILDER
            ];

            let arStartStr = arStart.join('/');

            let arNext = [...arStart, PATH_SELECT_FILE];

            this.router
              .navigateByUrl(arStartStr, { skipLocationChange: true })
              .then(() => {
                this.router.navigate(arNext, {
                  queryParams: {
                    left: BuilderLeftEnum.Tree
                  }
                });
              });
          }
        })
      )
      .subscribe();
  }

  makeFilteredFileItems() {
    let filteredFileItems = getFileItems({ nodes: this.repo.nodes });

    let idxs;

    if (isDefinedAndNotEmpty(this.word)) {
      let haystack = filteredFileItems.map(
        x => `${x.parentPath}/${x.fileName}`
      );
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.word);
    }

    filteredFileItems =
      idxs != null && idxs.length > 0
        ? idxs.map((idx: number): FileItem => filteredFileItems[idx])
        : [];

    this.filteredFileItems = filteredFileItems.sort((a, b) => {
      let aPath = `${a.parentPath}/${a.fileName}`;
      let bPath = `${b.parentPath}/${b.fileName}`;

      return aPath > bPath ? 1 : bPath > aPath ? -1 : 0;
    });
  }

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredFileItems();

      this.cd.detectChanges();
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredFileItems();

    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.expandLevel$?.unsubscribe();
  }
}
