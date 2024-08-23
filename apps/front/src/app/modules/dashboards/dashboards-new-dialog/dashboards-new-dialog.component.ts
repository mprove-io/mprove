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
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { SharedModule } from '../../shared/shared.module';

export interface DashboardsNewDialogData {
  apiService: ApiService;
}

@Component({
  selector: 'm-dashboards-new-dialog',
  templateUrl: './dashboards-new-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class DashboardsNewDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('dashboardTitle') dashboardTitleElement: ElementRef;

  usersFolder = common.MPROVE_USERS_FOLDER;

  dashboard: common.DashboardX;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.maxLength(255)]]
  });

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  usersForm: FormGroup = this.fb.group({
    users: [undefined, [Validators.maxLength(255)]]
  });

  newDashboardId = common.makeId();

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
    public ref: DialogRef<DashboardsNewDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navigateService: NavigateService,
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
      this.rolesForm.controls['roles'].valid &&
      this.usersForm.controls['users'].valid
    ) {
      this.ref.close();

      let newTitle = this.titleForm.controls['title'].value;
      let roles = this.rolesForm.controls['roles'].value;
      let users = this.usersForm.controls['users'].value;

      this.createDashboard({
        newTitle: newTitle,
        roles: roles,
        users: users
      });
    }
  }

  createDashboard(item: { newTitle: string; roles: string; users: string }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { newTitle, roles, users } = item;

    let payload: apiToBackend.ToBackendCreateDashboardRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      newDashboardId: this.newDashboardId,
      dashboardTitle: newTitle,
      accessRoles: roles,
      accessUsers: users
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateDashboardResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.navigateService.navigateToDashboard(this.newDashboardId);
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
