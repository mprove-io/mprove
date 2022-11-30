import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { StructQuery } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { StructState } from '~front/app/stores/struct.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface EditVizInfoDialogData {
  apiService: ApiService;
  projectId: string;
  isRepoProd: boolean;
  branchId: string;
  envId: string;
  mconfig: common.MconfigX;
  viz: common.Viz;
}

@Component({
  selector: 'm-edit-viz-info-dialog',
  templateUrl: './edit-viz-info-dialog.component.html'
})
export class EditVizInfoDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  usersFolder = common.MPROVE_USERS_FOLDER;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  usersForm: FormGroup = this.fb.group({
    users: [undefined, [Validators.maxLength(255)]]
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
    public ref: DialogRef<EditVizInfoDialogData>,
    private fb: FormBuilder,
    private router: Router,
    private userQuery: UserQuery,
    private spinner: NgxSpinnerService,
    private structQuery: StructQuery,
    private cd: ChangeDetectorRef,
    private navigateService: NavigateService
  ) {}

  ngOnInit() {
    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.ref.data.mconfig.chart.title
    });
    setValueAndMark({
      control: this.rolesForm.controls['roles'],
      value: this.ref.data.viz.accessRoles?.join(', ')
    });
    setValueAndMark({
      control: this.usersForm.controls['users'],
      value: this.ref.data.viz.accessUsers?.join(', ')
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    if (
      this.titleForm.controls['title'].valid &&
      this.rolesForm.controls['roles'].valid &&
      this.usersForm.controls['users'].valid
    ) {
      this.spinner.show(constants.APP_SPINNER_NAME);

      this.ref.close();

      let newTitle: string = this.titleForm.controls['title'].value;
      let roles: string = this.rolesForm.controls['roles'].value;
      let users: string = this.usersForm.controls['users'].value;

      let payload: apiToBackend.ToBackendModifyVizRequestPayload = {
        projectId: this.ref.data.projectId,
        isRepoProd: this.ref.data.isRepoProd,
        branchId: this.ref.data.branchId,
        envId: this.ref.data.envId,
        vizId: this.ref.data.viz.vizId,
        reportTitle: newTitle.trim(),
        accessRoles: roles,
        accessUsers: users,
        mconfig: this.ref.data.mconfig
      };

      let apiService: ApiService = this.ref.data.apiService;

      apiService
        .req({
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyViz,
          payload: payload
        })
        .pipe(
          tap(async (resp: apiToBackend.ToBackendModifyVizResponse) => {
            if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
              this.navigateService.reloadVizs();
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
