import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { FileState } from '~front/app/stores/file.store';
import { NavState } from '~front/app/stores/nav.store';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { UserState } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-files',
  templateUrl: './files.component.html'
})
export class FilesComponent implements OnInit {
  pageTitle = constants.FILES_PAGE_TITLE;

  repoStatusNeedCommit = common.RepoStatusEnum.NeedCommit;
  repoStatusNeedResolve = common.RepoStatusEnum.NeedResolve;
  repoStatusNeedPull = common.RepoStatusEnum.NeedPull;
  repoStatusNeedPush = common.RepoStatusEnum.NeedPush;
  repoStatusOk = common.RepoStatusEnum.Ok;

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

  pathFiles = common.PATH_FILES;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('/');
      this.lastUrl = ar[ar.length - 1];
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
      this.cd.detectChanges();
    })
  );

  user: UserState;
  user$ = this.userQuery.select().pipe(
    tap(x => {
      this.user = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private fileQuery: FileQuery,
    public repoQuery: RepoQuery,
    public repoStore: RepoStore,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    public structStore: StructStore,
    public fileService: FileService,
    private title: Title,
    private memberQuery: MemberQuery,
    private userQuery: UserQuery
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let ar = this.router.url.split('/');
    this.lastUrl = ar[ar.length - 1];
  }

  commit() {
    this.myDialogService.showCommit({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId
    });
  }

  push() {
    let payload: apiToBackend.ToBackendPushRepoRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId
    };

    this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPushRepo, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendPushRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  pull() {
    let payload: apiToBackend.ToBackendPullRepoRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId
    };

    this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPullRepo, payload)
      .pipe(
        tap((resp: apiToBackend.ToBackendPullRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoStore.update(resp.payload.repo);
            this.structStore.update(resp.payload.struct);
          }
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
