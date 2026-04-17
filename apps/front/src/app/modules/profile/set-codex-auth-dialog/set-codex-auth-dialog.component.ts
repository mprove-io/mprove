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
import type {
  ToBackendSetUserCodexAuthRequestPayload,
  ToBackendSetUserCodexAuthResponse
} from '#common/zod/to-backend/users/to-backend-set-user-codex-auth';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../../shared/shared.module';

export interface SetCodexAuthDialogData {
  apiService: ApiService;
}

@Component({
  selector: 'm-set-codex-auth-dialog',
  templateUrl: './set-codex-auth-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class SetCodexAuthDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  codexAuthForm: FormGroup;
  parseError: string | undefined;

  constructor(
    public ref: DialogRef<SetCodexAuthDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery
  ) {}

  ngOnInit() {
    this.codexAuthForm = this.fb.group({
      authJson: ['', [Validators.required]]
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    this.codexAuthForm.markAllAsTouched();
    this.parseError = undefined;

    if (!this.codexAuthForm.valid) {
      return;
    }

    let authJsonStr = this.codexAuthForm.value.authJson;

    try {
      JSON.parse(authJsonStr);
    } catch {
      this.parseError = 'Invalid JSON';
      return;
    }

    this.ref.close();

    let payload: ToBackendSetUserCodexAuthRequestPayload = {
      authJson: authJsonStr
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSetUserCodexAuth,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetUserCodexAuthResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            this.userQuery.update(user);
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
