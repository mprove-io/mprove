import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { prepareReport } from '~front/app/functions/prepare-report';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { toYaml } from '~front/app/functions/to-yaml';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { DashboardState } from '~front/app/stores/dashboard.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

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

  dashboardId = common.makeId();

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
    this.dashboard = this.ref.data.dashboard as common.Dashboard;

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

    let reps = this.dashboard.reports.map(x => prepareReport(x.mconfig));

    let dashboardFileText = toYaml({
      dashboard: this.dashboardId,
      title: newTitle.trim(),
      description: common.isDefined(this.dashboard.description)
        ? this.dashboard.description
        : undefined,
      group:
        common.isDefined(group) && group.trim().length > 0
          ? group.trim()
          : undefined,
      access_roles:
        common.isDefined(roles) && roles.trim().length > 0
          ? roles.split(',').map(x => x.trim())
          : undefined,
      access_users:
        common.isDefined(users) && users.trim().length > 0
          ? users.split(',').map(x => x.trim())
          : undefined,
      reports: reps
    });

    let payload: apiToBackend.ToBackendCreateDashboardRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId,
      dashboardId: this.dashboardId,
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
          this.navigateService.navigateToDashboard(this.dashboardId);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
