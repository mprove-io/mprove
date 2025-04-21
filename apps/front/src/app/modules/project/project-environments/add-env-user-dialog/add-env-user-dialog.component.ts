import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
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
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { map, take, tap } from 'rxjs/operators';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface AddEnvUserDialogData {
  apiService: ApiService;
  env: common.Env;
}

@Component({
  selector: 'm-add-env-user-dialog',
  templateUrl: './add-env-user-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, NgSelectModule]
})
export class AddEnvUserDialogComponent implements OnInit {
  @ViewChild('addEnvUserDialogEnvSelect', { static: false })
  addEnvUserDialogEnvSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.addEnvUserDialogEnvSelectElement?.close();
    // this.ref.close();
  }

  addEnvUserForm: FormGroup;

  env = this.ref.data.env;

  membersList: common.EnvUser[] = [];
  membersListLoading = false;
  membersListLength = 0;

  projectId: string;

  constructor(
    public ref: DialogRef<AddEnvUserDialogData>,
    private fb: FormBuilder,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit() {
    this.addEnvUserForm = this.fb.group({
      envUserId: ['', [Validators.required, Validators.maxLength(255)]]
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  openUserSelect() {
    this.membersListLoading = true;

    let env: common.Env = this.ref.data.env;

    let apiService: ApiService = this.ref.data.apiService;

    let payload: apiToBackend.ToBackendGetMembersListRequestPayload = {
      projectId: env.projectId
    };

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMembersList,
        payload: payload
      })
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetMembersListResponse) =>
            resp.payload.membersList
        ),
        tap(x => {
          this.membersList = x;
          this.membersListLoading = false;
          this.membersListLength = x.length - 1;
        }),
        take(1)
      )
      .subscribe();
  }

  add() {
    this.addEnvUserForm.markAllAsTouched();

    if (!this.addEnvUserForm.valid) {
      return;
    }

    this.ref.close();

    let dataEnv: common.Env = this.ref.data.env;

    let payload: apiToBackend.ToBackendCreateEnvUserRequestPayload = {
      projectId: dataEnv.projectId,
      envId: dataEnv.envId,
      envUserId: this.addEnvUserForm.value.envUserId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEnvUser,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateEnvUserResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let environmentsState = this.environmentsQuery.getValue();

            let env = environmentsState.environments.find(
              x => x.envId === this.ref.data.env.envId
            );

            env.envUsers = [...env.envUsers, resp.payload.envUser].sort(
              (a, b) => (a.alias > b.alias ? 1 : b.alias > a.alias ? -1 : 0)
            );

            this.environmentsQuery.update({
              environments: [...environmentsState.environments]
            });
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
