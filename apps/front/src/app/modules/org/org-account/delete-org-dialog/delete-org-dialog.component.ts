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
import { PATH_ORG_DELETED } from '#common/constants/top';
import {
  APP_SPINNER_NAME,
  LOCAL_STORAGE_DELETED_ORG_NAME
} from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendDeleteOrgRequestPayload,
  ToBackendDeleteOrgResponse
} from '#common/interfaces/to-backend/orgs/to-backend-delete-org';
import { NavQuery } from '~front/app/queries/nav.query';
import { OrgQuery } from '~front/app/queries/org.query';
import { ApiService } from '~front/app/services/api.service';

export interface DeleteOrgDialogData {
  apiService: ApiService;
  orgId: string;
  orgName: string;
}

@Component({
  selector: 'm-delete-org-dialog',
  templateUrl: './delete-org-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteOrgDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteOrgDialogData>,
    private router: Router,
    private orgQuery: OrgQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.spinner.show(APP_SPINNER_NAME);

    this.ref.close();

    let payload: ToBackendDeleteOrgRequestPayload = {
      orgId: this.ref.data.orgId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteOrg,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendDeleteOrgResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            localStorage.setItem(
              LOCAL_STORAGE_DELETED_ORG_NAME,
              this.ref.data.orgName
            );
            this.router.navigate([PATH_ORG_DELETED]);
            this.navQuery.clearOrgAndDeps();
            this.orgQuery.reset();
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
