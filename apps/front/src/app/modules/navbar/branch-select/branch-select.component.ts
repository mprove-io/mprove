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
  PATH_ENV,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PATH_REPORTS,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '~common/constants/top';
import { RepoStatusEnum } from '~common/enums/repo-status.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { BranchItem } from '~common/interfaces/front/branch-item';
import {
  ToBackendGetBranchesListRequestPayload,
  ToBackendGetBranchesListResponse
} from '~common/interfaces/to-backend/branches/to-backend-get-branches-list';
import { checkNavMain } from '~front/app/functions/check-nav-main';
import { makeBranchExtraId } from '~front/app/functions/make-branch-extra-id';
import { makeBranchExtraName } from '~front/app/functions/make-branch-extra-name';
import { FileQuery, FileState } from '~front/app/queries/file.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery, UserState } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';

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
              isRepoProd: this.nav.isRepoProd,
              alias: user.alias,
              userId: user.userId
            })
          : undefined;

      this.selectedBranchExtraId = this.selectedBranchItem?.extraId;

      this.branchesList = isDefined(this.selectedBranchItem)
        ? [this.selectedBranchItem]
        : [];

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

  showEmptySelector = false;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      this.showEmptySelector = false;
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
    private apiService: ApiService,
    private navigateService: NavigateService,
    private fileService: FileService,
    private myDialogService: MyDialogService,
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

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(
        tap(x => {
          nav = x;
        }),
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

            this.branchesList = resp.payload.branchesList.map(y =>
              this.makeBranchItem({
                branchId: y.branchId,
                isRepoProd: y.isRepoProd,
                alias: user.alias,
                userId: user.userId
              })
            );

            let prodBranchesDefault = this.branchesList.filter(
              y => y.isRepoProd === true && y.branchId === this.defaultBranch
            );

            let prodBranchesNotDefault = this.branchesList.filter(
              y => y.isRepoProd === true && y.branchId !== this.defaultBranch
            );

            let localBranchesDefault = this.branchesList.filter(
              y => y.isRepoProd === false && y.branchId === this.defaultBranch
            );

            let localBranchesNotDefault = this.branchesList.filter(
              y => y.isRepoProd === false && y.branchId !== this.defaultBranch
            );

            this.branchesList =
              this.isEditor === true
                ? [
                    ...prodBranchesDefault,
                    ...prodBranchesNotDefault,
                    ...localBranchesDefault,
                    ...localBranchesNotDefault
                  ]
                : [...prodBranchesDefault, ...prodBranchesNotDefault];

            this.branchesListLength = this.branchesList.length;
            this.branchesListLoading = false;
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
      selectedBranchExtraId: this.selectedBranchExtraId,
      hideBranchSelectFn: this.hideBranchSelect.bind(this)
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
      isRepoProd: this.selectedBranchItem.isRepoProd,
      alias: alias,
      hideBranchSelectFn: this.hideBranchSelect.bind(this)
    });
  }

  hideBranchSelect() {
    this.showEmptySelector = true;
    this.cd.detectChanges();
  }

  branchChange() {
    let newSelectedBranchItem = this.branchesList.find(
      x => x.extraId === this.selectedBranchExtraId
    );

    let nav = this.navQuery.getValue();

    if (
      (nav.isRepoProd === true && newSelectedBranchItem.isRepoProd === false) ||
      (nav.isRepoProd === false && newSelectedBranchItem.isRepoProd === true)
    ) {
      this.hideBranchSelect();
    }

    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    let repoId =
      newSelectedBranchItem.isRepoProd === true ? PROD_REPO_ID : userId;

    let envId = repoId === PROD_REPO_ID ? PROJECT_ENV_PROD : this.nav.envId;

    let urlParts = this.router.url.split('/');

    let navArray = checkNavMain({
      urlParts: urlParts,
      navArray: [
        PATH_ORG,
        this.selectedOrgId,
        PATH_PROJECT,
        this.selectedProjectId,
        PATH_REPO,
        repoId,
        PATH_BRANCH,
        newSelectedBranchItem.branchId,
        PATH_ENV,
        envId
      ]
    });

    if (urlParts[11] === PATH_REPORTS) {
      let uiState = this.uiQuery.getValue();
      uiState.gridApi?.deselectAll();
    }

    this.router.navigate(navArray);
  }

  makeBranchItem(item: {
    branchId: string;
    isRepoProd: boolean;
    alias: string;
    userId: string;
  }) {
    let extraId = makeBranchExtraId({
      branchId: item.branchId,
      isRepoProd: item.isRepoProd,
      userId: item.userId
    });

    let extraName = makeBranchExtraName({
      branchId: item.branchId,
      isRepoProd: item.isRepoProd,
      alias: item.alias
    });

    let branchItem: BranchItem = {
      branchId: item.branchId,
      isRepoProd: item.isRepoProd,
      extraId: extraId,
      extraName: extraName
    };

    return branchItem;
  }
}
