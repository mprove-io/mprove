import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { makeDashboardFileText } from '~front/app/functions/make-dashboard-file-text';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { DashboardState } from '~front/app/stores/dashboard.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { DashboardExtended } from '../../dashboards/dashboards.component';

enum DashboardSaveAsEnum {
  NEW_DASHBOARD = 'NEW_DASHBOARD'
  // REPLACE_EXISTING_DASHBOARD = 'REPLACE_EXISTING_DASHBOARD',
}

@Component({
  selector: 'm-dashboard-save-as-dialog',
  templateUrl: './dashboard-save-as-dialog.component.html'
})
export class DashboardSaveAsDialogComponent implements OnInit {
  dashboardSaveAsEnum = DashboardSaveAsEnum;

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

  saveAs: DashboardSaveAsEnum = DashboardSaveAsEnum.NEW_DASHBOARD;

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

  ngOnInit() {
    this.dashboard = this.ref.data.dashboard as DashboardExtended;

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.dashboard.title
    });
    setValueAndMark({
      control: this.rolesForm.controls['roles'],
      value: this.dashboard.accessRoles?.join(', ')
    });
    setValueAndMark({
      control: this.usersForm.controls['users'],
      value: this.dashboard.accessUsers?.join(', ')
    });
  }

  save() {
    if (
      this.saveAs === DashboardSaveAsEnum.NEW_DASHBOARD &&
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

      this.saveAsNewDashboard({
        newTitle: newTitle,
        group: group,
        roles: roles,
        users: users
      });
    }
  }

  newDashboardOnClick() {
    this.saveAs = DashboardSaveAsEnum.NEW_DASHBOARD;
  }

  saveAsNewDashboard(item: {
    newTitle: string;
    group: string;
    roles: string;
    users: string;
  }) {
    let { newTitle, group, roles, users } = item;

    let dashboardFileText = makeDashboardFileText({
      dashboard: this.dashboard,
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
