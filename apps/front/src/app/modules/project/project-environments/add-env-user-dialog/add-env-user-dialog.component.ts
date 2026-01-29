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
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { Env } from '#common/interfaces/backend/env';
import { EnvUser } from '#common/interfaces/backend/env-user';
import {
  ToBackendCreateEnvUserRequestPayload,
  ToBackendCreateEnvUserResponse
} from '#common/interfaces/to-backend/envs/to-backend-create-env-user';
import {
  ToBackendGetMembersListRequestPayload,
  ToBackendGetMembersListResponse
} from '#common/interfaces/to-backend/members/to-backend-get-members-list';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { EnvironmentsQuery } from '#front/app/queries/environments.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { ApiService } from '#front/app/services/api.service';

export interface AddEnvUserDialogData {
  apiService: ApiService;
  env: Env;
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
  }

  addEnvUserForm: FormGroup;

  env = this.ref.data.env;

  membersList: EnvUser[] = [];
  membersListLoading = false;
  membersListLength = 0;

  projectId: string;

  constructor(
    public ref: DialogRef<AddEnvUserDialogData>,
    private fb: FormBuilder,
    private memberQuery: MemberQuery,
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

    let env: Env = this.ref.data.env;

    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendGetMembersListRequestPayload = {
      projectId: env.projectId
    };

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetMembersList,
        payload: payload
      })
      .pipe(
        map(
          (resp: ToBackendGetMembersListResponse) => resp.payload.membersList
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

    let dataEnv: Env = this.ref.data.env;

    let payload: ToBackendCreateEnvUserRequestPayload = {
      projectId: dataEnv.projectId,
      envId: dataEnv.envId,
      envUserId: this.addEnvUserForm.value.envUserId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateEnvUser,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateEnvUserResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            this.environmentsQuery.update({ environments: resp.payload.envs });
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
