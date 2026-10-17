import { TreeNode } from '@ali-hm/angular-tree-component';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendValidateFilesOutput } from '#common/types/backend/routes/files/validate-files/validate-files-output';
import type { ToBackendValidateFilesRequest } from '#common/types/backend/routes/files/validate-files/validate-files-request';
import type { ToBackendGetRepoOutput } from '#common/types/backend/routes/repos/get-repo/get-repo-output';
import type { ToBackendGetRepoRequest } from '#common/types/backend/routes/repos/get-repo/get-repo-request';
import type { ToBackendPullRepoOutput } from '#common/types/backend/routes/repos/pull-repo/pull-repo-output';
import type { ToBackendPullRepoRequest } from '#common/types/backend/routes/repos/pull-repo/pull-repo-request';
import type { ToBackendRevertRepoToLastCommitOutput } from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-output';
import type { ToBackendRevertRepoToLastCommitRequest } from '#common/types/backend/routes/repos/revert-repo-to-last-commit/revert-repo-to-last-commit-request';
import type { ToBackendRevertRepoToRemoteOutput } from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-output';
import type { ToBackendRevertRepoToRemoteRequest } from '#common/types/backend/routes/repos/revert-repo-to-remote/revert-repo-to-remote-request';
import type { RepoStatus } from '#common/types/disk/parts/repo/repo-status';
import type { BuilderLeft } from '#common/types/front/builder/builder-left';
import { FileQuery, FileState } from '#front/app/queries/file.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { StructQuery } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { FileService } from '#front/app/services/file.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SpinnerService } from '#front/app/services/spinner.service';

@Component({
  standalone: false,
  selector: 'm-repo-options',
  templateUrl: './repo-options.component.html'
})
export class RepoOptionsComponent {
  @Input()
  node: TreeNode;

  repoStatusNeedCommit: RepoStatus = 'NeedCommit';

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

  builderLeft: BuilderLeft = 'Tree';
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
    private spinnerService: SpinnerService,
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

    this.apiService
      .req({
        route: 'api/ToBackendRevertRepoToLastCommit',
        payload: payload
      })
      .pipe(
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendRevertRepoToLastCommitOutput = resp.output;

            this.repoQuery.update(output.repo);
            this.structQuery.update(output.struct);
            this.navQuery.updatePart({
              needValidate: output.needValidate
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
          this.fileService.refreshSecondFile();
        }),
        take(1),
        this.spinnerService.appTrack()
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

    this.apiService
      .req({
        route: 'api/ToBackendRevertRepoToRemote',
        payload: payload
      })
      .pipe(
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendRevertRepoToRemoteOutput = resp.output;

            this.repoQuery.update(output.repo);
            this.structQuery.update(output.struct);
            this.navQuery.updatePart({
              needValidate: output.needValidate
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
          this.fileService.refreshSecondFile();
        }),
        take(1),
        this.spinnerService.appTrack()
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

    this.apiService
      .req({
        route: 'api/ToBackendGetRepo',
        payload: payload
      })
      .pipe(
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendGetRepoOutput = resp.output;

            this.repoQuery.update(output.repo);
            this.structQuery.update(output.struct);
            this.navQuery.updatePart({
              needValidate: output.needValidate
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
          this.fileService.refreshSecondFile();
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  pullFromRemote(event?: MouseEvent) {
    event.stopPropagation();

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
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendPullRepoOutput = resp.output;

            this.repoQuery.update(output.repo);
            this.structQuery.update(output.struct);
            this.navQuery.updatePart({
              needValidate: output.needValidate
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
          this.fileService.refreshSecondFile();
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  validate(event?: MouseEvent) {
    event.stopPropagation();

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
        map(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendValidateFilesOutput = resp.output;

            this.repoQuery.update(output.repo);
            this.structQuery.update(output.struct);
            this.navQuery.updatePart({
              needValidate: output.needValidate
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
          this.uiQuery.updatePart({ secondFileNodeId: undefined });
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }
}
