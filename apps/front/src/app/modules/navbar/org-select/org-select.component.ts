import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavState, NavStore } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-org-select',
  templateUrl: './org-select.component.html'
})
export class OrgSelectComponent {
  orgsList: common.OrgsItem[] = [];
  orgsListLoading = false;
  orgsListLength = 0;

  selectedOrgId: string;
  selectedOrg$ = this.navQuery.org$.pipe(
    tap(x => {
      this.orgsList = [x];
      this.selectedOrgId = x.orgId;
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  constructor(
    private navQuery: NavQuery,
    private navStore: NavStore,
    private uiQuery: UiQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  openOrgSelect() {
    this.orgsListLoading = true;

    this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrgsList, {})
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetOrgsListResponse) =>
            resp.payload.orgsList
        ),
        tap(x => {
          this.orgsList = x;
          this.orgsListLoading = false;
          this.orgsListLength = x.length;
        }),
        take(1)
      )
      .subscribe();
  }

  createNewOrg(orgSelect: any) {
    orgSelect.close();

    this.myDialogService.showCreateOrg({
      apiService: this.apiService
    });
  }

  orgChange() {
    this.router.navigate([
      common.PATH_ORG,
      this.selectedOrgId,
      common.PATH_ACCOUNT
    ]);

    this.navStore.update(state =>
      Object.assign({}, state, <NavState>{
        projectId: undefined,
        projectName: undefined,
        isRepoProd: false,
        branchId: undefined
      })
    );

    localStorage.removeItem(constants.LOCAL_STORAGE_PROJECT_ID);
  }
}
