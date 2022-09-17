import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { constants } from '~common/barrels/constants';
import { makeBranchExtraId } from '~front/app/functions/make-branch-extra-id';
import { makeBranchExtraName } from '~front/app/functions/make-branch-extra-name';
import { FileQuery } from '~front/app/queries/file.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { FileState } from '~front/app/stores/file.store';
import { MemberStore } from '~front/app/stores/member.store';
import { NavStore } from '~front/app/stores/nav.store';
import { RepoState } from '~front/app/stores/repo.store';
import { UserState } from '~front/app/stores/user.store';
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

  nav$ = this.navQuery.select().pipe(
    tap(x => {
      let user: UserState;
      this.userQuery
        .select()
        .pipe(
          tap(z => (user = z)),
          take(1)
        )
        .subscribe();

      this.defaultBranch = x.projectDefaultBranch;

      this.selectedOrgId = x.orgId;
      this.selectedProjectId = x.projectId;

      this.selectedBranchItem =
        common.isDefined(x.projectId) && common.isDefined(x.branchId)
          ? this.makeBranchItem({
              branchId: x.branchId,
              isRepoProd: x.isRepoProd,
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
    private memberStore: MemberStore,
    private navQuery: NavQuery,
    private fileQuery: FileQuery,
    private repoQuery: RepoQuery,
    private apiService: ApiService,
    public navigateService: NavigateService,
    private fileService: FileService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private navStore: NavStore
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

    this.branchesListLoading = true;

    let payload: apiToBackend.ToBackendGetBranchesListRequestPayload = {
      projectId: this.selectedProjectId
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendGetProjectResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberStore.update(resp.payload.userMember);
            return true;
          }
        }),
        switchMap(a =>
          this.apiService
            .req(
              apiToBackend.ToBackendRequestInfoNameEnum
                .ToBackendGetBranchesList,
              payload
            )
            .pipe(
              tap((resp: apiToBackend.ToBackendGetBranchesListResponse) => {
                if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
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
                    y =>
                      y.isRepoProd === true && y.branchId === this.defaultBranch
                  );

                  let prodBranchesNotDefault = this.branchesList.filter(
                    y =>
                      y.isRepoProd === true && y.branchId !== this.defaultBranch
                  );

                  let localBranchesDefault = this.branchesList.filter(
                    y =>
                      y.isRepoProd === false &&
                      y.branchId === this.defaultBranch
                  );

                  let localBranchesNotDefault = this.branchesList.filter(
                    y =>
                      y.isRepoProd === false &&
                      y.branchId !== this.defaultBranch
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
              })
            )
        ),
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
      isRepoProd: this.selectedBranchItem.isRepoProd,
      alias: alias
    });
  }

  branchChange() {
    this.showEmptySelector = true;
    this.cd.detectChanges();

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
      newSelectedBranchItem.branchId
    ];

    if (urlParts[9] === constants.PATH_VISUALIZATIONS) {
      navArray.push(common.PATH_VISUALIZATIONS);
      this.router.navigate(navArray);
    } else if (
      urlParts[9] === constants.PATH_MODELS ||
      urlParts[9] === constants.PATH_MODEL
    ) {
      navArray.push(common.PATH_MODELS);
      this.router.navigate(navArray);
    } else if (
      urlParts[9] === constants.PATH_DASHBOARDS ||
      urlParts[9] === constants.PATH_DASHBOARD
    ) {
      navArray.push(common.PATH_DASHBOARDS);
      this.router.navigate(navArray);
    } else {
      navArray.push(common.PATH_FILES);
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
