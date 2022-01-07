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
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

enum ChartSaveAsEnum {
  NEW_VIZ = 'NEW_VIZ',
  REPLACE_EXISTING_VIZ = 'REPLACE_EXISTING_VIZ',
  NEW_REPORT_OF_NEW_DASHBOARD = 'NEW_REPORT_OF_NEW_DASHBOARD',
  NEW_REPORT_OF_EXISTING_DASHBOARD = 'NEW_REPORT_OF_EXISTING_DASHBOARD',
  REPLACE_REPORT_OF_EXISTING_DASHBOARD = 'REPLACE_REPORT_OF_EXISTING_DASHBOARD'
}

@Component({
  selector: 'm-chart-save-as-dialog',
  templateUrl: './chart-save-as-dialog.component.html'
})
export class ChartSaveAsDialogComponent implements OnInit {
  chartSaveAsEnum = ChartSaveAsEnum;

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

  saveAs: ChartSaveAsEnum = ChartSaveAsEnum.NEW_VIZ;

  vizId = common.makeId();

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
    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.ref.data.mconfig.chart.title
    });
    setValueAndMark({
      control: this.rolesForm.controls['roles'],
      value: this.ref.data.model.accessRoles?.join(', ')
    });
    setValueAndMark({
      control: this.usersForm.controls['users'],
      value: this.ref.data.model.accessUsers?.join(', ')
    });
  }

  save() {
    if (
      this.saveAs === ChartSaveAsEnum.NEW_VIZ &&
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

      this.saveAsNewViz({
        newTitle: newTitle,
        group: group,
        roles: roles,
        users: users
      });
    }
  }

  newVizOnClick() {
    this.saveAs = ChartSaveAsEnum.NEW_VIZ;
  }

  saveAsNewViz(item: {
    newTitle: string;
    group: string;
    roles: string;
    users: string;
  }) {
    let { newTitle, group, roles, users } = item;

    let rep = prepareReport({
      isForDashboard: false,
      mconfig: this.ref.data.mconfig
    });

    rep.title = newTitle.trim();

    let vizFileText = toYaml({
      viz: this.vizId,
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
      reports: [rep]
    });

    let payload: apiToBackend.ToBackendCreateVizRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId,
      vizId: this.vizId,
      vizFileText: vizFileText
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateViz,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateVizResponse) => {
          this.navigateService.navigateToVizs({
            extra: {
              queryParams: { search: resp.payload.viz.vizId }
            }
          });
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
