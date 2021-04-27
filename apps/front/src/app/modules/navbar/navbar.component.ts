import { Component } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavStore } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  orgsList$: Observable<common.OrgsItem[]> = EMPTY;
  orgsListLoading = false;
  orgsListLength = 0;
  selectedOrg: common.OrgsItem;

  constructor(
    private navQuery: NavQuery,
    private navStore: NavStore,
    private apiService: ApiService,
    private myDialogService: MyDialogService
  ) {}

  openOrgSelect() {
    this.orgsListLoading = true;

    this.orgsList$ = this.apiService
      .req(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrgsList, {})
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetOrgsListResponse) =>
            resp.payload.orgsList
        ),
        tap(x => {
          this.orgsListLoading = false;

          this.orgsListLength = x.length;
        })
      );
  }

  createNewOrg(orgsSelect: any) {
    orgsSelect.close();

    this.myDialogService.showCreateOrg({
      apiService: this.apiService
    });
  }

  orgChange() {
    this.navStore.update(state =>
      Object.assign({}, state, { orgId: this.selectedOrg.orgId })
    );
  }
}
