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
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeCopy } from '#common/functions/make-copy';
import type { ChartUnit } from '#common/zod/backend/chart-unit';
import type { Role } from '#common/zod/backend/role';
import type { Space } from '#common/zod/blockml/space';
import type {
  ToBackendSaveModifyChartRequestPayload,
  ToBackendSaveModifyChartResponse
} from '#common/zod/to-backend/charts/to-backend-save-modify-chart';
import type {
  ToBackendGetRolesRequestPayload,
  ToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';
import { makeUnitDisplayPath } from '#front/app/functions/make-unit-display-path';
import { setValueAndMark } from '#front/app/functions/set-value-and-mark';
import { ChartQuery } from '#front/app/queries/chart.query';
import { ChartsQuery } from '#front/app/queries/charts.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../shared.module';

export interface EditChartInfoDialogData {
  apiService: ApiService;
  projectId: string;
  repoId: string;
  repoType: RepoTypeEnum;
  branchId: string;
  envId: string;
  chart: ChartUnit;
}

type SpaceOption = typeof EMPTY_SPACE;

@Component({
  selector: 'm-edit-chart-info-dialog',
  templateUrl: './edit-chart-info-dialog.component.html',
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
export class EditChartInfoDialogComponent implements OnInit {
  @ViewChild('editChartInfoDialogRoleSelect', { static: false })
  editChartInfoDialogRoleSelectElement: NgSelectComponent;

  @ViewChild('editChartInfoDialogSpaceSelect', { static: false })
  editChartInfoDialogSpaceSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.editChartInfoDialogRoleSelectElement?.close();
    this.editChartInfoDialogSpaceSelectElement?.close();
    this.ref.close();
  }

  emptySpaceName = EMPTY_SPACE_NAME;
  chartPath: string;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  roles: Role[] = [];
  selectedAccessRoles: string[] = [];
  selectedSpace: string;
  combinedAccessRoles: string[] = [];
  combinedAccessRolesText = '';
  canChangeSpace = false;
  spacesPlusEmpty: SpaceOption[] = [makeCopy(EMPTY_SPACE)];
  struct: StructState;

  constructor(
    public ref: DialogRef<EditChartInfoDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private chartsQuery: ChartsQuery,
    private chartQuery: ChartQuery,
    private memberQuery: MemberQuery,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
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
        ...(selectedSpace?.accessRolesCombined.map(x => x.role) ?? []),
        ...this.selectedAccessRoles
      ])
    ];
    this.combinedAccessRolesText = this.combinedAccessRoles.join(', ');
  }

  spaceChange() {
    this.updateCombinedAccessRoles();
    this.updateChartPath();
  }

  accessRolesChange() {
    this.updateCombinedAccessRoles();
  }

  ngOnInit() {
    let member = this.memberQuery.getValue();

    this.canChangeSpace = member.isAdmin === true || member.isEditor === true;
    this.struct = this.structQuery.getValue();
    this.spacesPlusEmpty = this.makeSpacesPlusEmpty({
      spaces: this.struct.spaces
    });

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.ref.data.chart.title
    });

    this.selectedAccessRoles = [...(this.ref.data.chart.accessRoles || [])];
    this.selectedSpace = this.ref.data.chart.space ?? EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();
    this.updateChartPath();

    this.loadRoles();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  updateChartPath() {
    let alias = this.userQuery.getValue().alias;

    this.chartPath = makeUnitDisplayPath({
      projectId: this.ref.data.projectId,
      mproveDirValue: this.struct.mproveConfig.mproveDirValue,
      userAlias: alias,
      selectedSpace: this.selectedSpace,
      unitId: this.ref.data.chart.chartId,
      filePath: this.ref.data.chart.filePath,
      unitSpace: this.ref.data.chart.space,
      extension: FileExtensionEnum.Chart,
      spaces: this.struct.spaces
    });
  }

  save() {
    if (this.titleForm.controls['title'].valid) {
      this.spinner.show(APP_SPINNER_NAME);

      this.ref.close();

      let newTitle: string = this.titleForm.controls['title'].value;
      let roles = [...this.selectedAccessRoles];

      let uiState = this.uiQuery.getValue();

      let payload: ToBackendSaveModifyChartRequestPayload = {
        projectId: this.ref.data.projectId,
        repoId: this.ref.data.repoId,
        branchId: this.ref.data.branchId,
        envId: this.ref.data.envId,
        fromChartId: this.ref.data.chart.chartId,
        chartId: this.ref.data.chart.chartId,
        tileTitle: newTitle.trim(),
        space:
          this.selectedSpace === EMPTY_SPACE_NAME
            ? undefined
            : this.selectedSpace,
        accessRoles: roles,
        timezone: uiState.timezone
      };

      let apiService: ApiService = this.ref.data.apiService;

      apiService
        .req({
          pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveModifyChart,
          payload: payload,
          showSpinner: true
        })
        .pipe(
          tap(async (resp: ToBackendSaveModifyChartResponse) => {
            if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
              let newChart = resp.payload.chart;

              if (isDefined(newChart)) {
                this.chartsQuery.update({
                  chartUnitDrafts: resp.payload.chartUnitDrafts,
                  chartSpaceNodes: resp.payload.chartSpaceNodes
                });

                let currentChart = this.chartQuery.getValue();

                if (currentChart.chartId === newChart.chartId) {
                  this.chartQuery.update(newChart);
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
