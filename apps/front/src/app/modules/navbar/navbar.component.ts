import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavStore } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
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

  constructor(
    private navQuery: NavQuery,
    private navStore: NavStore,
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

  createNewOrg(orgsSelect: any) {
    orgsSelect.close();

    this.myDialogService.showCreateOrg({
      apiService: this.apiService
    });
  }

  orgChange() {
    localStorage.setItem(constants.LOCAL_STORAGE_ORG_ID, this.selectedOrgId);

    // this.navStore.update(state =>
    //   Object.assign({}, state, {
    //     orgId: this.selectedOrgId,
    //     orgName: this.orgsList.find(x => x.orgId === this.selectedOrgId).name
    //   })
    // );

    this.router.navigate([
      common.PATH_ORG,
      this.selectedOrgId,
      common.PATH_ACCOUNT
    ]);
  }
}
