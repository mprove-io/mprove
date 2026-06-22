import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import {
  APP_SPINNER_NAME,
  EMPTY_SPACE,
  EMPTY_SPACE_NAME
} from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { makeCopy } from '#common/functions/make-copy';
import type { ReportX } from '#common/zod/backend/report-x';
import type { Role } from '#common/zod/backend/role';
import type { Space } from '#common/zod/blockml/space';
import type {
  ToBackendSaveCreateReportRequestPayload,
  ToBackendSaveCreateReportResponse
} from '#common/zod/to-backend/reports/to-backend-save-create-report';
import type {
  ToBackendSaveModifyReportRequestPayload,
  ToBackendSaveModifyReportResponse
} from '#common/zod/to-backend/reports/to-backend-save-modify-report';
import type {
  ToBackendGetRolesRequestPayload,
  ToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';
import { upsertReportNode } from '#front/app/functions/report-nodes';
import { setValueAndMark } from '#front/app/functions/set-value-and-mark';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { ReportQuery } from '#front/app/queries/report.query';
import { ReportsQuery } from '#front/app/queries/reports.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';

enum ReportSaveAsEnum {
  NEW_REPORT = 'NEW_REPORT',
  REPLACE_EXISTING_REPORT = 'REPLACE_EXISTING_REPORT'
}

export interface ReportSaveAsDialogData {
  apiService: ApiService;
  reports: ReportX[];
  report: ReportX;
}

type SpaceOption = typeof EMPTY_SPACE;

@Component({
  standalone: false,
  selector: 'm-report-save-as-dialog',
  templateUrl: './report-save-as-dialog.component.html'
})
export class ReportSaveAsDialogComponent implements OnInit {
  @ViewChild('reportSaveAsDialogExistingReportSelect', { static: false })
  reportSaveAsDialogExistingReportSelectElement: NgSelectComponent;

  @ViewChild('reportSaveAsDialogRoleSelect', { static: false })
  reportSaveAsDialogRoleSelectElement: NgSelectComponent;

  @ViewChild('reportSaveAsDialogSpaceSelect', { static: false })
  reportSaveAsDialogSpaceSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.reportSaveAsDialogExistingReportSelectElement?.close();
    this.reportSaveAsDialogRoleSelectElement?.close();
    this.reportSaveAsDialogSpaceSelectElement?.close();
  }

  usersFolder = MPROVE_USERS_FOLDER;
  emptySpaceName = EMPTY_SPACE_NAME;

  reportSaveAsEnum = ReportSaveAsEnum;

  spinnerName = 'reportSaveAs';

  report: ReportX;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  saveAs: ReportSaveAsEnum = ReportSaveAsEnum.NEW_REPORT;

  newReportId: string;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  fromReportId: string;

  selectedReportId: any; // string
  selectedRepPath: string;

  reports: ReportX[];

  roles: Role[] = [];
  selectedAccessRoles: string[] = [];
  selectedSpace: string;
  combinedAccessRoles: string[] = [];
  combinedAccessRolesText = '';
  spacesPlusEmpty: SpaceOption[] = [makeCopy(EMPTY_SPACE)];

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      this.spacesPlusEmpty = this.makeSpacesPlusEmpty({ spaces: x.spaces });
      this.updateCombinedAccessRoles();
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<ReportSaveAsDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private reportQuery: ReportQuery,
    private reportsQuery: ReportsQuery,
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  makeSpacesPlusEmpty(item: { spaces: Space[] }): SpaceOption[] {
    let { spaces } = item;

    let spaceOptions = (spaces ?? []).map(space => ({
      ...space,
      label: this.makeSpaceLabel({ space: space, spaces: spaces ?? [] })
    }));

    return [makeCopy(EMPTY_SPACE), ...spaceOptions];
  }

  makeSpaceLabel(item: { space: Space; spaces: Space[] }) {
    let { space, spaces } = item;
    let parts = space.space.split('.');
    let currentSpace = '';

    return parts
      .map((part, index) => {
        currentSpace = index === 0 ? part : `${currentSpace}.${part}`;

        let foundSpace = spaces.find(x => x.space === currentSpace);

        return foundSpace?.title || part;
      })
      .join(' - ');
  }

  updateCombinedAccessRoles() {
    let selectedSpace = this.struct?.spaces?.find(
      x => x.space === this.selectedSpace
    );

    this.combinedAccessRoles = [
      ...new Set([
        ...(selectedSpace?.accessRolesCombined ?? []),
        ...this.selectedAccessRoles
      ])
    ];
    this.combinedAccessRolesText = this.combinedAccessRoles.join(', ');
  }

  spaceChange() {
    this.updateCombinedAccessRoles();
  }

  accessRolesChange() {
    this.updateCombinedAccessRoles();
  }

  ngOnInit() {
    this.report = this.ref.data.report;
    this.nav = this.navQuery.getValue();

    this.fromReportId = this.ref.data.report.reportId;
    this.newReportId = this.ref.data.report.reportId;

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.report.title
    });

    this.selectedAccessRoles = [...(this.report.accessRoles || [])];
    this.selectedSpace = this.report.space ?? EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();

    this.reports = this.ref.data.reports.map(x => {
      (x as any).disabled = !x.canEditOrDeleteReport;
      return x;
    });

    this.loadRoles();

    this.makePath();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    if (this.titleForm.controls['title'].valid) {
      this.ref.close();

      let newTitle = this.titleForm.controls['title'].value;
      let roles = [...this.selectedAccessRoles];

      if (this.saveAs === ReportSaveAsEnum.NEW_REPORT) {
        this.saveAsNewRep({
          newTitle: newTitle,
          roles: roles
        });
      } else if (this.saveAs === ReportSaveAsEnum.REPLACE_EXISTING_REPORT) {
        this.saveAsExistingRep({
          newTitle: newTitle,
          roles: roles
        });
      }
    }
  }

  newRepOnClick() {
    this.saveAs = ReportSaveAsEnum.NEW_REPORT;
  }

  existingRepOnClick() {
    this.saveAs = ReportSaveAsEnum.REPLACE_EXISTING_REPORT;
  }

  saveAsNewRep(item: { newTitle: string; roles: string[] }) {
    let { newTitle, roles } = item;

    let uiState = this.uiQuery.getValue();

    let payload: ToBackendSaveCreateReportRequestPayload = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      newReportId: this.newReportId,
      fromReportId: this.fromReportId,
      title: newTitle,
      space:
        this.selectedSpace === EMPTY_SPACE_NAME
          ? undefined
          : this.selectedSpace,
      accessRoles: roles,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick,
      newReportFields: this.report.fields,
      chart: this.report.chart
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(APP_SPINNER_NAME);

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveCreateReport,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSaveCreateReportResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let newReport = resp.payload.report;
            let newReportPart = resp.payload.reportPart;

            if (isDefined(newReport)) {
              let reportsState = this.reportsQuery.getValue();

              this.reportsQuery.update({
                reports: [
                  newReportPart,
                  ...reportsState.reports.filter(
                    x =>
                      x.reportId !== newReportPart.reportId &&
                      (x.draft === false || x.reportId !== this.fromReportId)
                  )
                ],
                reportNodes: upsertReportNode({
                  reportNodes: reportsState.reportNodes,
                  report: newReportPart
                }),
                favoriteReportIds: reportsState.favoriteReportIds
              });

              let currentReport = this.reportQuery.getValue();

              if (currentReport.reportId === newReport.reportId) {
                this.reportQuery.update(newReport);
              }

              this.spinner.hide(APP_SPINNER_NAME); // route params do not change

              this.navigateService.navigateToReport({
                reportId: resp.payload.report.reportId
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  saveAsExistingRep(item: { newTitle: string; roles: string[] }) {
    let { newTitle, roles } = item;

    let uiState = this.uiQuery.getValue();

    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendSaveModifyReportRequestPayload = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      modReportId: this.selectedReportId,
      fromReportId: this.fromReportId,
      title: newTitle,
      space:
        this.selectedSpace === EMPTY_SPACE_NAME
          ? undefined
          : this.selectedSpace,
      accessRoles: roles,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick,
      newReportFields: this.report.fields,
      chart: this.report.chart
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSaveModifyReportResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let newReport = resp.payload.report;
            let newReportPart = resp.payload.reportPart;

            if (isDefined(newReport)) {
              let reportsState = this.reportsQuery.getValue();

              this.reportsQuery.update({
                reports: [
                  newReportPart,
                  ...reportsState.reports.filter(
                    x =>
                      x.reportId !== newReportPart.reportId &&
                      (x.draft === false || x.reportId !== this.fromReportId)
                  )
                ],
                reportNodes: upsertReportNode({
                  reportNodes: reportsState.reportNodes,
                  report: newReportPart
                }),
                favoriteReportIds: reportsState.favoriteReportIds
              });

              let currentReport = this.reportQuery.getValue();

              if (currentReport.reportId === newReport.reportId) {
                this.reportQuery.update(newReport);
              }

              this.navigateService.navigateToReport({
                reportId: resp.payload.report.reportId
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  selectedReportChange() {
    this.makePath();
    if (isDefined(this.selectedReportId)) {
      let selectedReport = this.reports.find(
        x => x.reportId === this.selectedReportId
      );
      this.titleForm.controls['title'].setValue(selectedReport.title);
      this.selectedAccessRoles = [...(selectedReport.accessRoles || [])];
      this.selectedSpace = selectedReport.space ?? EMPTY_SPACE.space;
      this.updateCombinedAccessRoles();
      this.cd.detectChanges();
    }
  }

  loadRoles() {
    let payload: ToBackendGetRolesRequestPayload = {
      projectId: this.nav.projectId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetRoles,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetRolesResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let newSortedRoles = resp.payload.roles.sort((a, b) =>
              a.roleId > b.roleId ? 1 : b.roleId > a.roleId ? -1 : 0
            );

            this.roles = newSortedRoles;
            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  makePath() {
    if (isUndefined(this.selectedReportId) || isUndefined(this.reports)) {
      return;
    }

    let selectedReport = this.reports.find(
      x => x.reportId === this.selectedReportId
    );

    if (isDefined(selectedReport)) {
      let parts = selectedReport.filePath.split('/');

      parts.shift();

      this.selectedRepPath = parts.join(' / ');
    }
  }

  cancel() {
    this.ref.close();
  }
}
