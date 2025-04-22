import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { FileQuery, FileState } from '~front/app/queries/file.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery, UserState } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { UiService } from '~front/app/services/ui.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-files',
  templateUrl: './files.component.html'
})
export class FilesComponent implements OnInit {
  pageTitle = constants.FILES_PAGE_TITLE;

  panelTree = common.PanelEnum.Tree;
  panelChangesToCommit = common.PanelEnum.ChangesToCommit;
  panelChangesToPush = common.PanelEnum.ChangesToPush;

  repoStatusNeedCommit = common.RepoStatusEnum.NeedCommit;
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

      this.setProjectFileLink({
        fileId: this.file.fileId
      });
    })
  );

  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
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

  pathFiles = common.PATH_FILES;

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('?')[0].split('/');
      this.lastUrl = ar[ar.length - 1];
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  panel = common.PanelEnum.Tree;
  panel$ = this.uiQuery.panel$.pipe(tap(x => (this.panel = x)));

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
    private spinner: NgxSpinnerService,
    private repoQuery: RepoQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private uiService: UiService,
    private fileService: FileService,
    private title: Title,
    private memberQuery: MemberQuery,
    private structQuery: StructQuery,
    private userQuery: UserQuery
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let ar = this.router.url.split('?')[0].split('/');
    this.lastUrl = ar[ar.length - 1];
  }

  setPanel(x: common.PanelEnum) {
    if (this.needSave === true) {
      return;
    }

    let userId;
    this.userQuery.userId$
      .pipe(
        tap(y => (userId = y)),
        take(1)
      )
      .subscribe();

    let repoId = this.nav.isRepoProd === true ? common.PROD_REPO_ID : userId;

    this.router.navigate([
      common.PATH_ORG,
      this.nav.orgId,
      common.PATH_PROJECT,
      this.nav.projectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      this.nav.branchId,
      common.PATH_ENV,
      this.nav.envId,
      common.PATH_FILES
    ]);

    this.uiQuery.updatePart({ panel: x });
  }

  addFile() {
    let part = this.struct.mproveDirValue;

    part = part.startsWith('.') ? part.slice(1) : part;
    part = part.startsWith('/') ? part.slice(1) : part;
    part = part.endsWith('/') ? part.slice(0, -1) : part;

    let parentNodeId = [this.struct.projectId, part].join('/');

    this.myDialogService.showCreateFile({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      parentNodeId: parentNodeId
    });
  }

  commit() {
    this.myDialogService.showCommit({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      panel: this.panel,
      fileId: this.file.fileId
    });
  }

  push() {
    let payload: apiToBackend.ToBackendPushRepoRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.spinner.show(constants.APP_SPINNER_NAME);

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPushRepo,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendPushRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
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

  pull() {
    let payload: apiToBackend.ToBackendPullRepoRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.spinner.show(constants.APP_SPINNER_NAME);

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendPullRepo,
        payload: payload
      })
      .pipe(
        map((resp: apiToBackend.ToBackendPullRepoResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
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

  refresh() {
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

  setProjectFileLink(item: { fileId: string }) {
    let { fileId } = item;

    if (common.isUndefined(fileId)) {
      return;
    }

    let nav = this.navQuery.getValue();
    let links = this.uiQuery.getValue().projectFileLinks;

    let link: common.ProjectFileLink = links.find(
      l => l.projectId === nav.projectId
    );

    let newProjectFileLinks;

    if (common.isDefined(link)) {
      let newLink: common.ProjectFileLink = {
        projectId: nav.projectId,
        fileId: fileId,
        lastNavTs: Date.now()
      };

      newProjectFileLinks = [
        newLink,
        ...links.filter(r => !(r.projectId === nav.projectId))
      ];
    } else {
      let newLink: common.ProjectFileLink = {
        projectId: nav.projectId,
        fileId: fileId,
        lastNavTs: Date.now()
      };

      newProjectFileLinks = [newLink, ...links];
    }

    let oneYearAgoTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 365;

    newProjectFileLinks = newProjectFileLinks.filter(
      l => l.lastNavTs >= oneYearAgoTimestamp
    );

    this.uiQuery.updatePart({ projectFileLinks: newProjectFileLinks });
    this.uiService.setUserUi({ projectFileLinks: newProjectFileLinks });
  }
}
