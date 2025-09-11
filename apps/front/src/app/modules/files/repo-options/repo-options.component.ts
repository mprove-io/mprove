import { TreeNode } from '@ali-hm/angular-tree-component';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { PanelEnum } from '~common/enums/panel.enum';
import { RepoStatusEnum } from '~common/enums/repo-status.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendValidateFilesRequestPayload,
  ToBackendValidateFilesResponse
} from '~common/interfaces/to-backend/files/to-backend-validate-files';
import {
  ToBackendGetRepoRequestPayload,
  ToBackendGetRepoResponse
} from '~common/interfaces/to-backend/repos/to-backend-get-repo';
import {
  ToBackendPullRepoRequestPayload,
  ToBackendPullRepoResponse
} from '~common/interfaces/to-backend/repos/to-backend-pull-repo';
import {
  ToBackendRevertRepoToLastCommitRequestPayload,
  ToBackendRevertRepoToLastCommitResponse
} from '~common/interfaces/to-backend/repos/to-backend-revert-repo-to-last-commit';
import {
  ToBackendRevertRepoToRemoteRequestPayload,
  ToBackendRevertRepoToRemoteResponse
} from '~common/interfaces/to-backend/repos/to-backend-revert-repo-to-remote';
import { FileQuery, FileState } from '~front/app/queries/file.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-repo-options',
  templateUrl: './repo-options.component.html'
})
export class RepoOptionsComponent {
  @Input()
  node: TreeNode;

  repoStatusNeedCommit = RepoStatusEnum.NeedCommit;

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

  panel = PanelEnum.Tree;
  panel$ = this.uiQuery.panel$.pipe(tap(x => (this.panel = x)));

  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private fileQuery: FileQuery,
    private repoQuery: RepoQuery,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private fileService: FileService,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService
  ) {}

  revertToLastCommit(event?: MouseEvent) {
    event.stopPropagation();

    let payload: ToBackendRevertRepoToLastCommitRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.spinner.show(APP_SPINNER_NAME);

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendRevertRepoToLastCommit,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendRevertRepoToLastCommitResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && isDefined(this.file.fileId)
            ? this.fileService.getFile({
                fileId: this.file.fileId,
                panel: this.panel
              })
            : of([])
        ),
        tap(x => {
          this.spinner.hide(APP_SPINNER_NAME);
          this.fileService.refreshSecondFile();
        }),
        take(1)
      )
      .subscribe();
  }

  revertToRemote(event?: MouseEvent) {
    event.stopPropagation();

    let payload: ToBackendRevertRepoToRemoteRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.spinner.show(APP_SPINNER_NAME);

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendRevertRepoToRemote,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendRevertRepoToRemoteResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && isDefined(this.file.fileId)
            ? this.fileService.getFile({
                fileId: this.file.fileId,
                panel: this.panel
              })
            : of([])
        ),
        tap(x => {
          this.spinner.hide(APP_SPINNER_NAME);
          this.fileService.refreshSecondFile();
        }),
        take(1)
      )
      .subscribe();
  }

  gitFetch(event?: MouseEvent) {
    event.stopPropagation();

    let payload: ToBackendGetRepoRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isFetch: true
    };

    this.spinner.show(APP_SPINNER_NAME);

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetRepo,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetRepoResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && isDefined(this.file.fileId)
            ? this.fileService.getFile({
                fileId: this.file.fileId,
                panel: this.panel
              })
            : of([])
        ),
        tap(x => {
          this.spinner.hide(APP_SPINNER_NAME);
          this.fileService.refreshSecondFile();
        }),
        take(1)
      )
      .subscribe();
  }

  pullFromRemote(event?: MouseEvent) {
    event.stopPropagation();

    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendPullRepoRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendPullRepo,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendPullRepoResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && isDefined(this.file.fileId)
            ? this.fileService.getFile({
                fileId: this.file.fileId,
                panel: this.panel
              })
            : of([])
        ),
        tap(x => {
          this.spinner.hide(APP_SPINNER_NAME);
          this.fileService.refreshSecondFile();
        }),
        take(1)
      )
      .subscribe();
  }

  validate(event?: MouseEvent) {
    event.stopPropagation();

    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendValidateFilesRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendValidateFiles,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendValidateFilesResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            return true;
          } else {
            return false;
          }
        }),
        switchMap(x =>
          x === true && isDefined(this.file.fileId)
            ? this.fileService.getFile({
                fileId: this.file.fileId,
                panel: this.panel
              })
            : of([])
        ),
        tap(x => {
          this.spinner.hide(APP_SPINNER_NAME);
          // this.fileService.refreshSecondFile();
          this.uiQuery.updatePart({ secondFileNodeId: undefined });
        }),
        take(1)
      )
      .subscribe();
  }
}
