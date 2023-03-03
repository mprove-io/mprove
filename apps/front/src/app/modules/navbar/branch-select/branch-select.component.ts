import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs/operators';
import { makeBranchExtraId } from '~front/app/functions/make-branch-extra-id';
import { makeBranchExtraName } from '~front/app/functions/make-branch-extra-name';
import { makeRepQueryParams } from '~front/app/functions/make-query-params';
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
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-branch-select',
  templateUrl: './branch-select.component.html'
})
export class BranchSelectComponent {
  defaultBranch: string;
  prodRepoID = common.PROD_REPO_ID;

  repoStatusNeedCommit = common.RepoStatusEnum.NeedCommit;

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

  branchesList: interfaces.BranchItem[] = [];
  branchesListLoading = false;
  branchesListLength = 0;

  selectedOrgId: string;
  selectedProjectId: string;
  selectedBranchItem: interfaces.BranchItem;
  selectedBranchExtraId: string;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;

      let user: UserState;
      this.userQuery
        .select()
        .pipe(
          tap(z => (user = z)),
          take(1)
        )
        .subscribe();

      this.defaultBranch = this.nav.projectDefaultBranch;

      this.selectedOrgId = this.nav.orgId;
      this.selectedProjectId = this.nav.projectId;

      this.selectedBranchItem =
        common.isDefined(this.nav.projectId) &&
        common.isDefined(this.nav.branchId)
          ? this.makeBranchItem({
              branchId: this.nav.branchId,
              isRepoProd: this.nav.isRepoProd,
              alias: user.alias,
              userId: user.userId
            })
          : undefined;

      this.selectedBranchExtraId = this.selectedBranchItem?.extraId;

      this.branchesList = common.isDefined(this.selectedBranchItem)
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
        tap(z => (user = z)),
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

    let payload: apiToBackend.ToBackendGetBranchesListRequestPayload = {
      projectId: this.selectedProjectId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetBranchesList,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetBranchesListResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            let x = resp.payload.branchesList;

            this.branchesList = x.map(z =>
              this.makeBranchItem({
                branchId: z.branchId,
                isRepoProd: z.isRepoProd,
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

            this.branchesListLength = x.length;
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
    this.hideBranchSelect();

    let newSelectedBranchItem = this.branchesList.find(
      x => x.extraId === this.selectedBranchExtraId
    );

    let userId;
    this.userQuery.userId$
      .pipe(
        tap(x => (userId = x)),
        take(1)
      )
      .subscribe();

    let repoId =
      newSelectedBranchItem.isRepoProd === true ? common.PROD_REPO_ID : userId;

    // console.log(this.router.url);
    let urlParts = this.router.url.split('/');

    let navArray = [
      common.PATH_ORG,
      this.selectedOrgId,
      common.PATH_PROJECT,
      this.selectedProjectId,
      common.PATH_REPO,
      repoId,
      common.PATH_BRANCH,
      newSelectedBranchItem.branchId,
      common.PATH_ENV,
      this.nav.envId
    ];

    if (urlParts[11] === common.PATH_METRICS) {
      navArray.push(common.PATH_METRICS);
      navArray.push(common.PATH_REPORT);
      navArray.push(common.EMPTY_REP_ID);
    } else if (
      urlParts[11] === common.PATH_MODELS ||
      urlParts[11] === common.PATH_MODEL
    ) {
      navArray.push(common.PATH_MODELS);
    } else if (
      urlParts[11] === common.PATH_DASHBOARDS ||
      urlParts[11] === common.PATH_DASHBOARD
    ) {
      navArray.push(common.PATH_DASHBOARDS);
    } else if (urlParts[11] === common.PATH_VISUALIZATIONS) {
      navArray.push(common.PATH_VISUALIZATIONS);
    } else {
      navArray.push(common.PATH_FILES);
    }

    if (urlParts[11] === common.PATH_METRICS) {
      let uiState = this.uiQuery.getValue();
      uiState.gridApi.deselectAll();

      this.router.navigate(navArray, {
        queryParams: makeRepQueryParams({
          timezone: uiState.timezone,
          timeSpec: uiState.timeSpec,
          timeRangeFraction: uiState.timeRangeFraction,
          selectRowsNodeIds: []
        })
      });
    } else {
      this.router.navigate(navArray);
    }
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

    let branchItem: interfaces.BranchItem = {
      branchId: item.branchId,
      isRepoProd: item.isRepoProd,
      extraId: extraId,
      extraName: extraName
    };

    return branchItem;
  }
}
