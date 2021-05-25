import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TreeNode } from '@circlon/angular-tree-component';
import { of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { FileState, FileStore } from '~front/app/stores/file.store';
import { NavState } from '~front/app/stores/nav.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { UiStore } from '~front/app/stores/ui.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-repo-options',
  templateUrl: './repo-options.component.html'
})
export class RepoOptionsComponent implements OnDestroy {
  @Input()
  node: TreeNode;

  menuId = 'repoOptions';

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isRepoOptionsMenuOpen = false;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  file: FileState;
  file$ = this.fileQuery.select().pipe(
    tap(x => {
      this.file = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public uiQuery: UiQuery,
    public fileQuery: FileQuery,
    public uiStore: UiStore,
    public repoStore: RepoStore,
    public fileStore: FileStore,
    public navQuery: NavQuery,
    private authService: AuthService,
    private router: Router,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private myDialogService: MyDialogService,
    private apiService: ApiService
  ) {}

  openMenu() {
    this.isRepoOptionsMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }
    this.isRepoOptionsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu(event?: MouseEvent) {
    event.stopPropagation();
    if (this.isRepoOptionsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  revertToLastCommit(event?: MouseEvent) {
    event.stopPropagation();

    this.closeMenu();

    let payload: apiToBackend.ToBackendRevertRepoToLastCommitRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId
    };

    let getFilePayload: apiToBackend.ToBackendGetFileRequestPayload;

    let fileId = this.file.fileId;
    let fileName: string;

    if (common.isDefined(fileId)) {
      let fileIdArr = fileId.split(common.TRIPLE_UNDERSCORE);
      fileName = fileIdArr[fileIdArr.length - 1];

      getFilePayload = {
        projectId: this.nav.projectId,
        isRepoProd: this.nav.isRepoProd,
        branchId: this.nav.branchId,
        fileNodeId:
          this.nav.projectId +
          '/' +
          fileId.split(common.TRIPLE_UNDERSCORE).join('/')
      };
    }

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendRevertRepoToLastCommit,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendRevertRepoToLastCommitResponse) => {
          this.repoStore.update(resp.payload.repo);
        }),
        switchMap(x =>
          common.isDefined(fileId)
            ? this.apiService
                .req(
                  apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetFile,
                  getFilePayload
                )
                .pipe(
                  map((resp: apiToBackend.ToBackendGetFileResponse) => {
                    this.repoStore.update(resp.payload.repo);
                    this.fileStore.update({
                      content: resp.payload.content,
                      name: fileName,
                      fileId: fileId
                    });
                  })
                )
            : of([])
        ),
        take(1)
      )
      .subscribe();
  }

  revertToProduction(event?: MouseEvent) {
    event.stopPropagation();
    // this.myDialogService.showDeleteFile({
    //   apiService: this.apiService,
    //   projectId: this.nav.projectId,
    //   branchId: this.nav.branchId,
    //   fileNodeId: node.data.id,
    //   fileName: node.data.name
    // });
    this.closeMenu();
  }

  ngOnDestroy() {
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}
