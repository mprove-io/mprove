import {
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { map, take, tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-org-select',
  templateUrl: './org-select.component.html'
})
export class OrgSelectComponent {
  @ViewChild('orgSelect', { static: false })
  orgSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.orgSelectElement?.close();
  }

  restrictedUserAlias = common.RESTRICTED_USER_ALIAS;

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

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private uiQuery: UiQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  openOrgSelect() {
    this.orgsListLoading = true;

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrgsList,
        payload: {}
      })
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

  createNewOrg() {
    this.orgSelectElement?.close();

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

    this.navQuery.updatePart({
      projectId: undefined,
      projectName: undefined,
      projectDefaultBranch: undefined,
      isRepoProd: undefined,
      branchId: undefined,
      envId: common.PROJECT_ENV_PROD,
      needValidate: false
    });

    localStorage.removeItem(constants.LOCAL_STORAGE_PROJECT_ID);
  }
}
