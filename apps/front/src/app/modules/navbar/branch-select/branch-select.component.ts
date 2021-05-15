import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { makeBranchExtraId } from '~front/app/functions/make-branch-extra-id';
import { makeBranchExtraName } from '~front/app/functions/make-branch-extra-name';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-branch-select',
  templateUrl: './branch-select.component.html'
})
export class BranchSelectComponent {
  branchesList: interfaces.BranchItem[] = [];
  branchesListLoading = false;
  branchesListLength = 0;

  selectedOrgId: string;
  selectedProjectId: string;
  selectedBranchItem: interfaces.BranchItem;
  selectedBranchExtraId: string;

  nav$ = this.navQuery.select().pipe(
    tap(x => {
      let alias;
      this.userQuery.alias$
        .pipe(
          tap(z => (alias = z)),
          take(1)
        )
        .subscribe();

      this.selectedOrgId = x.orgId;
      this.selectedProjectId = x.projectId;
      this.selectedBranchItem = common.isDefined(x.projectId)
        ? this.makeBranchItem(x, alias)
        : undefined;
      this.selectedBranchExtraId = this.selectedBranchItem?.extraId;

      this.branchesList = common.isDefined(this.selectedBranchItem)
        ? [this.selectedBranchItem]
        : [];

      this.cd.detectChanges();
    })
  );

  constructor(
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  openBranchSelect() {
    let alias: string;
    this.userQuery.alias$
      .pipe(
        tap(z => (alias = z)),
        take(1)
      )
      .subscribe();

    this.branchesListLoading = true;

    let payload: apiToBackend.ToBackendGetBranchesListRequestPayload = {
      projectId: this.selectedProjectId
    };

    this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetBranchesList,
        payload
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetBranchesListResponse) =>
            resp.payload.branchesList
        ),
        tap(x => {
          this.branchesList = x.map(z => this.makeBranchItem(z, alias));
          this.branchesListLoading = false;
          this.branchesListLength = x.length;
        }),
        take(1)
      )
      .subscribe();
  }

  createNewBranch(branchSelect: any) {
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

  branchChange() {
    this.router.navigate([
      common.PATH_ORG,
      this.selectedOrgId,
      common.PATH_PROJECT,
      this.selectedProjectId,
      common.PATH_BRANCH,
      this.selectedBranchExtraId,
      common.PATH_BLOCKML
    ]);
  }

  makeBranchItem(
    b: apiToBackend.ToBackendGetBranchesListResponsePayloadBranchesItem,
    alias: string
  ) {
    let extraId = makeBranchExtraId({
      branchId: b.branchId,
      isRepoProd: b.isRepoProd,
      alias: alias
    });

    let extraName = makeBranchExtraName({
      branchId: b.branchId,
      isRepoProd: b.isRepoProd,
      alias: alias
    });

    return {
      branchId: b.branchId,
      isRepoProd: b.isRepoProd,
      extraId: extraId,
      extraName: extraName
    };
  }
}
