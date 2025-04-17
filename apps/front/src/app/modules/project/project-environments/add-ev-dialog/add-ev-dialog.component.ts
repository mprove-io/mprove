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
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { ApiService } from '~front/app/services/api.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

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

  addEvForm: FormGroup;

  constructor(
    public ref: DialogRef<AddEvDialogData>,
    private fb: FormBuilder,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit() {
    this.addEvForm = this.fb.group({
      evId: [
        undefined,
        [
          Validators.required,
          ValidationService.envVariableNameWrongChars,
          Validators.maxLength(128)
        ]
      ],
      val: [undefined, [Validators.required, Validators.maxLength(255)]]
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

    let payload: apiToBackend.ToBackendCreateEnvVarRequestPayload = {
      projectId: this.dataItem.projectId,
      envId: this.dataItem.envId,
      evId: this.addEvForm.value.evId,
      val: this.addEvForm.value.val
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEnvVar,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateEnvVarResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let environmentsState = this.environmentsQuery.getValue();

            let env = environmentsState.environments.find(
              x => x.envId === this.dataItem.envId
            );

            env.evs = [...env.evs, resp.payload.ev].sort((a, b) =>
              a.evId > b.evId ? 1 : b.evId > a.evId ? -1 : 0
            );

            this.environmentsQuery.update({
              environments: [...environmentsState.environments],
              total: environmentsState.total
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
