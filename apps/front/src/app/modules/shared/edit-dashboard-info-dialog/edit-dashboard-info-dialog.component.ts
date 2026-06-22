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
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { DashboardPart } from '#common/zod/backend/dashboard-part';
import type { Role } from '#common/zod/backend/role';
import type {
  ToBackendSaveModifyDashboardRequestPayload,
  ToBackendSaveModifyDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-save-modify-dashboard';
import type {
  ToBackendGetRolesRequestPayload,
  ToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';
import { setValueAndMark } from '#front/app/functions/set-value-and-mark';
import { DashboardQuery } from '#front/app/queries/dashboard.query';
import { DashboardPartsQuery } from '#front/app/queries/dashboard-parts.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../shared.module';

export interface EditDashboardInfoDialogData {
  apiService: ApiService;
  projectId: string;
  repoId: string;
  repoType: RepoTypeEnum;
  branchId: string;
  envId: string;
  dashboardPart: DashboardPart;
}

@Component({
  selector: 'm-edit-dashboard-info-dialog',
  templateUrl: './edit-dashboard-info-dialog.component.html',
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
export class EditDashboardInfoDialogComponent implements OnInit {
  @ViewChild('editDashboardInfoDialogRoleSelect', { static: false })
  editDashboardInfoDialogRoleSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.editDashboardInfoDialogRoleSelectElement?.close();
    this.ref.close();
  }

  dashboardPath: string;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  roles: Role[] = [];
  selectedAccessRoles: string[] = [];

  constructor(
    public ref: DialogRef<EditDashboardInfoDialogData>,
    private fb: FormBuilder,
    private dashboardPartsQuery: DashboardPartsQuery,
    private dashboardQuery: DashboardQuery,
    private spinner: NgxSpinnerService,
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let parts = this.ref.data.dashboardPart.filePath.split('/');
    parts.shift();
    this.dashboardPath = parts.join(' / ');

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.ref.data.dashboardPart.title
    });

    this.selectedAccessRoles = [
      ...(this.ref.data.dashboardPart.accessRoles || [])
    ];

    this.loadRoles();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    if (this.titleForm.controls['title'].valid) {
      this.spinner.show(APP_SPINNER_NAME);

      this.ref.close();

      let newTitle: string = this.titleForm.controls['title'].value;
      let roles = [...this.selectedAccessRoles];

      let payload: ToBackendSaveModifyDashboardRequestPayload = {
        projectId: this.ref.data.projectId,
        repoId: this.ref.data.repoId,
        branchId: this.ref.data.branchId,
        envId: this.ref.data.envId,
        fromDashboardId: this.ref.data.dashboardPart.dashboardId,
        toDashboardId: this.ref.data.dashboardPart.dashboardId,
        dashboardTitle: newTitle.trim(),
        accessRoles: roles,
        tilesGrid: undefined,
        timezone: this.uiQuery.getValue().timezone
      };

      let apiService: ApiService = this.ref.data.apiService;

      apiService
        .req({
          pathInfoName:
            ToBackendRequestInfoNameEnum.ToBackendSaveModifyDashboard,
          payload: payload,
          showSpinner: true
        })
        .pipe(
          tap(async (resp: ToBackendSaveModifyDashboardResponse) => {
            if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
              let newDashboardPart = resp.payload.newDashboardPart;
              let newDashboard = resp.payload.dashboard;

              if (isDefined(newDashboard)) {
                let dashboardParts =
                  this.dashboardPartsQuery.getValue().dashboardParts;

                let newDashboardParts = [
                  newDashboardPart,
                  ...dashboardParts.filter(
                    x => x.dashboardId !== newDashboardPart.dashboardId
                  )
                ];

                this.dashboardPartsQuery.update({
                  dashboardParts: newDashboardParts
                });

                let currentDashboard = this.dashboardQuery.getValue();

                if (currentDashboard.dashboardId === newDashboard.dashboardId) {
                  this.dashboardQuery.update(newDashboard);
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
