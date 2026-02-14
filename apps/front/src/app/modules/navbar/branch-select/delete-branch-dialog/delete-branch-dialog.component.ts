import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import {
  PATH_BRANCH,
  PATH_BUILDER,
  PATH_ENV,
  PATH_ORG,
  PATH_PROJECT,
  PATH_REPO,
  PROD_REPO_ID
} from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendDeleteBranchRequestPayload,
  ToBackendDeleteBranchResponse
} from '#common/interfaces/to-backend/branches/to-backend-delete-branch';
import { ApiService } from '#front/app/services/api.service';

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
  templateUrl: './delete-branch-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteBranchDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  repoName =
    this.ref.data.isRepoProd === true ? PROD_REPO_ID : this.ref.data.alias;

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

    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendDeleteBranchRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteBranch,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendDeleteBranchResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.router.navigate([
              PATH_ORG,
              this.ref.data.orgId,
              PATH_PROJECT,
              this.ref.data.projectId,
              PATH_REPO,
              PROD_REPO_ID,
              PATH_BRANCH,
              this.ref.data.defaultBranch,
              PATH_ENV,
              this.ref.data.envId,
              PATH_BUILDER
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
