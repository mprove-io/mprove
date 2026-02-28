import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { filter, take, tap } from 'rxjs/operators';
import {
  PATH_BRANCH,
  PATH_BUILDER,
  PATH_ENV,
  PATH_FILE,
  PATH_NEW_SESSION,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PATH_REPORTS,
  PATH_SELECT_FILE,
  PATH_SESSION,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { BranchItem } from '#common/interfaces/front/branch-item';
import {
  ToBackendGetBranchesListRequestPayload,
  ToBackendGetBranchesListResponse
} from '#common/interfaces/to-backend/branches/to-backend-get-branches-list';
import { checkNavMain } from '#front/app/functions/check-nav-main';
import { makeBranchExtraId } from '#front/app/functions/make-branch-extra-id';
import { makeBranchExtraName } from '#front/app/functions/make-branch-extra-name';
import { FileQuery, FileState } from '#front/app/queries/file.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { SessionQuery } from '#front/app/queries/session.query';
import { SessionBundleQuery } from '#front/app/queries/session-bundle.query';
import { SessionEventsQuery } from '#front/app/queries/session-events.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery, UserState } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { FileService } from '#front/app/services/file.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

@Component({
  standalone: false,
  selector: 'm-branch-select',
  templateUrl: './branch-select.component.html'
})
export class BranchSelectComponent {
  @ViewChild('branchSelect', { static: false })
  branchSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.branchSelectElement?.close();
  }

  repoTypeEnum = RepoTypeEnum;

  defaultBranch: string;
  prodRepoID = PROD_REPO_ID;

  repoStatusNeedCommit = RepoStatusEnum.NeedCommit;

  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.cd.detectChanges();
    })
  );

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
      this.cd.detectChanges();
    })
  );

  branchesList: BranchItem[] = [];
  branchesListLoading = false;
  branchesListLength = 0;
  sessionsList: SessionApi[] = [];

  selectedOrgId: string;
  selectedProjectId: string;
  selectedBranchItem: BranchItem;
  selectedBranchExtraId: string;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;

      let user: UserState;
      this.userQuery
        .select()
        .pipe(
          tap(y => (user = y)),
          take(1)
        )
        .subscribe();

      this.defaultBranch = this.nav.projectDefaultBranch;

      this.selectedOrgId = this.nav.orgId;
      this.selectedProjectId = this.nav.projectId;

      this.selectedBranchItem =
        isDefined(this.nav.projectId) && isDefined(this.nav.branchId)
          ? this.makeBranchItem({
              branchId: this.nav.branchId,
              repoId: this.nav.repoId,
              repoType: this.nav.repoType,
              alias: user.alias,
              userId: user.userId
            })
          : undefined;

      this.selectedBranchExtraId = this.selectedBranchItem?.extraId;

      this.branchesList =
        isDefined(this.selectedBranchItem) &&
        !this.branchesList.some(
          item => item.extraId === this.selectedBranchItem.extraId
        )
          ? [this.selectedBranchItem]
          : this.branchesList;

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

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap(() => {
      this.cd.detectChanges();
    })
  );

  constructor(
    private userQuery: UserQuery,
    private uiQuery: UiQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private fileQuery: FileQuery,
    private repoQuery: RepoQuery,
    private sessionQuery: SessionQuery,
    private sessionBundleQuery: SessionBundleQuery,
    private sessionEventsQuery: SessionEventsQuery,
    private apiService: ApiService,
    private navigateService: NavigateService,
    private fileService: FileService,
    private myDialogService: MyDialogService,
    private uiService: UiService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  openBranchSelect() {
    let user: UserState;
    this.userQuery
      .select()
      .pipe(
        tap(x => (user = x)),
        take(1)
      )
      .subscribe();

    this.branchesListLoading = true;

    let payload: ToBackendGetBranchesListRequestPayload = {
      projectId: this.selectedProjectId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetBranchesList,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetBranchesListResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.sessionsList = resp.payload.sessionsList;

            this.branchesList = resp.payload.branchesList.map(y =>
              this.makeBranchItem({
                branchId: y.branchId,
                repoId: y.repoId,
                repoType: y.repoType,
                alias: user.alias,
                userId: user.userId
              })
            );

            let sortDefaultFirst = (a: BranchItem, b: BranchItem) => {
              if (a.branchId === this.defaultBranch) return -1;
              if (b.branchId === this.defaultBranch) return 1;
              return a.branchId.localeCompare(b.branchId);
            };

            let prodBranches = this.branchesList
              .filter(y => y.repoType === RepoTypeEnum.Prod)
              .sort(sortDefaultFirst);

            let devBranches = this.branchesList
              .filter(y => y.repoType === RepoTypeEnum.Dev)
              .sort(sortDefaultFirst);

            let sessionBranches = this.branchesList
              .filter(y => y.repoType === RepoTypeEnum.Session)
              .sort(sortDefaultFirst);

            this.branchesList =
              this.isEditor === true
                ? [...prodBranches, ...devBranches, ...sessionBranches]
                : [...prodBranches];

            this.branchesListLength = this.branchesList.length;
            this.branchesListLoading = false;

            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  createNewBranch(branchSelect: any, event: MouseEvent) {
    event.stopPropagation();
    branchSelect.close();

    this.myDialogService.showCreateBranch({
      apiService: this.apiService,
      orgId: this.selectedOrgId,
      projectId: this.selectedProjectId,
      branchesList: this.branchesList,
      selectedBranchItem: this.selectedBranchItem,
      selectedBranchExtraId: this.selectedBranchExtraId
    });
  }

  mergeBranch(branchSelect: any, event: MouseEvent) {
    event.stopPropagation();
    branchSelect.close();

    this.myDialogService.showMergeBranch({
      apiService: this.apiService,
      fileService: this.fileService,
      projectId: this.selectedProjectId,
      fileId: this.file.fileId,
      envId: this.nav.envId,
      currentBranchId: this.selectedBranchItem.branchId,
      currentBranchExtraName: this.selectedBranchItem.extraName,
      branchesList: this.branchesList
    });
  }

  deleteBranch(branchSelect: any, event: MouseEvent) {
    event.stopPropagation();
    branchSelect.close();

    let alias: string;
    this.userQuery.alias$
      .pipe(
        tap(x => (alias = x)),
        take(1)
      )
      .subscribe();

    this.myDialogService.showDeleteBranch({
      apiService: this.apiService,
      orgId: this.selectedOrgId,
      projectId: this.selectedProjectId,
      defaultBranch: this.defaultBranch,
      branchId: this.selectedBranchItem.branchId,
      envId: this.nav.envId,
      repoId: this.selectedBranchItem.repoId,
      repoType: this.selectedBranchItem.repoType,
      alias: alias
    });
  }

  branchChange() {
    let newSelectedBranchItem = this.branchesList.find(
      x => x.extraId === this.selectedBranchExtraId
    );

    let envId =
      newSelectedBranchItem.repoType === RepoTypeEnum.Prod
        ? PROJECT_ENV_PROD
        : this.nav.envId;

    let urlParts = this.router.url.split('?')[0].split('/');

    if (urlParts[11] === PATH_REPORTS) {
      let uiState = this.uiQuery.getValue();
      uiState.gridApi?.deselectAll();
    }

    let baseNavArray = [
      PATH_ORG,
      this.selectedOrgId,
      PATH_PROJECT,
      this.selectedProjectId,
      PATH_REPO,
      newSelectedBranchItem.repoId,
      PATH_BRANCH,
      newSelectedBranchItem.branchId,
      PATH_ENV,
      envId
    ];

    if (urlParts[11] === PATH_BUILDER) {
      let uiState = this.uiQuery.getValue();

      let isChangeView =
        uiState.builderLeft === BuilderLeftEnum.ChangesToCommit ||
        uiState.builderLeft === BuilderLeftEnum.ChangesToPush;

      let navArray = [...baseNavArray, PATH_BUILDER];
      let queryParams: Record<string, any> = {
        left: uiState.builderLeft,
        right: uiState.builderRight
      };

      if (newSelectedBranchItem.repoType === RepoTypeEnum.Session) {
        let currentSession = this.sessionQuery.getValue();
        if (currentSession?.sessionId) {
          this.uiQuery.updatePart({ showSessionMessages: false });
        }
        this.sessionBundleQuery.reset();
        this.sessionEventsQuery.reset();

        let session = this.sessionsList.find(
          s => s.repoId === newSelectedBranchItem.repoId
        );
        if (session) {
          this.sessionQuery.update({ ...session, firstMessage: undefined });
        }

        this.uiService.setProjectSessionLink({
          sessionId: newSelectedBranchItem.repoId,
          repoId: newSelectedBranchItem.repoId,
          branchId: newSelectedBranchItem.branchId
        });
        navArray.push(PATH_SESSION);
        navArray.push(newSelectedBranchItem.repoId);
      } else if (isChangeView) {
        navArray.push(PATH_SELECT_FILE);
      } else if (urlParts[12] === PATH_FILE && isDefined(urlParts[13])) {
        navArray.push(PATH_FILE);
        navArray.push(urlParts[13]);
      } else if (urlParts[12] === PATH_SESSION && isDefined(urlParts[13])) {
        navArray.push(PATH_SESSION);
        navArray.push(urlParts[13]);
      } else {
        navArray.push(urlParts[12] || PATH_NEW_SESSION);
      }

      this.router.navigate(navArray, { queryParams });
    } else {
      let uiState = this.uiQuery.getValue();

      let pDashboardLink = uiState.projectDashboardLinks.find(
        link => link.projectId === this.selectedProjectId
      );
      let pModelLink = uiState.projectModelLinks.find(
        link => link.projectId === this.selectedProjectId
      );
      let pChartLink = uiState.projectChartLinks.find(
        link => link.projectId === this.selectedProjectId
      );
      let pReportLink = uiState.projectReportLinks.find(
        link => link.projectId === this.selectedProjectId
      );

      let navArray = checkNavMain({
        urlParts: urlParts,
        navArray: baseNavArray,
        lastDashboardId: pDashboardLink?.dashboardId,
        lastModelId: pModelLink?.modelId,
        lastChartId: pChartLink?.chartId,
        lastReportId: pReportLink?.reportId
      });

      this.router.navigate(navArray);
    }
  }

  makeBranchItem(item: {
    branchId: string;
    repoId: string;
    repoType: RepoTypeEnum;
    alias: string;
    userId: string;
  }) {
    let extraId = makeBranchExtraId({
      branchId: item.branchId,
      repoType: item.repoType,
      userId: item.userId
    });

    let extraName = makeBranchExtraName({
      branchId: item.branchId,
      repoType: item.repoType,
      alias: item.alias
    });

    let branchItem: BranchItem = {
      branchId: item.branchId,
      repoId: item.repoId,
      repoType: item.repoType,
      extraId: extraId,
      extraName: extraName
    };

    return branchItem;
  }
}
