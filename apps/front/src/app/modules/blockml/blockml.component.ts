import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { FileState } from '~front/app/stores/file.store';
import { NavState } from '~front/app/stores/nav.store';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-blockml',
  templateUrl: './blockml.component.html'
})
export class BlockmlComponent implements OnInit {
  repoStatusNeedCommit = common.RepoStatusEnum.NeedCommit;
  repoStatusNeedPush = common.RepoStatusEnum.NeedPush;
  repoStatusNeedPull = common.RepoStatusEnum.NeedPull;

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

  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.cd.detectChanges();
    })
  );

  pathBlockml = common.PATH_BLOCKML;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('/');
      this.lastUrl = ar[ar.length - 1];
      this.cd.detectChanges();
    })
  );

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private fileQuery: FileQuery,
    public repoQuery: RepoQuery,
    public repoStore: RepoStore,
    private apiService: ApiService,
    public fileService: FileService
  ) {}

  ngOnInit() {
    let ar = this.router.url.split('/');
    this.lastUrl = ar[ar.length - 1];
  }

  commit() {
    let payload: apiToBackend.ToBackendCommitRepoRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      commitMessage: 'withoutMessage'
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCommitRepo,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCommitRepoResponse) => {
          this.repoStore.update(resp.payload.repo);
        }),
        take(1)
      )
      .subscribe();
  }

  push() {
    let payload: apiToBackend.ToBackendPushRepoRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId
    };

    this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPushRepo, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendPushRepoResponse) => {
          this.repoStore.update(resp.payload.repo);
        }),
        take(1)
      )
      .subscribe();
  }

  pull() {
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
}
