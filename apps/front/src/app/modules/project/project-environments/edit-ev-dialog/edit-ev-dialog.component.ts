import { CommonModule } from '@angular/common';
import {
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
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { Env } from '#common/interfaces/backend/env';
import { Ev } from '#common/interfaces/backend/ev';
import {
  ToBackendEditEnvVarRequestPayload,
  ToBackendEditEnvVarResponse
} from '#common/interfaces/to-backend/envs/to-backend-edit-env-var';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ApiService } from '~front/app/services/api.service';

export interface EditEvDialogData {
  apiService: ApiService;
  env: Env;
  ev: Ev;
}

@Component({
  selector: 'm-edit-ev-dialog',
  templateUrl: './edit-ev-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditEvDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: EditEvDialogData = this.ref.data;

  editEvForm: FormGroup;

  constructor(
    public ref: DialogRef<EditEvDialogData>,
    private fb: FormBuilder,
    private memberQuery: MemberQuery,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit() {
    this.editEvForm = this.fb.group({
      val: [this.dataItem.ev.val, [Validators.maxLength(255)]]
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  edit() {
    this.editEvForm.markAllAsTouched();

    if (!this.editEvForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendEditEnvVarRequestPayload = {
      projectId: this.dataItem.env.projectId,
      envId: this.dataItem.env.envId,
      evId: this.dataItem.ev.evId,
      val: isDefined(this.editEvForm.value.val) ? this.editEvForm.value.val : ''
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditEnvVar,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditEnvVarResponse) => {
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
