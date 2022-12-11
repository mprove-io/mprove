import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { TreeNode } from '@bugsplat/angular-tree-component';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { FileState, FileStore } from '~front/app/stores/file.store';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { UiStore } from '~front/app/stores/ui.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

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

  panel = common.PanelEnum.Tree;
  panel$ = this.uiQuery.panel$.pipe(tap(x => (this.panel = x)));

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
    public navStore: NavStore,
    public uiStore: UiStore,
    public fileStore: FileStore,
    public repoQuery: RepoQuery,
    public fileService: FileService,
    private spinner: NgxSpinnerService,
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
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.spinner.show(constants.APP_SPINNER_NAME);

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum
            .ToBackendRevertRepoToLastCommit,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendRevertRepoToLastCommitResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && common.isDefined(this.file.fileId)
            ? this.fileService.getFile({
                fileId: this.file.fileId,
                panel: this.panel
              })
            : of([])
        ),
        tap(x => this.spinner.hide(constants.APP_SPINNER_NAME)),
        take(1)
      )
      .subscribe();
  }

  revertToRemote(event?: MouseEvent) {
    event.stopPropagation();

    let payload: apiToBackend.ToBackendRevertRepoToRemoteRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.spinner.show(constants.APP_SPINNER_NAME);

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRevertRepoToRemote,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendRevertRepoToRemoteResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && common.isDefined(this.file.fileId)
            ? this.fileService.getFile({
                fileId: this.file.fileId,
                panel: this.panel
              })
            : of([])
        ),
        tap(x => this.spinner.hide(constants.APP_SPINNER_NAME)),
        take(1)
      )
      .subscribe();
  }

  gitFetch(event?: MouseEvent) {
    event.stopPropagation();

    let payload: apiToBackend.ToBackendGetRepoRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isFetch: true
    };

    this.spinner.show(constants.APP_SPINNER_NAME);

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetRepo,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && common.isDefined(this.file.fileId)
            ? this.fileService.getFile({
                fileId: this.file.fileId,
                panel: this.panel
              })
            : of([])
        ),
        tap(x => this.spinner.hide(constants.APP_SPINNER_NAME)),
        take(1)
      )
      .subscribe();
  }

  pullFromRemote(event?: MouseEvent) {
    event.stopPropagation();

    this.spinner.show(constants.APP_SPINNER_NAME);

    let payload: apiToBackend.ToBackendPullRepoRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPullRepo,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendPullRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && common.isDefined(this.file.fileId)
            ? this.fileService.getFile({
                fileId: this.file.fileId,
                panel: this.panel
              })
            : of([])
        ),
        tap(x => this.spinner.hide(constants.APP_SPINNER_NAME)),
        take(1)
      )
      .subscribe();
  }

  validate(event?: MouseEvent) {
    event.stopPropagation();

    this.spinner.show(constants.APP_SPINNER_NAME);

    let payload: apiToBackend.ToBackendValidateFilesRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendValidateFiles,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendValidateFilesResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
            this.navStore.update(state =>
              Object.assign({}, state, <NavState>{
                needValidate: resp.payload.needValidate
              })
            );

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && common.isDefined(this.file.fileId)
            ? this.fileService.getFile({
                fileId: this.file.fileId,
                panel: this.panel
              })
            : of([])
        ),
        tap(x => this.spinner.hide(constants.APP_SPINNER_NAME)),
        take(1)
      )
      .subscribe();
  }
}
