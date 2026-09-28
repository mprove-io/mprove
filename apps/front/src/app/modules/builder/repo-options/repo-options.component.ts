import { TreeNode } from '@ali-hm/angular-tree-component';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendValidateFilesRequest } from '#common/zod/backend/routes/files/validate-files/validate-files-request';
import type { ToBackendValidateFilesResponse } from '#common/zod/backend/routes/files/validate-files/validate-files-response';
import type { ToBackendGetRepoRequest } from '#common/zod/backend/routes/repos/get-repo/get-repo-request';
import type { ToBackendGetRepoResponse } from '#common/zod/backend/routes/repos/get-repo/get-repo-response';
import type { ToBackendPullRepoRequest } from '#common/zod/backend/routes/repos/pull-repo/pull-repo-request';
import type { ToBackendPullRepoResponse } from '#common/zod/backend/routes/repos/pull-repo/pull-repo-response';
import type { ToBackendRevertRepoToLastCommitRequest } from '#common/zod/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import type { ToBackendRevertRepoToLastCommitResponse } from '#common/zod/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';
import type { ToBackendRevertRepoToRemoteRequest } from '#common/zod/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-request';
import type { ToBackendRevertRepoToRemoteResponse } from '#common/zod/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-response';
import type { RepoStatus } from '#common/zod/disk/repo-status';
import { FileQuery, FileState } from '#front/app/queries/file.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { FileService } from '#front/app/services/file.service';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-repo-options',
  templateUrl: './repo-options.component.html'
})
export class RepoOptionsComponent {
  @Input()
  node: TreeNode;

  repoStatusNeedCommit: RepoStatus = 'NeedCommit';
  repoTypeSession = RepoTypeEnum.Session;

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

  builderLeft = BuilderLeftEnum.Tree;
  builderLeft$ = this.uiQuery.builderLeft$.pipe(
    tap(x => (this.builderLeft = x))
  );

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

    let payload: ToBackendRevertRepoToLastCommitRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.spinner.show(APP_SPINNER_NAME);

    this.apiService
      .req({
        route: 'api/ToBackendRevertRepoToLastCommit',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendRevertRepoToLastCommitResponse) => {
          if (resp?.type === 'Success') {
            this.repoQuery.update(resp.output.repo);
            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
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
                builderLeft: this.builderLeft
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

    let payload: ToBackendRevertRepoToRemoteRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.spinner.show(APP_SPINNER_NAME);

    this.apiService
      .req({
        route: 'api/ToBackendRevertRepoToRemote',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendRevertRepoToRemoteResponse) => {
          if (resp?.type === 'Success') {
            this.repoQuery.update(resp.output.repo);
            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
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
                builderLeft: this.builderLeft
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

    let payload: ToBackendGetRepoRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isFetch: true
    };

    this.spinner.show(APP_SPINNER_NAME);

    this.apiService
      .req({
        route: 'api/ToBackendGetRepo',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetRepoResponse) => {
          if (resp?.type === 'Success') {
            this.repoQuery.update(resp.output.repo);
            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
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
                builderLeft: this.builderLeft
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

    let payload: ToBackendPullRepoRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.apiService
      .req({
        route: 'api/ToBackendPullRepo',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendPullRepoResponse) => {
          if (resp?.type === 'Success') {
            this.repoQuery.update(resp.output.repo);
            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
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
                builderLeft: this.builderLeft
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

    let payload: ToBackendValidateFilesRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.apiService
      .req({
        route: 'api/ToBackendValidateFiles',
        payload: payload
      })
      .pipe(
        map((resp: ToBackendValidateFilesResponse) => {
          if (resp?.type === 'Success') {
            this.repoQuery.update(resp.output.repo);
            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
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
                builderLeft: this.builderLeft
              })
            : of([])
        ),
        tap(x => {
          this.spinner.hide(APP_SPINNER_NAME);
          this.uiQuery.updatePart({ secondFileNodeId: undefined });
        }),
        take(1)
      )
      .subscribe();
  }
}
