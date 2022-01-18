import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { makeDashboardFileText } from '~front/app/functions/make-dashboard-file-text';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { DashboardState } from '~front/app/stores/dashboard.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { DashboardExtended } from '../dashboards.component';

@Component({
  selector: 'm-dashboards-new-dialog',
  templateUrl: './dashboards-new-dialog.component.html'
})
export class DashboardsNewDialogComponent {
  dashboard: DashboardState;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  groupForm: FormGroup = this.fb.group({
    group: [undefined, [Validators.maxLength(255)]]
  });

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  usersForm: FormGroup = this.fb.group({
    users: [undefined, [Validators.maxLength(255)]]
  });

  newDashboardId = common.makeId();

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef
  ) {}

  create() {
    this.titleForm.markAllAsTouched();

    if (!this.titleForm.valid) {
      return;
    }

    if (
      this.titleForm.controls['title'].valid &&
      this.groupForm.controls['group'].valid &&
      this.rolesForm.controls['roles'].valid &&
      this.usersForm.controls['users'].valid
    ) {
      this.ref.close();

      let newTitle = this.titleForm.controls['title'].value;
      let group = this.groupForm.controls['group'].value;
      let roles = this.rolesForm.controls['roles'].value;
      let users = this.usersForm.controls['users'].value;

      this.createDashboard({
        newTitle: newTitle,
        group: group,
        roles: roles,
        users: users
      });
    }
  }

  createDashboard(item: {
    newTitle: string;
    group: string;
    roles: string;
    users: string;
  }) {
    let { newTitle, group, roles, users } = item;

    let newDashboard: DashboardExtended = {
      structId: undefined,
      dashboardId: this.newDashboardId,
      filePath: undefined,
      content: undefined,
      accessUsers: undefined,
      accessRoles: undefined,
      title: undefined,
      hidden: false,
      reports: [],
      serverTs: undefined,
      extendedFilters: [],
      fields: [],
      temp: false
    };

    let dashboardFileText = makeDashboardFileText({
      dashboard: newDashboard,
      newDashboardId: this.newDashboardId,
      newTitle: newTitle,
      group: group,
      roles: roles,
      users: users
    });

    let payload: apiToBackend.ToBackendCreateDashboardRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId,
      dashboardId: this.newDashboardId,
      dashboardFileText: dashboardFileText
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDashboard,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateDashboardResponse) => {
          this.navigateService.navigateToDashboard(this.newDashboardId);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
