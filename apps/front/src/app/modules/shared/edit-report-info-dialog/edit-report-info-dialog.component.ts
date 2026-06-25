import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import {
  APP_SPINNER_NAME,
  EMPTY_SPACE,
  EMPTY_SPACE_NAME
} from '#common/constants/top-front';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { makeCopy } from '#common/functions/make-copy';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { Role } from '#common/zod/backend/role';
import type { Space } from '#common/zod/blockml/space';
import type {
  ToBackendSaveModifyReportRequestPayload,
  ToBackendSaveModifyReportResponse
} from '#common/zod/to-backend/reports/to-backend-save-modify-report';
import type {
  ToBackendGetRolesRequestPayload,
  ToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';
import { makeReportDisplayPath } from '#front/app/functions/make-report-display-path';
import { setValueAndMark } from '#front/app/functions/set-value-and-mark';
import { ReportQuery } from '#front/app/queries/report.query';
import { ReportsQuery } from '#front/app/queries/reports.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../shared.module';

export interface EditReportInfoDialogData {
  apiService: ApiService;
  projectId: string;
  repoId: string;
  repoType: RepoTypeEnum;
  branchId: string;
  envId: string;
  report: ReportUnit;
}

type SpaceOption = typeof EMPTY_SPACE;

@Component({
  selector: 'm-edit-report-info-dialog',
  templateUrl: './edit-report-info-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    TippyDirective
  ]
})
export class EditReportInfoDialogComponent implements OnInit {
  @ViewChild('editReportInfoDialogRoleSelect', { static: false })
  editReportInfoDialogRoleSelectElement: NgSelectComponent;

  @ViewChild('editReportInfoDialogSpaceSelect', { static: false })
  editReportInfoDialogSpaceSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.editReportInfoDialogRoleSelectElement?.close();
    this.editReportInfoDialogSpaceSelectElement?.close();
    this.ref.close();
  }

  emptySpaceName = EMPTY_SPACE_NAME;
  selectedRepPath: string;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  roles: Role[] = [];
  selectedAccessRoles: string[] = [];
  selectedSpace: string;
  combinedAccessRoles: string[] = [];
  combinedAccessRolesText = '';
  spacesPlusEmpty: SpaceOption[] = [makeCopy(EMPTY_SPACE)];

  struct: StructState;

  constructor(
    public ref: DialogRef<EditReportInfoDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private reportsQuery: ReportsQuery,
    private reportQuery: ReportQuery,
    private spinner: NgxSpinnerService,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
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
    this.updateSelectedReportPath();
  }

  accessRolesChange() {
    this.updateCombinedAccessRoles();
  }

  ngOnInit() {
    this.struct = this.structQuery.getValue();
    this.spacesPlusEmpty = this.makeSpacesPlusEmpty({
      spaces: this.struct.spaces
    });

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.ref.data.report.title
    });

    this.selectedAccessRoles = [...(this.ref.data.report.accessRoles || [])];
    this.selectedSpace = this.ref.data.report.space ?? EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();
    this.updateSelectedReportPath();

    this.loadRoles();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  updateSelectedReportPath() {
    let alias = this.userQuery.getValue().alias;

    this.selectedRepPath = makeReportDisplayPath({
      projectId: this.ref.data.projectId,
      mproveDirValue: this.struct.mproveConfig.mproveDirValue,
      userAlias: alias,
      selectedSpace: this.selectedSpace,
      reportId: this.ref.data.report.reportId,
      filePath: this.ref.data.report.filePath,
      reportSpace: this.ref.data.report.space,
      spaces: this.struct.spaces
    });
  }

  save() {
    if (this.titleForm.controls['title'].valid) {
      this.spinner.show(APP_SPINNER_NAME);

      this.ref.close();

      let uiState = this.uiQuery.getValue();

      let newTitle: string = this.titleForm.controls['title'].value;
      let roles = [...this.selectedAccessRoles];

      let payload: ToBackendSaveModifyReportRequestPayload = {
        projectId: this.ref.data.projectId,
        repoId: this.ref.data.repoId,
        branchId: this.ref.data.branchId,
        envId: this.ref.data.envId,
        fromReportId: this.ref.data.report.reportId,
        modReportId: this.ref.data.report.reportId,
        title: newTitle.trim(),
        space:
          this.selectedSpace === EMPTY_SPACE_NAME
            ? undefined
            : this.selectedSpace,
        accessRoles: roles,
        timezone: uiState.timezone,
        timeSpec: uiState.timeSpec,
        timeRangeFractionBrick: uiState.timeRangeFraction.brick,
        newReportFields: undefined,
        chart: undefined
      };

      let apiService: ApiService = this.ref.data.apiService;

      apiService
        .req({
          pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport,
          payload: payload,
          showSpinner: true
        })
        .pipe(
          tap(async (resp: ToBackendSaveModifyReportResponse) => {
            if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
              if (isUndefined(resp.payload.reportSpaceNodes)) {
                this.spinner.hide(APP_SPINNER_NAME);
                return;
              }

              let newReport = resp.payload.report;

              if (isDefined(newReport)) {
                this.reportsQuery.update({
                  reportUnitDrafts: resp.payload.reportUnitDrafts,
                  reportSpaceNodes: resp.payload.reportSpaceNodes
                });

                let currentReport = this.reportQuery.getValue();

                if (currentReport.reportId === newReport.reportId) {
                  this.reportQuery.update(newReport);
                }
              }
            }
          }),
          take(1)
        )
        .subscribe();
    }
  }

  loadRoles() {
    let payload: ToBackendGetRolesRequestPayload = {
      projectId: this.ref.data.projectId
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
            this.roles = resp.payload.roles.sort((a, b) =>
              a.roleId > b.roleId ? 1 : b.roleId > a.roleId ? -1 : 0
            );
            this.cd.detectChanges();
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
