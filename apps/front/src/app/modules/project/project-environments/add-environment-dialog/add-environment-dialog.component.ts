import { CommonModule } from '@angular/common';
import {
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
import { take, tap } from 'rxjs/operators';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { EnvironmentsQuery } from '~front/app/queries/environments.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface AddEnvironmentDialogData {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-add-environment-dialog',
  templateUrl: './add-environment-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class AddEnvironmentDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild('envId') envIdElement: ElementRef;

  dataItem: AddEnvironmentDialogData = this.ref.data;

  addEnvironmentForm: FormGroup;

  constructor(
    public ref: DialogRef<AddEnvironmentDialogData>,
    private fb: FormBuilder,
    private environmentsQuery: EnvironmentsQuery
  ) {}

  ngOnInit() {
    this.addEnvironmentForm = this.fb.group({
      envId: [undefined, [Validators.required, Validators.maxLength(255)]]
    });

    setTimeout(() => {
      this.envIdElement.nativeElement.focus();
    }, 0);
  }

  add() {
    this.addEnvironmentForm.markAllAsTouched();

    if (!this.addEnvironmentForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendCreateEnvRequestPayload = {
      projectId: this.dataItem.projectId,
      envId: this.addEnvironmentForm.value.envId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEnv,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateEnvResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let environment = resp.payload.env;

            let environmentsState = this.environmentsQuery.getValue();

            this.environmentsQuery.update({
              environments: [
                ...environmentsState.environments,
                environment
              ].sort((a, b) =>
                a.envId !== common.PROJECT_ENV_PROD &&
                b.envId === common.PROJECT_ENV_PROD
                  ? 1
                  : a.envId === common.PROJECT_ENV_PROD &&
                    b.envId !== common.PROJECT_ENV_PROD
                  ? -1
                  : a.envId > b.envId
                  ? 1
                  : b.envId > a.envId
                  ? -1
                  : 0
              )
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
