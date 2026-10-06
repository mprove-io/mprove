import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  type FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendCreateEnvVarRequest } from '#common/types/backend/routes/envs/create-env-var/create-env-var-request';
import type { ToBackendCreateEnvVarResponse } from '#common/types/backend/routes/envs/create-env-var/create-env-var-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { EnvironmentsQuery } from '#front/app/queries/environments.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

export interface AddEvDialogData {
  apiService: ApiService;
  projectId: string;
  envId: string;
}

@Component({
  selector: 'm-add-ev-dialog',
  templateUrl: './add-ev-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class AddEvDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: AddEvDialogData = this.ref.data;

  addEvForm: FormGroup<{
    evId: FormControl<string>;
    val: FormControl<string>;
  }>;

  constructor(
    public ref: DialogRef<AddEvDialogData>,
    private fb: FormBuilder,
    private memberQuery: MemberQuery,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit() {
    this.addEvForm = this.fb.group({
      evId: this.fb.control<string>(undefined, [
        Validators.required,
        ValidationService.envVariableNameWrongChars,
        Validators.maxLength(128)
      ]),
      val: this.fb.control<string>(undefined, [Validators.maxLength(255)])
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  add() {
    this.addEvForm.markAllAsTouched();

    if (!this.addEvForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendCreateEnvVarRequest['input'] = {
      projectId: this.dataItem.projectId,
      envId: this.dataItem.envId,
      evId: this.addEvForm.value.evId,
      val: isDefined(this.addEvForm.value.val) ? this.addEvForm.value.val : ''
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        route: 'api/ToBackendCreateEnvVar',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateEnvVarResponse) => {
          if (resp?.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);
            this.environmentsQuery.update({
              environments: resp.output.envs
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
