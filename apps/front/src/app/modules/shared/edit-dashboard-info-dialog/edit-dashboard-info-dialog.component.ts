import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { DashboardPart } from '#common/interfaces/backend/dashboard-part';
import {
  ToBackendSaveModifyDashboardRequestPayload,
  ToBackendSaveModifyDashboardResponse
} from '#common/interfaces/to-backend/dashboards/to-backend-save-modify-dashboard';
import { setValueAndMark } from '#front/app/functions/set-value-and-mark';
import { DashboardQuery } from '#front/app/queries/dashboard.query';
import { DashboardPartsQuery } from '#front/app/queries/dashboard-parts.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../shared.module';

export interface EditDashboardInfoDialogData {
  apiService: ApiService;
  projectId: string;
  isRepoProd: boolean;
  branchId: string;
  envId: string;
  dashboardPart: DashboardPart;
}

@Component({
  selector: 'm-edit-dashboard-info-dialog',
  templateUrl: './edit-dashboard-info-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditDashboardInfoDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  usersFolder = MPROVE_USERS_FOLDER;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<EditDashboardInfoDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private dashboardPartsQuery: DashboardPartsQuery,
    private dashboardQuery: DashboardQuery,
    private spinner: NgxSpinnerService,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.ref.data.dashboardPart.title
    });
    setValueAndMark({
      control: this.rolesForm.controls['roles'],
      value: this.ref.data.dashboardPart.accessRoles?.join(', ')
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    if (
      this.titleForm.controls['title'].valid &&
      this.rolesForm.controls['roles'].valid
    ) {
      this.spinner.show(APP_SPINNER_NAME);

      this.ref.close();

      let uiState = this.uiQuery.getValue();

      let newTitle: string = this.titleForm.controls['title'].value;
      let roles: string = this.rolesForm.controls['roles'].value;

      let payload: ToBackendSaveModifyDashboardRequestPayload = {
        projectId: this.ref.data.projectId,
        isRepoProd: this.ref.data.isRepoProd,
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

  cancel() {
    this.ref.close();
  }
}
