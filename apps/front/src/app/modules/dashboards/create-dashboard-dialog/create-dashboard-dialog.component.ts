import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
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
import { makeId } from '#common/functions/make-id';
import { DashboardX } from '#common/interfaces/backend/dashboard-x';
import {
  ToBackendSaveCreateDashboardRequestPayload,
  ToBackendSaveCreateDashboardResponse
} from '#common/interfaces/to-backend/dashboards/to-backend-save-create-dashboard';
import { DashboardPartsQuery } from '#front/app/queries/dashboard-parts.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SharedModule } from '../../shared/shared.module';

export interface CreateDashboardDialogData {
  apiService: ApiService;
}

@Component({
  selector: 'm-create-dashboard-dialog',
  templateUrl: './create-dashboard-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class CreateDashboardDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('dashboardTitle') dashboardTitleElement: ElementRef;

  usersFolder = MPROVE_USERS_FOLDER;

  dashboard: DashboardX;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.maxLength(255)]]
  });

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  newDashboardId = makeId();

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

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
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<CreateDashboardDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private uiQuery: UiQuery,
    private navigateService: NavigateService,
    private dashboardPartsQuery: DashboardPartsQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.dashboardTitleElement.nativeElement.focus();
    }, 0);
  }

  create() {
    this.titleForm.markAllAsTouched();

    if (!this.titleForm.valid) {
      return;
    }

    if (
      this.titleForm.controls['title'].valid &&
      this.rolesForm.controls['roles'].valid
    ) {
      this.ref.close();

      let newTitle = this.titleForm.controls['title'].value;
      let roles = this.rolesForm.controls['roles'].value;

      this.createDashboard({
        newTitle: newTitle,
        roles: roles
      });
    }
  }

  createDashboard(item: { newTitle: string; roles: string }) {
    this.spinner.show(APP_SPINNER_NAME);

    let { newTitle, roles } = item;

    let payload: ToBackendSaveCreateDashboardRequestPayload = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      newDashboardId: this.newDashboardId,
      dashboardTitle: newTitle,
      accessRoles: roles,
      timezone: this.uiQuery.getValue().timezone
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveCreateDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSaveCreateDashboardResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let dashboardPart = resp.payload.newDashboardPart;
            if (isDefined(dashboardPart)) {
              let dashboardParts =
                this.dashboardPartsQuery.getValue().dashboardParts;

              let newDashboardParts = [
                dashboardPart,
                ...dashboardParts.filter(
                  d =>
                    d.dashboardId !== dashboardPart.dashboardId &&
                    !(
                      d.draft === true &&
                      d.dashboardId === this.dashboard.dashboardId
                    )
                )
              ];

              this.dashboardPartsQuery.update({
                dashboardParts: newDashboardParts
              });

              this.navigateService.navigateToDashboard({
                dashboardId: this.newDashboardId
              });
            } else {
              this.spinner.hide(APP_SPINNER_NAME);
            }
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
