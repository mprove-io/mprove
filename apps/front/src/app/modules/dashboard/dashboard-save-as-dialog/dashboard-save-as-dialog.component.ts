import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { checkAccessModel } from '~front/app/functions/check-access-model';
import { makeDashboardFileText } from '~front/app/functions/make-dashboard-file-text';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsListQuery } from '~front/app/queries/models-list.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { DashboardState } from '~front/app/stores/dashboard.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import {
  DashboardExtended,
  ExtendedReport
} from '../../dashboards/dashboards.component';

enum DashboardSaveAsEnum {
  NEW_DASHBOARD = 'NEW_DASHBOARD',
  REPLACE_EXISTING_DASHBOARD = 'REPLACE_EXISTING_DASHBOARD'
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

  selectedDashboardId: string;
  selectedDashboardPath: string;

  dashboards: DashboardExtended[];
  dashboards$ = this.dashboardsQuery.select().pipe(
    tap(x => {
      this.dashboards = x.dashboards;

      let member: common.Member;
      this.memberQuery
        .select()
        .pipe()
        .subscribe(y => {
          member = y;
        });

      this.modelsListQuery
        .select()
        .pipe(take(1))
        .subscribe(ml => {
          this.dashboards = this.dashboards.map(d => {
            let dashboardFilePathArray = d.filePath.split('/');

            let author =
              dashboardFilePathArray.length > 1 &&
              dashboardFilePathArray[1] === common.BLOCKML_USERS_FOLDER
                ? dashboardFilePathArray[2]
                : undefined;

            let dashboardExtended: DashboardExtended = Object.assign({}, d, <
              DashboardExtended
            >{
              author: author,
              canEditOrDeleteDashboard:
                member.isEditor || member.isAdmin || author === member.alias,
              reports: d.reports.map(report => {
                let extendedReport: ExtendedReport = Object.assign({}, report, <
                  ExtendedReport
                >{
                  hasAccessToModel: checkAccessModel({
                    member: member,
                    model: ml.allModelsList.find(
                      m => m.modelId === report.modelId
                    )
                  })
                });
                return extendedReport;
              })
            });

            return dashboardExtended;
          });

          this.dashboards = this.dashboards.filter(
            z => z.canEditOrDeleteDashboard === true
          );

          this.makePath();

          // let allGroups = this.vizs.map(z => z.gr);
          // let definedGroups = allGroups.filter(y => common.isDefined(y));
          // this.groups = [...new Set(definedGroups)];

          this.cd.detectChanges();
        });
    })
  );

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navigateService: NavigateService,
    private dashboardsQuery: DashboardsQuery,
    private modelsListQuery: ModelsListQuery,
    private memberQuery: MemberQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dashboard = this.ref.data.dashboard as DashboardExtended;

    this.selectedDashboardId =
      this.dashboard.temp === false ? this.dashboard.dashboardId : undefined;

    this.makePath();

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

      if (this.saveAs === DashboardSaveAsEnum.NEW_DASHBOARD) {
        this.saveAsNewDashboard({
          newTitle: newTitle,
          group: group,
          roles: roles,
          users: users
        });
      } else if (
        this.saveAs === DashboardSaveAsEnum.REPLACE_EXISTING_DASHBOARD
      ) {
        this.saveAsExistingDashboard({
          newTitle: newTitle,
          group: group,
          roles: roles,
          users: users
        });
      }
    }
  }

  newDashboardOnClick() {
    this.saveAs = DashboardSaveAsEnum.NEW_DASHBOARD;
  }

  existingDashboardOnClick() {
    this.saveAs = DashboardSaveAsEnum.REPLACE_EXISTING_DASHBOARD;
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
          this.navigateService.navigateToDashboards({
            extra: {
              queryParams: { search: this.newDashboardId }
            }
          });
        }),
        take(1)
      )
      .subscribe();
  }

  saveAsExistingDashboard(item: {
    newTitle: string;
    group: string;
    roles: string;
    users: string;
  }) {
    let { newTitle, group, roles, users } = item;

    let dashboardFileText = makeDashboardFileText({
      dashboard: this.dashboard,
      newDashboardId: this.selectedDashboardId,
      newTitle: newTitle,
      group: group,
      roles: roles,
      users: users
    });

    let payload: apiToBackend.ToBackendModifyDashboardRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId,
      dashboardId: this.selectedDashboardId,
      dashboardFileText: dashboardFileText
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyDashboard,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendModifyDashboardResponse) => {
          this.navigateService.navigateToDashboards({
            extra: {
              queryParams: { search: this.selectedDashboardId }
            }
          });
        }),
        take(1)
      )
      .subscribe();
  }

  selectedChange() {
    this.makePath();
  }

  makePath() {
    if (
      common.isUndefined(this.selectedDashboardId) ||
      common.isUndefined(this.dashboards)
    ) {
      return;
    }

    let selectedDashboard = this.dashboards.find(
      x => x.dashboardId === this.selectedDashboardId
    );

    if (common.isDefined(selectedDashboard)) {
      let parts = selectedDashboard.filePath.split('/');

      parts.shift();

      this.selectedDashboardPath = parts.join(' / ');
    }
  }

  cancel() {
    this.ref.close();
  }
}
