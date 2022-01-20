import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { map, take, tap } from 'rxjs/operators';
import { checkAccessModel } from '~front/app/functions/check-access-model';
import { makeDashboardFileText } from '~front/app/functions/make-dashboard-file-text';
import { makeExtendedFilters } from '~front/app/functions/make-extended-filters';
import { prepareReport } from '~front/app/functions/prepare-report';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { toYaml } from '~front/app/functions/to-yaml';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsListQuery } from '~front/app/queries/models-list.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import {
  DashboardState,
  ReportWithMconfigAndQuery
} from '~front/app/stores/dashboard.store';
import { NavState } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import {
  DashboardExtended,
  ExtendedReport
} from '../../dashboards/dashboards.component';

enum ChartSaveAsEnum {
  NEW_VIZ = 'NEW_VIZ',
  REPORT_OF_DASHBOARD = 'REPORT_OF_DASHBOARD'
}

enum ReportSaveAsEnum {
  NEW_REPORT = 'NEW_REPORT',
  REPLACE_EXISTING_REPORT = 'REPLACE_EXISTING_REPORT'
}

@Component({
  selector: 'm-chart-save-as-dialog',
  templateUrl: './chart-save-as-dialog.component.html'
})
export class ChartSaveAsDialogComponent implements OnInit {
  chartSaveAsEnum = ChartSaveAsEnum;
  reportSaveAsEnum = ReportSaveAsEnum;

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

  chartSaveAs: ChartSaveAsEnum = ChartSaveAsEnum.NEW_VIZ;
  reportSaveAs: ReportSaveAsEnum = ReportSaveAsEnum.NEW_REPORT;

  vizId = common.makeId();

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  selectedDashboardId: string;
  selectedDashboardPath: string;
  selectedDashboard: DashboardExtended;

  selectedMconfigId: string;

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
    private navQuery: NavQuery,
    private memberQuery: MemberQuery,
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
    if (this.titleForm.controls['title'].valid) {
      let newTitle = this.titleForm.controls['title'].value;

      if (
        this.chartSaveAs === ChartSaveAsEnum.NEW_VIZ &&
        this.groupForm.controls['group'].valid &&
        this.rolesForm.controls['roles'].valid &&
        this.usersForm.controls['users'].valid
      ) {
        this.ref.close();
        let group = this.groupForm.controls['group'].value;
        let roles = this.rolesForm.controls['roles'].value;
        let users = this.usersForm.controls['users'].value;

        this.saveAsNewViz({
          newTitle: newTitle,
          group: group,
          roles: roles,
          users: users
        });
      } else if (this.chartSaveAs === ChartSaveAsEnum.REPORT_OF_DASHBOARD) {
        this.ref.close();
        this.saveAsReport({ newTitle: newTitle });
      }
    }
  }

  newVizOnClick() {
    this.chartSaveAs = ChartSaveAsEnum.NEW_VIZ;
  }

  reportOfDashboardOnClick() {
    this.chartSaveAs = ChartSaveAsEnum.REPORT_OF_DASHBOARD;
  }

  newReportOnClick() {
    this.reportSaveAs = ReportSaveAsEnum.NEW_REPORT;
  }

  replaceExistingReportOnClick() {
    this.reportSaveAs = ReportSaveAsEnum.REPLACE_EXISTING_REPORT;
  }

  selectedDashboardChange() {
    this.selectedMconfigId = undefined;
    this.setSelectedDashboard();
    this.makePath();
  }

  selectedReportChange() {}

  setSelectedDashboard() {
    if (
      common.isUndefined(this.selectedDashboardId) ||
      common.isUndefined(this.dashboards)
    ) {
      return;
    }

    this.selectedDashboard = this.dashboards.find(
      x => x.dashboardId === this.selectedDashboardId
    );
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

  async saveAsReport(item: { newTitle: string }) {
    let { newTitle } = item;

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(
        tap(x => {
          nav = x;
        }),
        take(1)
      )
      .subscribe();

    let payloadGetDashboard: apiToBackend.ToBackendGetDashboardRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      isRepoProd: nav.isRepoProd,
      dashboardId: this.selectedDashboardId
    };

    let apiService: ApiService = this.ref.data.apiService;

    let dashboard: DashboardState = await apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard,
        payloadGetDashboard
      )
      .pipe(
        map((resp: apiToBackend.ToBackendGetDashboardResponse) => {
          let z: DashboardState = Object.assign({}, resp.payload.dashboard, {
            extendedFilters: makeExtendedFilters(resp.payload.dashboard)
          });

          z.reports.forEach(x => {
            x.mconfig = resp.payload.dashboardMconfigs.find(
              m => m.mconfigId === x.mconfigId
            );
            x.query = resp.payload.dashboardQueries.find(
              q => q.queryId === x.queryId
            );
          });

          return z;
        })
      )
      .toPromise();

    let tileY = 0;

    dashboard.reports.forEach(report => {
      tileY = tileY + report.tileHeight;
    });

    let newReport: ReportWithMconfigAndQuery = {
      mconfig: this.ref.data.mconfig,
      query: this.ref.data.query,
      modelId: this.ref.data.mconfig.modelId,
      modelLabel: this.ref.data.model.label,
      mconfigId: this.ref.data.mconfig.mconfigId,
      queryId: this.ref.data.mconfig.queryId,
      title: newTitle.trim(),
      tileWidth: common.CHART_DEFAULT_TILE_WIDTH,
      tileHeight: common.CHART_DEFAULT_TILE_HEIGHT,
      tileX: common.CHART_DEFAULT_TILE_X,
      tileY: tileY
    };

    newReport.mconfig.chart.title = newReport.title;
    delete newReport.mconfig.listen;

    if (this.reportSaveAs === ReportSaveAsEnum.REPLACE_EXISTING_REPORT) {
      let oldReportIndex = dashboard.reports.findIndex(
        x => x.mconfigId === this.selectedMconfigId
      );

      let oldReport = dashboard.reports[oldReportIndex];

      newReport.tileWidth = oldReport.tileWidth;
      newReport.tileHeight = oldReport.tileHeight;
      newReport.tileX = oldReport.tileX;
      newReport.tileY = oldReport.tileY;

      dashboard.reports[oldReportIndex] = newReport;
    } else {
      dashboard.reports = [...dashboard.reports, newReport];
    }

    let dashboardFileText = makeDashboardFileText({
      dashboard: dashboard,
      newDashboardId: this.selectedDashboardId,
      newTitle: dashboard.title,
      group: dashboard.gr,
      roles: dashboard.accessRoles.join(', '),
      users: dashboard.accessUsers.join(', ')
    });

    let payloadModifyDashboard: apiToBackend.ToBackendModifyDashboardRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId,
      dashboardId: this.selectedDashboardId,
      dashboardFileText: dashboardFileText
    };

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyDashboard,
        payloadModifyDashboard
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendModifyDashboardResponse) => {
          this.navigateService.navigateToDashboard(this.selectedDashboardId);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
