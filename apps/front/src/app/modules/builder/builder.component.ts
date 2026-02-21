import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { of } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { BUILDER_PAGE_TITLE } from '#common/constants/page-titles';
import {
  PATH_NEW_SESSION,
  PATH_SELECT_FILE,
  PATH_SESSION
} from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { BuilderRightEnum } from '#common/enums/builder-right.enum';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendGetRepoRequestPayload,
  ToBackendGetRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-get-repo';
import {
  ToBackendPullRepoRequestPayload,
  ToBackendPullRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-pull-repo';
import {
  ToBackendPushRepoRequestPayload,
  ToBackendPushRepoResponse
} from '#common/interfaces/to-backend/repos/to-backend-push-repo';
import { FileQuery, FileState } from '#front/app/queries/file.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionDataQuery } from '#front/app/queries/session-data.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery, UserState } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { FileService } from '#front/app/services/file.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-builder',
  templateUrl: './builder.component.html'
})
export class BuilderComponent implements OnInit {
  pageTitle = BUILDER_PAGE_TITLE;

  builderLeftTree = BuilderLeftEnum.Tree;
  builderLeftChangesToCommit = BuilderLeftEnum.ChangesToCommit;
  builderLeftChangesToPush = BuilderLeftEnum.ChangesToPush;

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

  pathNewSession = PATH_NEW_SESSION;
  pathSelectFile = PATH_SELECT_FILE;

  lastUrl: string;
  isSessionRoute = false;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('?')[0].split('/');
      this.lastUrl = ar[ar.length - 1];

      let wasSessionRoute = this.isSessionRoute;

      this.isSessionRoute = ar.includes(PATH_SESSION);

      if (wasSessionRoute && !this.isSessionRoute) {
        this.sessionQuery.reset();
        this.sessionDataQuery.reset();
        this.sessionEventsQuery.reset();
      }

      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  builderLeft = BuilderLeftEnum.Tree;
  builderLeft$ = this.uiQuery.builderLeft$.pipe(
    tap(x => (this.builderLeft = x))
  );

  builderRight = BuilderRightEnum.Sessions;
  builderRight$ = this.uiQuery.builderRight$.pipe(
    tap(x => {
      this.builderRight = x;
      this.cd.detectChanges();
    })
  );

  showFilesLeftPanel = true;
  showFilesLeftPanel$ = this.uiQuery.showFilesLeftPanel$.pipe(
    tap(x => {
      this.showFilesLeftPanel = x;
      this.cd.detectChanges();
    })
  );

  showFilesRightPanel = true;
  showFilesRightPanel$ = this.uiQuery.showFilesRightPanel$.pipe(
    tap(x => {
      this.showFilesRightPanel = x;
      this.cd.detectChanges();
    })
  );

  builderRightSessions = BuilderRightEnum.Sessions;
  builderRightValidation = BuilderRightEnum.Validation;

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

  debugMode = false;
  debugMode$ = this.uiQuery.sessionDebugMode$.pipe(
    tap(x => {
      this.debugMode = x;
      this.cd.detectChanges();
    })
  );

  sessionId: string;
  sessionId$ = this.sessionQuery.select().pipe(
    tap(x => {
      this.sessionId = x?.sessionId;
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
    private location: Location,
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
    private userQuery: UserQuery,
    private sessionQuery: SessionQuery,
    private sessionDataQuery: SessionDataQuery,
    private sessionEventsQuery: SessionEventsQuery
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let ar = this.router.url.split('?')[0].split('/');
    this.lastUrl = ar[ar.length - 1];
    this.isSessionRoute = ar.includes(PATH_SESSION);

    let urlTree = this.router.parseUrl(this.router.url);
    let left: BuilderLeftEnum = urlTree.queryParams['left'];
    let right: BuilderRightEnum = urlTree.queryParams['right'];

    if (isDefined(left)) {
      this.uiQuery.updatePart({ builderLeft: left });
    }
    if (isDefined(right)) {
      this.uiQuery.updatePart({ builderRight: right });
    }
  }

  get isBaseRoute() {
    return (
      this.lastUrl === this.pathNewSession ||
      this.lastUrl === this.pathSelectFile
    );
  }

  get isRightPanelVisible() {
    return (
      this.showFilesRightPanel &&
      !this.secondFileNodeId &&
      (this.builderLeft === BuilderLeftEnum.Tree ||
        this.isBaseRoute ||
        !this.file?.fileId)
    );
  }

  toggleShowLeft() {
    this.showFilesLeftPanel = !this.showFilesLeftPanel;

    this.uiQuery.updatePart({
      showFilesLeftPanel: this.showFilesLeftPanel
    });
    this.uiService.setUserUi({
      showFilesLeftPanel: this.showFilesLeftPanel
    });
  }

  toggleShowRight() {
    this.showFilesRightPanel = !this.showFilesRightPanel;

    this.uiQuery.updatePart({
      showFilesRightPanel: this.showFilesRightPanel
    });
    this.uiService.setUserUi({
      showFilesRightPanel: this.showFilesRightPanel
    });
  }

  toggleBothPanels() {
    let show = !(this.showFilesLeftPanel && this.showFilesRightPanel);

    this.showFilesLeftPanel = show;
    this.showFilesRightPanel = show;

    this.uiQuery.updatePart({
      showFilesLeftPanel: show,
      showFilesRightPanel: show
    });
    this.uiService.setUserUi({
      showFilesLeftPanel: show,
      showFilesRightPanel: show
    });
  }

  setBuilderRight(tab: BuilderRightEnum) {
    if (this.showFilesRightPanel === false) {
      this.showFilesRightPanel = true;
      this.uiQuery.updatePart({ showFilesRightPanel: true });
      this.uiService.setUserUi({ showFilesRightPanel: true });
    }

    if (this.secondFileNodeId) {
      this.uiQuery.updatePart({ secondFileNodeId: undefined });
    }

    if (tab === this.builderRight) {
      return;
    }

    this.uiQuery.updatePart({ builderRight: tab });

    let urlTree = this.router.parseUrl(this.router.url);
    urlTree.queryParams['right'] = tab;
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }

  setBuilderLeft(x: BuilderLeftEnum) {
    if (this.needSave === true) {
      return;
    }

    if (this.showFilesLeftPanel === false) {
      this.showFilesLeftPanel = true;
      this.uiQuery.updatePart({ showFilesLeftPanel: true });
      this.uiService.setUserUi({ showFilesLeftPanel: true });
    }

    if (x === this.builderLeft) {
      return;
    }

    let prevLeft = this.builderLeft;

    this.uiQuery.updatePart({ builderLeft: x });

    let isFromChanges =
      prevLeft === BuilderLeftEnum.ChangesToCommit ||
      prevLeft === BuilderLeftEnum.ChangesToPush;

    if (
      x === BuilderLeftEnum.Tree &&
      isFromChanges &&
      !this.isBaseRoute &&
      !this.isSessionRoute
    ) {
      let pLink = this.uiQuery
        .getValue()
        .projectSessionLinks.find(
          link => link.projectId === this.nav.projectId
        );

      if (isDefined(pLink?.sessionId)) {
        this.navigateService.navigateToSession({
          sessionId: pLink.sessionId,
          left: x
        });
      } else {
        this.navigateService.navigateToBuilder({ left: x });
      }
    } else if (
      x === BuilderLeftEnum.Tree ||
      this.isSessionRoute ||
      this.isBaseRoute
    ) {
      let urlTree = this.router.parseUrl(this.router.url);
      urlTree.queryParams['left'] = x;
      this.location.replaceState(this.router.serializeUrl(urlTree));
    } else {
      this.navigateService.navigateToBuilder({ left: x });
    }
  }

  toggleDebug() {
    this.uiQuery.updatePart({ sessionDebugMode: !this.debugMode });
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
      builderLeft: this.builderLeft,
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
}
