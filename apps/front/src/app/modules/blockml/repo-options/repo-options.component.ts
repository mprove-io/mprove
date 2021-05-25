import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TreeNode } from '@circlon/angular-tree-component';
import { of } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { FileService } from '~front/app/services/file.service';
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

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  constructor(
    public uiQuery: UiQuery,
    public fileQuery: FileQuery,
    public uiStore: UiStore,
    public repoStore: RepoStore,
    public fileStore: FileStore,
    public fileService: FileService,
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
          common.isDefined(this.file.fileId)
            ? this.fileService.getFile()
            : of([])
        ),
        take(1)
      )
      .subscribe();
  }

  revertToProduction(event?: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    let payload: apiToBackend.ToBackendRevertRepoToProductionRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum
          .ToBackendRevertRepoToProduction,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendRevertRepoToProductionResponse) => {
          this.repoStore.update(resp.payload.repo);
        }),
        switchMap(x =>
          common.isDefined(this.file.fileId)
            ? this.fileService.getFile()
            : of([])
        ),
        take(1)
      )
      .subscribe();
  }

  pullFromProduction(event?: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    let payload: apiToBackend.ToBackendPullRepoRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId
    };

    this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPullRepo, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendPullRepoResponse) => {
          this.repoStore.update(resp.payload.repo);
        }),
        switchMap(x =>
          common.isDefined(this.file.fileId)
            ? this.fileService.getFile()
            : of([])
        ),
        take(1)
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}
