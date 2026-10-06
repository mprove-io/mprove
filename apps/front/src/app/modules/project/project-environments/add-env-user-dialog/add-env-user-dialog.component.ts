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
  type FormControl,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { map, take, tap } from 'rxjs/operators';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { Env } from '#common/types/backend/parts/env';
import type { EnvUser } from '#common/types/backend/parts/env-user';
import type { ToBackendCreateEnvUserOutput } from '#common/types/backend/routes/envs/create-env-user/create-env-user-output';
import type { ToBackendCreateEnvUserRequest } from '#common/types/backend/routes/envs/create-env-user/create-env-user-request';
import type { ToBackendCreateEnvUserResponse } from '#common/types/backend/routes/envs/create-env-user/create-env-user-response';
import type { ToBackendGetMembersListRequest } from '#common/types/backend/routes/members/get-members-list/get-members-list-request';
import type { ToBackendGetMembersListResponse } from '#common/types/backend/routes/members/get-members-list/get-members-list-response';
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

  addEnvUserForm: FormGroup<{
    envUserId: FormControl<string>;
  }>;

  env = this.ref.data.env;

  membersList: EnvUser[] = [];
  membersListLoading = false;
  membersListLength = 0;

  projectId: string;

  constructor(
    public ref: DialogRef<AddEnvUserDialogData>,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private memberQuery: MemberQuery,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit() {
    this.addEnvUserForm = this.fb.group({
      envUserId: this.fb.control<string>('', [
        Validators.required,
        Validators.maxLength(255)
      ])
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  openUserSelect() {
    this.membersListLoading = true;
    this.cd.detectChanges();

    let env: Env = this.ref.data.env;

    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendGetMembersListRequest['input'] = {
      projectId: env.projectId
    };

    apiService
      .req({
        route: 'api/ToBackendGetMembersList',
        payload: payload
      })
      .pipe(
        map(
          (resp: ToBackendGetMembersListResponse) =>
            unwrapBackendResponseOutput({ response: resp }).membersList
        ),
        tap(x => {
          this.membersList = x;
          this.membersListLoading = false;
          this.membersListLength = x.length - 1;
          this.cd.detectChanges();
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

    let payload: ToBackendCreateEnvUserRequest['input'] = {
      projectId: dataEnv.projectId,
      envId: dataEnv.envId,
      envUserId: this.addEnvUserForm.value.envUserId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendCreateEnvUser',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateEnvUserResponse) => {
          if (resp.type === 'Success') {
            let output: ToBackendCreateEnvUserOutput = resp.output;

            this.memberQuery.update(output.userMember);

            this.environmentsQuery.update({
              environments: output.envs
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
