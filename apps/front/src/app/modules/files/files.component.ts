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
import { NavigateService } from '~front/app/services/navigate.service';
import { UiService } from '~front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-files',
  templateUrl: './files.component.html'
})
export class FilesComponent implements OnInit {
  pageTitle = FILES_PAGE_TITLE;

  panelTree = PanelEnum.Tree;
  panelChangesToCommit = PanelEnum.ChangesToCommit;
  panelChangesToPush = PanelEnum.ChangesToPush;

  repoStatusNeedCommit = RepoStatusEnum.NeedCommit;
  repoStatusNeedPull = RepoStatusEnum.NeedPull;
  repoStatusNeedPush = RepoStatusEnum.NeedPush;
  repoStatusOk = RepoStatusEnum.Ok;

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

      this.uiService.setProjectFileLink();
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

  pathFiles = PATH_FILES;

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

  panel = PanelEnum.Tree;
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

  secondFileNodeId: string;
  secondFileNodeId$ = this.uiQuery.secondFileNodeId$.pipe(
    tap(x => {
      this.secondFileNodeId = x;
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
    private navigateService: NavigateService,
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

  setPanel(x: PanelEnum) {
    if (this.needSave === true) {
      return;
    }

    if (x === this.panel) {
      return;
    }

    if (x === PanelEnum.Tree) {
      let fileIds = getFileIds({ nodes: this.repo.nodes });

      let projectFileLinks = this.uiQuery.getValue().projectFileLinks;

      let pLink = projectFileLinks.find(
        link => link.projectId === this.nav.projectId
      );

      if (isUndefined(pLink)) {
        this.navigateService.navigateToFiles();
      } else {
        let pFileId = fileIds.find(fileId => fileId === pLink.fileId);

        if (isDefined(pFileId)) {
          this.navigateService.navigateToFileLine({
            panel: PanelEnum.Tree,
            encodedFileId: pFileId
          });
        } else {
          this.navigateService.navigateToFiles();
        }
      }
    } else {
      this.navigateService.navigateToFiles();
    }

    this.uiQuery.updatePart({ panel: x });
  }

  newFile() {
    this.myDialogService.showNewFile({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId
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
    let payload: ToBackendPushRepoRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.spinner.show(APP_SPINNER_NAME);

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendPushRepo,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendPushRepoResponse) => {
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
        tap(x => this.spinner.hide(APP_SPINNER_NAME)),
        take(1)
      )
      .subscribe();
  }

  pull() {
    let payload: ToBackendPullRepoRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.spinner.show(APP_SPINNER_NAME);

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
        tap(x => this.spinner.hide(APP_SPINNER_NAME)),
        take(1)
      )
      .subscribe();
  }

  refresh() {
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
        tap(x => this.spinner.hide(APP_SPINNER_NAME)),
        take(1)
      )
      .subscribe();
  }
}
