import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { NavStore } from '~front/app/stores/nav.store';
import { OrgStore } from '~front/app/stores/org.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface DeleteOrgDialogData {
  apiService: ApiService;
  orgId: string;
  orgName: string;
}

@Component({
  selector: 'm-delete-org-dialog',
  templateUrl: './delete-org-dialog.component.html'
})
export class DeleteOrgDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteOrgDialogData>,
    private router: Router,
    private orgStore: OrgStore,
    private spinner: NgxSpinnerService,
    private navStore: NavStore
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.spinner.show(constants.APP_SPINNER_NAME);

    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteOrgRequestPayload = {
      orgId: this.ref.data.orgId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteOrg,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteOrgResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            localStorage.setItem(
              constants.LOCAL_STORAGE_DELETED_ORG_NAME,
              this.ref.data.orgName
            );
            this.router.navigate([common.PATH_ORG_DELETED]);
            this.navStore.clearOrgAndDeps();
            this.orgStore.reset();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
