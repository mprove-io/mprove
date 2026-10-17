import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { PATH_ORG_DELETED } from '#common/constants/top';
import { LOCAL_STORAGE_DELETED_ORG_NAME } from '#common/constants/top-front';
import type { ToBackendDeleteOrgRequest } from '#common/types/backend/routes/orgs/delete-org/delete-org-request';
import { NavQuery } from '#front/app/queries/nav.query';
import { OrgQuery } from '#front/app/queries/org.query';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';

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
    private appSpinnerService: AppSpinnerService,
    public ref: DialogRef<DeleteOrgDialogData>,
    private router: Router,
    private orgQuery: OrgQuery,
    private navQuery: NavQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let payload: ToBackendDeleteOrgRequest['input'] = {
      orgId: this.ref.data.orgId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendDeleteOrg',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          localStorage.setItem(
            LOCAL_STORAGE_DELETED_ORG_NAME,
            this.ref.data.orgName
          );
          this.router.navigate([PATH_ORG_DELETED]);
          this.navQuery.clearOrgAndDeps();
          this.orgQuery.reset();
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
