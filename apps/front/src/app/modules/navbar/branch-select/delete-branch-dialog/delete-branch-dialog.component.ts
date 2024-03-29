import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface DeleteBranchDialogData {
  apiService: ApiService;
  orgId: string;
  projectId: string;
  branchId: string;
  envId: string;
  defaultBranch: string;
  isRepoProd: boolean;
  alias: string;
  hideBranchSelectFn: () => void;
}

@Component({
  selector: 'm-delete-branch-dialog',
  templateUrl: './delete-branch-dialog.component.html'
})
export class DeleteBranchDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  repoName =
    this.ref.data.isRepoProd === true
      ? common.PROD_REPO_ID
      : this.ref.data.alias;

  constructor(
    public ref: DialogRef<DeleteBranchDialogData>,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.data.hideBranchSelectFn();

    this.ref.close();

    this.spinner.show(constants.APP_SPINNER_NAME);

    let payload: apiToBackend.ToBackendDeleteBranchRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteBranch,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteBranchResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.router.navigate([
              common.PATH_ORG,
              this.ref.data.orgId,
              common.PATH_PROJECT,
              this.ref.data.projectId,
              common.PATH_REPO,
              common.PROD_REPO_ID,
              common.PATH_BRANCH,
              this.ref.data.defaultBranch,
              common.PATH_ENV,
              this.ref.data.envId,
              common.PATH_FILES
            ]);
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
