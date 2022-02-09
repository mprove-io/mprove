import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { TreeNode } from '@circlon/angular-tree-component';
import { take, tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { FileState, FileStore } from '~front/app/stores/file.store';
import { NavState } from '~front/app/stores/nav.store';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-repo-options',
  templateUrl: './repo-options.component.html'
})
export class RepoOptionsComponent {
  @Input()
  node: TreeNode;

  repoStatusNeedCommit = common.RepoStatusEnum.NeedCommit;

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

  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public uiQuery: UiQuery,
    public fileQuery: FileQuery,
    public repoStore: RepoStore,
    public fileStore: FileStore,
    public repoQuery: RepoQuery,
    public fileService: FileService,
    public navQuery: NavQuery,
    private navigateService: NavigateService,
    public structStore: StructStore,
    private cd: ChangeDetectorRef,
    private apiService: ApiService
  ) {}

  revertToLastCommit(event?: MouseEvent) {
    event.stopPropagation();

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
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);

            this.navigateService.navigateToFiles();
          }
        }),
        // switchMap(x =>
        //   common.isDefined(this.file.fileId)
        //     ? this.fileService.getFile()
        //     : of([])
        // ),
        take(1)
      )
      .subscribe();
  }

  revertToProduction(event?: MouseEvent) {
    event.stopPropagation();

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
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);

            this.navigateService.navigateToFiles();
          }
        }),
        // switchMap(x =>
        //   common.isDefined(this.file.fileId)
        //     ? this.fileService.getFile()
        //     : of([])
        // ),
        take(1)
      )
      .subscribe();
  }

  pullFromProduction(event?: MouseEvent) {
    event.stopPropagation();

    let payload: apiToBackend.ToBackendPullRepoRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId
    };

    this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPullRepo, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendPullRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);

            this.navigateService.navigateToFiles();
          }
        }),
        // switchMap(x =>
        //   common.isDefined(this.file.fileId)
        //     ? this.fileService.getFile()
        //     : of([])
        // ),
        take(1)
      )
      .subscribe();
  }
}
