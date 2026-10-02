import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import {
  APP_SPINNER_NAME,
  EMPTY_SPACE,
  EMPTY_SPACE_NAME
} from '#common/constants/top-front';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { ReportUnit } from '#common/types/backend/parts/report-unit';
import type { ReportX } from '#common/types/backend/parts/report-x';
import type { Role } from '#common/types/backend/parts/role';
import type { ToBackendSaveCreateReportRequest } from '#common/types/backend/routes/reports/save-create-report/save-create-report-request';
import type { ToBackendSaveCreateReportResponse } from '#common/types/backend/routes/reports/save-create-report/save-create-report-response';
import type { ToBackendSaveModifyReportRequest } from '#common/types/backend/routes/reports/save-modify-report/save-modify-report-request';
import type { ToBackendSaveModifyReportResponse } from '#common/types/backend/routes/reports/save-modify-report/save-modify-report-response';
import type { ToBackendGetRolesRequest } from '#common/types/backend/routes/roles/get-roles/get-roles-request';
import type { ToBackendGetRolesResponse } from '#common/types/backend/routes/roles/get-roles/get-roles-response';
import type { Space } from '#common/types/blockml/parts/space';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';
import { makeUnitDisplayPath } from '#front/app/functions/make-unit-display-path';
import { setValueAndMark } from '#front/app/functions/set-value-and-mark';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery } from '#front/app/queries/nav.query';
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
  reports: ReportUnit[];
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

  emptySpaceName = EMPTY_SPACE_NAME;

  reportSaveAsEnum = ReportSaveAsEnum;

  spinnerName = 'reportSaveAs';

  report: ReportX;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  saveAs: ReportSaveAsEnum = ReportSaveAsEnum.NEW_REPORT;

  newReportId: string;

  fromReportId: string;
  newReportPath: string;

  selectedReportId: any; // string
  selectedRepPath: string;

  reports: ReportUnit[];

  roles: Role[] = [];
  selectedAccessRoles: string[] = [];
  selectedSpace: string;
  combinedAccessRoles: AccessRoleCombined[] = [];
  spacesPlusEmpty: SpaceOption[] = [makeCopy(EMPTY_SPACE)];
  canSpecifyReportSpace = false;

  struct: StructState;

  constructor(
    public ref: DialogRef<ReportSaveAsDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private memberQuery: MemberQuery,
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

    let combinedAccessRoles = (selectedSpace?.accessRolesCombined ?? []).map(
      x => ({
        role: x.role,
        isDirect: false
      })
    );

    this.selectedAccessRoles.forEach(role => {
      let existingRole = combinedAccessRoles.find(x => x.role === role);

      if (existingRole) {
        existingRole.isDirect = true;
      } else {
        combinedAccessRoles.push({ role: role, isDirect: true });
      }
    });

    this.combinedAccessRoles = combinedAccessRoles;
  }

  spaceChange() {
    this.updateCombinedAccessRoles();
    this.updatePaths();
  }

  accessRolesChange() {
    this.updateCombinedAccessRoles();
  }

  ngOnInit() {
    this.report = this.ref.data.report;

    let member = this.memberQuery.getValue();

    this.canSpecifyReportSpace =
      member.isAdmin === true || member.isEditor === true;

    this.struct = this.structQuery.getValue();

    this.spacesPlusEmpty = this.makeSpacesPlusEmpty({
      spaces: this.struct.spaces
    });

    this.fromReportId = this.ref.data.report.reportId;
    this.newReportId = this.ref.data.report.reportId;

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.report.title
    });

    this.selectedAccessRoles = [...(this.report.accessRoles || [])];
    this.selectedSpace = this.report.space ?? EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();

    let userAlias = this.userQuery.getValue().alias;

    let availableReports =
      this.canSpecifyReportSpace === true
        ? this.ref.data.reports
        : this.ref.data.reports.filter(x => x.author === userAlias);

    this.reports = availableReports.map(x => {
      (x as any).disabled = !x.canEditOrDeleteReport;
      return x;
    });

    this.loadRoles();

    this.updatePaths();

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
    this.selectedAccessRoles = [];
    this.selectedSpace = EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();
    this.updatePaths();
  }

  existingRepOnClick() {
    this.saveAs = ReportSaveAsEnum.REPLACE_EXISTING_REPORT;
    this.selectedReportId = undefined;
    this.selectedRepPath = '';
    this.selectedAccessRoles = [];
    this.selectedSpace = EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();
    this.updatePaths();
  }

  existingReportSearchFn(term: string, report: ReportUnit) {
    let trimmedTerm = term?.trim();

    if (!trimmedTerm) {
      return true;
    }

    let haystack = [
      `${isDefined(report.title) ? report.title : report.reportId} ${report.author ?? ''}`
    ];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, trimmedTerm);

    return idxs != null && idxs.length > 0;
  }

  saveAsNewRep(item: { newTitle: string; roles: string[] }) {
    let { newTitle, roles } = item;

    let nav = this.navQuery.getValue();
    let uiState = this.uiQuery.getValue();

    let payload: ToBackendSaveCreateReportRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
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
        route: 'api/ToBackendSaveCreateReport',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSaveCreateReportResponse) => {
          if (resp?.type === 'Success') {
            if (isUndefined(resp.output.reportSpaceNodes)) {
              this.spinner.hide(APP_SPINNER_NAME);
              return;
            }

            let newReport = resp.output.report;

            if (isDefined(newReport)) {
              this.reportsQuery.update({
                reportUnitDrafts: resp.output.reportUnitDrafts,
                reportSpaceNodes: resp.output.reportSpaceNodes
              });

              let currentReport = this.reportQuery.getValue();

              if (currentReport.reportId === newReport.reportId) {
                this.reportQuery.update(newReport);
              }

              this.spinner.hide(APP_SPINNER_NAME); // route params do not change

              this.navigateService.navigateToReport({
                reportId: resp.output.report.reportId
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

    let nav = this.navQuery.getValue();
    let uiState = this.uiQuery.getValue();

    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendSaveModifyReportRequest['input'] = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
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
        route: 'api/ToBackendSaveModifyReport',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSaveModifyReportResponse) => {
          if (resp?.type === 'Success') {
            if (isUndefined(resp.output.reportSpaceNodes)) {
              this.spinner.hide(APP_SPINNER_NAME);
              return;
            }

            let newReport = resp.output.report;

            if (isDefined(newReport)) {
              this.reportsQuery.update({
                reportUnitDrafts: resp.output.reportUnitDrafts,
                reportSpaceNodes: resp.output.reportSpaceNodes
              });

              let currentReport = this.reportQuery.getValue();

              if (currentReport.reportId === newReport.reportId) {
                this.reportQuery.update(newReport);
              }

              this.navigateService.navigateToReport({
                reportId: resp.output.report.reportId
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  selectedReportChange() {
    if (isDefined(this.selectedReportId)) {
      let selectedReport = this.reports.find(
        x => x.reportId === this.selectedReportId
      );
      this.titleForm.controls['title'].setValue(selectedReport.title);
      this.selectedAccessRoles = [...(selectedReport.accessRoles || [])];
      this.selectedSpace = selectedReport.space ?? EMPTY_SPACE.space;
      this.updateCombinedAccessRoles();
      this.updatePaths();
      this.cd.detectChanges();
    }
  }

  loadRoles() {
    let nav = this.navQuery.getValue();

    let payload: ToBackendGetRolesRequest['input'] = {
      projectId: nav.projectId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendGetRoles',
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetRolesResponse) => {
          if (resp?.type === 'Success') {
            let newSortedRoles = resp.output.roles.sort((a, b) =>
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

  updatePaths() {
    let alias = this.userQuery.getValue().alias;
    let nav = this.navQuery.getValue();

    this.newReportPath = makeUnitDisplayPath({
      projectId: nav.projectId,
      mproveDirValue: this.struct.mproveConfig.mproveDirValue,
      userAlias: alias,
      selectedSpace: this.selectedSpace,
      unitId: this.newReportId,
      filePath: undefined,
      unitSpace: EMPTY_SPACE_NAME,
      extension: FileExtensionEnum.Report,
      spaces: this.struct.spaces
    });

    if (isUndefined(this.selectedReportId) || isUndefined(this.reports)) {
      this.selectedRepPath = '';
      return;
    }

    let selectedReport = this.reports.find(
      x => x.reportId === this.selectedReportId
    );

    if (isDefined(selectedReport)) {
      this.selectedRepPath = makeUnitDisplayPath({
        projectId: nav.projectId,
        mproveDirValue: this.struct.mproveConfig.mproveDirValue,
        userAlias: alias,
        selectedSpace: this.selectedSpace,
        unitId: selectedReport.reportId,
        filePath: selectedReport.filePath,
        unitSpace: selectedReport.space,
        extension: FileExtensionEnum.Report,
        spaces: this.struct.spaces
      });
    }
  }

  cancel() {
    this.ref.close();
  }
}
