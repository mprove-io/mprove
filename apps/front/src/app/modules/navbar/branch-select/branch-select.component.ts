import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
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

      console.log(alias);

      this.selectedOrgId = x.orgId;
      this.selectedProjectId = x.projectId;
      this.selectedBranchItem = this.makeBranchItem(x, alias);
      this.selectedBranchExtraId = this.selectedBranchItem.extraId;

      this.branchesList = [this.selectedBranchItem];

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

    // this.myDialogService.showCreateProject({
    //   apiService: this.apiService,
    //   orgId: this.selectedOrgId
    // });
  }

  branchChange() {
    this.router.navigate([
      common.PATH_ORG,
      this.selectedOrgId,
      common.PATH_PROJECT,
      this.selectedProjectId,
      common.PATH_BLOCKML
    ]);
  }

  makeBranchItem(
    b: apiToBackend.ToBackendGetBranchesListResponsePayloadBranchesItem,
    alias: string
  ) {
    return {
      branchId: b.branchId,
      isRepoProd: b.isRepoProd,
      extraId:
        common.isUndefined(b.isRepoProd) || common.isUndefined(b.branchId)
          ? undefined
          : b.isRepoProd === true
          ? `prod/${b.branchId}`
          : `${alias}/${b.branchId}`
    };
  }
}
